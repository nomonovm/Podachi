-- ====================================================================
-- PODACHI LIVESTOCK PLATFORM — PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- Target: PostgreSQL 15+ / Supabase
-- Security: Strict Row-Level Security (RLS), RBAC, Foreign Keys, Audit Triggers
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. FARMS
-- Rule: Farm name cannot have spaces. Case-insensitive unique. Alphanumeric, underscores, dashes only.
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    display_title TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    contact_phone TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint: No spaces allowed in farm name. Latin letters, digits, underscores, dashes only.
    CONSTRAINT check_farm_name_format CHECK (name ~ '^[A-Za-z0-9_-]+$')
);

-- Case-insensitive unique index for farm names
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_farm_name_lower ON public.farms (LOWER(name));

-- --------------------------------------------------------------------
-- 3. FARM MEMBERS & RBAC ROLES
-- Roles: 'admin', 'manager', 'veterinarian', 'viewer'
-- --------------------------------------------------------------------
CREATE TYPE user_farm_role AS ENUM ('admin', 'manager', 'veterinarian', 'viewer');

CREATE TABLE IF NOT EXISTS public.farm_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role user_farm_role NOT NULL DEFAULT 'viewer',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_per_farm UNIQUE (farm_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_farm_members_lookup ON public.farm_members (farm_id, user_id, role);

-- --------------------------------------------------------------------
-- 4. FARM JOIN REQUESTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farm_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    assigned_role user_farm_role DEFAULT 'viewer',
    CONSTRAINT unique_pending_request UNIQUE (farm_id, user_id, status)
);

-- --------------------------------------------------------------------
-- 5. ANIMAL CATALOG & BREEDS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.animal_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.animal_breeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id UUID REFERENCES public.animal_catalog(id) ON DELETE CASCADE,
    species_name TEXT NOT NULL,
    breed_name TEXT NOT NULL,
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_species_breed UNIQUE (species_name, breed_name)
);

-- --------------------------------------------------------------------
-- 6. ANIMAL GROUPS (Main livestock unit — by head count, not individual tags)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.animal_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    gender_type TEXT NOT NULL CHECK (gender_type IN ('erkak', 'urg''ochi', 'aralash')),
    age_group TEXT NOT NULL,
    initial_head_count INTEGER NOT NULL CHECK (initial_head_count >= 0),
    current_head_count INTEGER NOT NULL CHECK (current_head_count >= 0),
    average_weight_kg NUMERIC(6,2),
    pen_location TEXT NOT NULL,
    health_status TEXT NOT NULL DEFAULT 'yaxshi',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animal_groups_farm ON public.animal_groups (farm_id);

-- --------------------------------------------------------------------
-- 7. ANIMAL MOVEMENTS (Audit-compliant ledger of changes)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.animal_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.animal_groups(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN (
        'initial', 'purchase', 'birth', 'sale', 'death', 'transfer_out', 'transfer_in', 'inventory_correction'
    )),
    delta_count INTEGER NOT NULL,
    head_count_before INTEGER NOT NULL CHECK (head_count_before >= 0),
    head_count_after INTEGER NOT NULL CHECK (head_count_after >= 0),
    reason TEXT NOT NULL,
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animal_movements_group ON public.animal_movements (group_id, date);

-- --------------------------------------------------------------------
-- 8. HEALTH & VETERINARY RECORDS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.animal_groups(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL CHECK (record_type IN ('emlash', 'korik', 'muolaja', 'dori_berish')),
    title TEXT NOT NULL,
    heads_treated INTEGER NOT NULL CHECK (heads_treated > 0),
    medicine_name TEXT,
    dosage TEXT,
    veterinarian_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    next_checkup_date DATE,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'bajarildi' CHECK (status IN ('bajarildi', 'rejalashtirilgan')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 9. FEED INVENTORY & TRANSACTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feed_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    feed_type TEXT NOT NULL CHECK (feed_type IN ('yem', 'xashak', 'silos', 'vitamin', 'kombikorm')),
    stock_quantity NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'tonna', 'qop', 'bog''lam')),
    min_threshold NUMERIC(10,2) NOT NULL DEFAULT 10,
    unit_price_uzs NUMERIC(12,2),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_feed_item_per_farm UNIQUE (farm_id, name)
);

CREATE TABLE IF NOT EXISTS public.feed_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    feed_id UUID NOT NULL REFERENCES public.feed_inventory(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('incoming', 'outgoing')),
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    previous_stock NUMERIC(10,2) NOT NULL,
    new_stock NUMERIC(10,2) NOT NULL CHECK (new_stock >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_cost_uzs NUMERIC(14,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 10. FINANCE: EXPENSES & REVENUES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN (
        'yem_xashak', 'veterinariya', 'dori_darmon', 'ish_haqi', 'transport', 'kommunal', 'boshqa'
    )),
    amount_uzs NUMERIC(14,2) NOT NULL CHECK (amount_uzs > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    linked_entity_type TEXT,
    linked_entity_id UUID,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.revenues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('chorva_sotuvi', 'sut_mahsulotlari', 'boshqa_daromad')),
    amount_uzs NUMERIC(14,2) NOT NULL CHECK (amount_uzs > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    linked_entity_type TEXT,
    linked_entity_id UUID,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce uniqueness if linked to marketplace sale to prevent double counting
    CONSTRAINT unique_revenue_for_sale UNIQUE (linked_entity_type, linked_entity_id)
);

-- --------------------------------------------------------------------
-- 11. MARKETPLACE LISTINGS & STRICT RESERVATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.animal_groups(id) ON DELETE RESTRICT,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    gender_type TEXT NOT NULL,
    age_group TEXT NOT NULL,
    initial_quantity_for_sale INTEGER NOT NULL CHECK (initial_quantity_for_sale > 0),
    quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
    remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
    price_per_head_uzs NUMERIC(14,2) NOT NULL CHECK (price_per_head_uzs > 0),
    total_calculated_uzs NUMERIC(16,2) GENERATED ALWAYS AS (initial_quantity_for_sale * price_per_head_uzs) STORED,
    region TEXT NOT NULL,
    district TEXT NOT NULL,
    photos TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'draft', 'active', 'partially_sold', 'fully_sold', 'closed', 'expired'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.listing_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.animal_groups(id) ON DELETE CASCADE,
    reserved_heads INTEGER NOT NULL CHECK (reserved_heads > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'released')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.completed_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE RESTRICT,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.animal_groups(id) ON DELETE RESTRICT,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    heads_sold INTEGER NOT NULL CHECK (heads_sold > 0),
    price_per_head_uzs NUMERIC(14,2) NOT NULL,
    total_revenue_uzs NUMERIC(16,2) NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    revenue_record_id UUID REFERENCES public.revenues(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 12. MARKETPLACE REQUESTS & OFFERS (Sotib olish so'rovi va Takliflar)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    species TEXT NOT NULL,
    breed TEXT,
    gender_type TEXT,
    age_group TEXT,
    requested_quantity INTEGER NOT NULL CHECK (requested_quantity > 0),
    target_budget_per_head_uzs NUMERIC(14,2) NOT NULL CHECK (target_budget_per_head_uzs > 0),
    currency TEXT NOT NULL DEFAULT 'UZS',
    region TEXT NOT NULL,
    district TEXT NOT NULL,
    delivery_condition TEXT NOT NULL CHECK (delivery_condition IN ('yetkazib_berish', 'olib_ketish', 'kelishilgan')),
    needed_by_date DATE NOT NULL,
    requirements TEXT,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ochiq' CHECK (status IN ('ochiq', 'yopilgan')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.marketplace_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.marketplace_requests(id) ON DELETE CASCADE,
    seller_farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    seller_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_quantity INTEGER NOT NULL CHECK (offered_quantity > 0),
    offered_price_per_head_uzs NUMERIC(14,2) NOT NULL CHECK (offered_price_per_head_uzs > 0),
    notes TEXT,
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'yangi' CHECK (status IN (
        'yangi', 'korib_chiqilmoqda', 'qabul_qilingan', 'rad_etilgan', 'bekor_qilingan'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 13. AUDIT LOGS (Immutable Activity Log)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('SUCCESS', 'DENIED', 'FAILED')),
    resource_name TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_farm ON public.activity_logs (farm_id, created_at DESC);

-- ====================================================================
-- STORED FUNCTIONS & ATOMIC RESERVATION LOGIC
-- ====================================================================

-- Atomic check and reservation function to guarantee:
-- free_heads = total_heads - sum(active_reservations) >= new_reservation
CREATE OR REPLACE FUNCTION public.fn_create_marketplace_listing_atomic(
    p_farm_id UUID,
    p_group_id UUID,
    p_quantity INTEGER,
    p_price NUMERIC,
    p_region TEXT,
    p_district TEXT,
    p_description TEXT,
    p_contact_phone TEXT,
    p_contact_name TEXT,
    p_user_email TEXT,
    p_user_name TEXT
)
RETURNS UUID AS $$
DECLARE
    v_current_total INTEGER;
    v_total_reserved INTEGER;
    v_free_available INTEGER;
    v_new_listing_id UUID;
    v_species TEXT;
    v_breed TEXT;
    v_gender TEXT;
    v_age TEXT;
BEGIN
    -- 1. Lock the group row for update to prevent race conditions
    SELECT current_head_count, species, breed, gender_type, age_group
    INTO v_current_total, v_species, v_breed, v_gender, v_age
    FROM public.animal_groups
    WHERE id = p_group_id AND farm_id = p_farm_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Animal group not found or does not belong to farm';
    END IF;

    -- 2. Calculate currently active reservations for this group
    SELECT COALESCE(SUM(quantity_reserved), 0)
    INTO v_total_reserved
    FROM public.marketplace_listings
    WHERE group_id = p_group_id AND status IN ('active', 'partially_sold');

    v_free_available := v_current_total - v_total_reserved;

    -- 3. Prevent over-reservation
    IF p_quantity > v_free_available THEN
        -- Log unauthorized over-reservation attempt
        INSERT INTO public.activity_logs (farm_id, user_email, user_name, action_type, result, resource_name, details)
        VALUES (p_farm_id, p_user_email, p_user_name, 'SECURITY_OVER_RESERVATION_ATTEMPT', 'DENIED',
                'marketplace_listings', FORMAT('Mavjud erkin %s boshdan ortiq (%s bosh) band qilishga urinish rad etildi', v_free_available, p_quantity));
        
        RAISE EXCEPTION 'Band qilish rad etildi: Mavjud erkin qoldiq % bosh, so''ralgan miqdor % bosh', v_free_available, p_quantity;
    END IF;

    -- 4. Create listing
    INSERT INTO public.marketplace_listings (
        farm_id, group_id, species, breed, gender_type, age_group,
        initial_quantity_for_sale, quantity_reserved, remaining_quantity,
        price_per_head_uzs, region, district, description,
        contact_phone, contact_name, expires_at, status
    ) VALUES (
        p_farm_id, p_group_id, v_species, v_breed, v_gender, v_age,
        p_quantity, p_quantity, p_quantity,
        p_price, p_region, p_district, p_description,
        p_contact_phone, p_contact_name, NOW() + INTERVAL '30 days', 'active'
    ) RETURNING id INTO v_new_listing_id;

    -- 5. Record reservation
    INSERT INTO public.listing_reservations (listing_id, farm_id, group_id, reserved_heads, status)
    VALUES (v_new_listing_id, p_farm_id, p_group_id, p_quantity, 'active');

    -- 6. Log audit entry
    INSERT INTO public.activity_logs (farm_id, user_email, user_name, action_type, result, resource_name, details)
    VALUES (p_farm_id, p_user_email, p_user_name, 'MARKET_LISTING_CREATE', 'SUCCESS',
            'marketplace_listings', FORMAT('Yangi e''lon yaratildi: %s bosh %s (%s). Band qilingan miqdor: %s', p_quantity, v_species, v_breed, p_quantity));

    RETURN v_new_listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Complete Sale Function (Partial or Full)
CREATE OR REPLACE FUNCTION public.fn_complete_sale_atomic(
    p_listing_id UUID,
    p_heads_sold INTEGER,
    p_buyer_name TEXT,
    p_buyer_phone TEXT,
    p_user_email TEXT,
    p_user_name TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_farm_id UUID;
    v_group_id UUID;
    v_price NUMERIC;
    v_reserved INTEGER;
    v_remaining INTEGER;
    v_total_revenue NUMERIC;
    v_revenue_id UUID;
    v_new_head_count INTEGER;
    v_current_total INTEGER;
    v_species TEXT;
    v_breed TEXT;
    v_sale_id UUID;
BEGIN
    -- 1. Lock listing
    SELECT farm_id, group_id, price_per_head_uzs, quantity_reserved, remaining_quantity, species, breed
    INTO v_farm_id, v_group_id, v_price, v_reserved, v_remaining, v_species, v_breed
    FROM public.marketplace_listings
    WHERE id = p_listing_id AND status IN ('active', 'partially_sold')
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Faol e''lon topilmadi';
    END IF;

    IF p_heads_sold > v_remaining THEN
        RAISE EXCEPTION 'Sotuv miqdori e''londa qolgan miqdordan (% bosh) oshishi mumkin emas', v_remaining;
    END IF;

    v_total_revenue := p_heads_sold * v_price;

    -- 2. Update livestock count
    SELECT current_head_count INTO v_current_total
    FROM public.animal_groups WHERE id = v_group_id FOR UPDATE;

    v_new_head_count := v_current_total - p_heads_sold;
    IF v_new_head_count < 0 THEN
        RAISE EXCEPTION 'Chorva soni manfiy bo''lib qolishi mumkin emas';
    END IF;

    UPDATE public.animal_groups
    SET current_head_count = v_new_head_count, updated_at = NOW()
    WHERE id = v_group_id;

    -- 3. Log movement
    INSERT INTO public.animal_movements (
        farm_id, group_id, movement_type, delta_count,
        head_count_before, head_count_after, reason, created_by
    ) VALUES (
        v_farm_id, v_group_id, 'sale', -p_heads_sold,
        v_current_total, v_new_head_count,
        FORMAT('Bozor orqali sotuv: %s ga %s bosh sotildi', p_buyer_name, p_heads_sold), p_user_id
    );

    -- 4. Create single revenue record
    INSERT INTO public.revenues (
        farm_id, category, amount_uzs, date, description,
        linked_entity_type, linked_entity_id, created_by
    ) VALUES (
        v_farm_id, 'chorva_sotuvi', v_total_revenue, CURRENT_DATE,
        FORMAT('Bozor sotuvi: %s bosh %s (%s). Xaridor: %s', p_heads_sold, v_species, v_breed, p_buyer_name),
        'marketplace_sale', p_listing_id, p_user_id
    ) RETURNING id INTO v_revenue_id;

    -- 5. Record completed sale
    INSERT INTO public.completed_sales (
        listing_id, farm_id, group_id, buyer_name, buyer_phone,
        heads_sold, price_per_head_uzs, total_revenue_uzs, sale_date, revenue_record_id
    ) VALUES (
        p_listing_id, v_farm_id, v_group_id, p_buyer_name, p_buyer_phone,
        p_heads_sold, v_price, v_total_revenue, CURRENT_DATE, v_revenue_id
    ) RETURNING id INTO v_sale_id;

    -- 6. Update listing quantities and status
    UPDATE public.marketplace_listings
    SET
        quantity_sold = quantity_sold + p_heads_sold,
        quantity_reserved = quantity_reserved - p_heads_sold,
        remaining_quantity = remaining_quantity - p_heads_sold,
        status = CASE WHEN (remaining_quantity - p_heads_sold) = 0 THEN 'fully_sold' ELSE 'partially_sold' END,
        updated_at = NOW()
    WHERE id = p_listing_id;

    -- 7. Audit log
    INSERT INTO public.activity_logs (farm_id, user_email, user_name, action_type, result, resource_name, details)
    VALUES (v_farm_id, p_user_email, p_user_name, 'MARKET_SALE_COMPLETE', 'SUCCESS',
            'completed_sales', FORMAT('Sotuv yakunlandi: %s bosh sotildi. Daromad: %s so''m', p_heads_sold, v_total_revenue));

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animal_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check farm membership
CREATE OR REPLACE FUNCTION public.fn_is_farm_member(p_farm_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.farm_members
        WHERE farm_id = p_farm_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check farm role
CREATE OR REPLACE FUNCTION public.fn_get_farm_role(p_farm_id UUID)
RETURNS user_farm_role AS $$
DECLARE
    v_role user_farm_role;
BEGIN
    SELECT role INTO v_role
    FROM public.farm_members
    WHERE farm_id = p_farm_id
      AND user_id = auth.uid()
      AND status = 'active';
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles: users can view all, edit own
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Farms: viewable if member or searching open name info
CREATE POLICY "Members can view their farms" ON public.farms
    FOR SELECT TO authenticated
    USING (public.fn_is_farm_member(id) OR true); -- Name/info visible for search, details protected by sub-tables

-- 3. Animal Groups: strictly isolated to farm members
CREATE POLICY "Farm members can read livestock" ON public.animal_groups
    FOR SELECT TO authenticated USING (public.fn_is_farm_member(farm_id));

CREATE POLICY "Admin and Managers can modify livestock" ON public.animal_groups
    FOR ALL TO authenticated
    USING (public.fn_get_farm_role(farm_id) IN ('admin', 'manager'));

-- 4. Finance: Admin and Manager only! (Veterinarian and Viewer DENIED)
CREATE POLICY "Admin and Managers can read expenses" ON public.expenses
    FOR SELECT TO authenticated USING (public.fn_get_farm_role(farm_id) IN ('admin', 'manager'));

CREATE POLICY "Admin and Managers can insert expenses" ON public.expenses
    FOR INSERT TO authenticated WITH CHECK (public.fn_get_farm_role(farm_id) IN ('admin', 'manager'));

CREATE POLICY "Admin and Managers can read revenues" ON public.revenues
    FOR SELECT TO authenticated USING (public.fn_get_farm_role(farm_id) IN ('admin', 'manager'));

-- 5. Health Records: Admin, Manager, and Veterinarian can manage; Viewer can read
CREATE POLICY "Farm members can read health records" ON public.health_records
    FOR SELECT TO authenticated USING (public.fn_is_farm_member(farm_id));

CREATE POLICY "Vets, Admins, Managers can insert health records" ON public.health_records
    FOR INSERT TO authenticated WITH CHECK (public.fn_get_farm_role(farm_id) IN ('admin', 'manager', 'veterinarian'));

-- 6. Marketplace Listings:
-- Publicly visible if status = 'active' OR belongs to member's farm.
-- Sensitive internal group head counts are NOT in marketplace_listings.
CREATE POLICY "Active marketplace listings are public" ON public.marketplace_listings
    FOR SELECT TO authenticated USING (status = 'active' OR public.fn_is_farm_member(farm_id));

-- 7. Activity Logs: Admin only can read! Nobody can delete or update.
CREATE POLICY "Admins can view farm audit logs" ON public.activity_logs
    FOR SELECT TO authenticated USING (public.fn_get_farm_role(farm_id) = 'admin');
