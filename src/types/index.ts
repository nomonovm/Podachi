// PODACHI - Core TypeScript Type Definitions

export type UserRole = 'admin' | 'head_manager' | 'manager' | 'veterinarian' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  password?: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  intent: 'create_farm' | 'join_farm';
  farm_name?: string;
  farm_title?: string;
  location?: string;
}

export interface Farm {
  id: string;
  name: string; // Unique, case-insensitive, no spaces allowed (e.g., 'BarakaFerma')
  display_title: string;
  location: string;
  description?: string;
  contact_phone?: string;
  owner_id: string;
  created_at: string;
  total_heads?: number;
}

export interface FarmMember {
  id: string;
  farm_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  joined_at: string;
}

export type JoinRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface FarmJoinRequest {
  id: string;
  farm_id: string;
  farm_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: JoinRequestStatus;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  assigned_role?: UserRole;
}

export interface AnimalBreed {
  id: string;
  species: string;
  breed_name: string;
  description?: string;
  is_custom?: boolean;
}

export interface AnimalCatalogItem {
  id: string;
  species: string;
  category: 'Mayda tuyoqli' | 'Yirik shoxli' | 'Tuyasimon' | 'Otsimon' | 'Parranda' | 'Boshqa';
  icon: string;
  description: string;
  breeds: string[];
}

export type GenderType = 'erkak' | 'urg\'ochi' | 'aralash';
export type AgeGroup = 'Yosh (qo\'zichoq/buzoq/jo\'ja)' | 'O\'rtacha (boqilayotgan/naslli)' | 'Katta (yetuk chorva)';

export interface AnimalGroup {
  id: string;
  farm_id: string;
  species: string; // Qo'y, Echki, Qoramol, Ot, etc.
  breed: string;
  gender_type: GenderType;
  age_group: AgeGroup;
  initial_head_count: number;
  current_head_count: number;
  average_weight_kg?: number;
  pen_location: string; // Qo'ra yoki joylashuv
  health_status: 'a\'lo' | 'yaxshi' | 'parvarishda' | 'karantin';
  notes?: string;
  created_at: string;
}

export type MovementType = 
  | 'initial' 
  | 'purchase' 
  | 'birth' 
  | 'sale' 
  | 'death' 
  | 'transfer_out' 
  | 'transfer_in' 
  | 'inventory_correction';

export interface AnimalMovement {
  id: string;
  farm_id: string;
  group_id: string;
  species: string;
  breed: string;
  movement_type: MovementType;
  delta_count: number; // Musbat kirim, manfiy chiqim
  head_count_before: number;
  head_count_after: number;
  date: string;
  reason: string;
  notes?: string;
  created_by_name: string;
  created_at: string;
  is_cancelled?: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  total_price_uzs?: number;
  linked_finance_id?: string;
  listing_id?: string;
}

export interface DailyFarmCycleSummary {
  date: string;
  cowMilkingHeads: number;
  goatMilkingHeads: number;
  cowMilkLiters: number;
  goatMilkLiters: number;
  cowRevenue: number;
  goatRevenue: number;
  totalMilkRevenue: number;
  feedDeductions: { name: string; quantity: number; unit: string; currentStock: number }[];
  feedReplenishments: { name: string; quantity: number; unit: string; cost: number; currentStock: number; threshold: number }[];
  vetActions: { title: string; groupInfo: string; headsTreated: number; medicine: string; cost: number; recordId?: string }[];
  existingSpeciesFeedFormula?: {
    species: string;
    category: string;
    headCount: number;
    normBedaBoglam: number;
    normYemKg: number;
    normSilosTonna: number;
    totalBedaBoglam: number;
    totalYemKg: number;
    totalSilosTonna: number;
  }[];
}

export interface AnimalDailyFeedNorm {
  species: string;
  category: string;
  beda_daily_boglam: number;
  yem_daily_kg: number;
  silos_daily_tonna: number;
  milk_daily_liters?: number;
  milk_price_per_liter_uzs?: number;
}

export type VeterinaryRecordType = 'emlash' | 'korik' | 'muolaja' | 'dori_berish';

export interface VeterinaryRecord {
  id: string;
  farm_id: string;
  group_id: string;
  group_info: string;
  record_type: VeterinaryRecordType;
  title: string;
  heads_treated: number;
  total_group_heads: number;
  medicine_name?: string;
  dosage?: string;
  veterinarian_name: string;
  date: string;
  next_checkup_date?: string;
  notes?: string;
  status: 'bajarildi' | 'rejalashtirilgan';
  created_at: string;
}

export type FeedType = 'yem' | 'xashak' | 'silos' | 'vitamin' | 'kombikorm';
export type FeedUnit = 'kg' | 'tonna' | 'qop' | 'bog\'lam';

export interface FeedItem {
  id: string;
  farm_id: string;
  name: string;
  feed_type: FeedType;
  stock_quantity: number;
  unit: FeedUnit;
  min_threshold: number;
  unit_price_uzs?: number;
  updated_at: string;
}

export interface FeedTransaction {
  id: string;
  farm_id: string;
  feed_id: string;
  feed_name: string;
  transaction_type: 'incoming' | 'outgoing';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  date: string;
  notes?: string;
  total_cost_uzs?: number;
}

export type FinanceType = 'daromad' | 'xarajat';
export type ExpenseCategory = 'yem_xashak' | 'veterinariya' | 'dori_darmon' | 'ish_haqi' | 'transport' | 'kommunal' | 'boshqa';
export type RevenueCategory = 'chorva_sotuvi' | 'sut_mahsulotlari' | 'boshqa_daromad';

export interface FinanceRecord {
  id: string;
  farm_id: string;
  type: FinanceType;
  category: ExpenseCategory | RevenueCategory;
  amount_uzs: number;
  date: string;
  description: string;
  linked_entity_type?: 'marketplace_sale' | 'feed_purchase' | 'payroll_run' | 'manual';
  linked_entity_id?: string;
  created_by: string;
  created_at: string;
  is_cancelled?: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
}

export type ListingStatus = 'draft' | 'active' | 'partially_sold' | 'fully_sold' | 'closed' | 'expired';

export interface MarketplaceListing {
  id: string;
  farm_id: string;
  farm_name: string;
  group_id: string;
  species: string;
  breed: string;
  gender_type: GenderType;
  age_group: AgeGroup;
  initial_quantity_for_sale: number;
  quantity_reserved: number; // Band qilingan, hali sotilmagan
  quantity_sold: number;
  remaining_quantity: number; // E'londa qolgan sotuv miqdori
  price_per_head_uzs: number;
  total_calculated_uzs: number;
  region: string;
  district: string;
  photos: string[];
  description: string;
  contact_phone: string;
  contact_name: string;
  expires_at: string;
  status: ListingStatus;
  created_at: string;
}

export interface CompletedSale {
  id: string;
  listing_id: string;
  farm_id: string;
  group_id: string;
  buyer_name: string;
  buyer_phone: string;
  heads_sold: number;
  price_per_head_uzs: number;
  total_revenue_uzs: number;
  sale_date: string;
  revenue_record_id: string;
  notes?: string;
}

export interface MarketplaceRequest {
  id: string;
  user_id: string;
  user_name: string;
  farm_id?: string;
  species: string;
  breed?: string;
  gender_type?: GenderType;
  age_group?: AgeGroup;
  requested_quantity: number;
  target_budget_per_head_uzs: number;
  currency: 'UZS';
  region: string;
  district: string;
  delivery_condition: 'yetkazib_berish' | 'olib_ketish' | 'kelishilgan';
  needed_by_date: string;
  requirements?: string;
  contact_phone: string;
  created_at: string;
  status: 'ochiq' | 'yopilgan';
}

export type OfferStatus = 'yangi' | 'korib_chiqilmoqda' | 'qabul_qilingan' | 'rad_etilgan' | 'bekor_qilingan';

export interface MarketplaceOffer {
  id: string;
  request_id: string;
  seller_farm_id?: string;
  seller_farm_name: string;
  seller_user_id: string;
  seller_user_name: string;
  offered_quantity: number;
  offered_price_per_head_uzs: number;
  notes?: string;
  contact_phone: string;
  status: OfferStatus;
  created_at: string;
}

export type AuditActionType =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_FAILED'
  | 'USER_ROLE_CHANGE'
  | 'FARM_CREATED'
  | 'FARM_JOIN_REQUEST'
  | 'FARM_JOIN_APPROVED'
  | 'FARM_JOIN_REJECTED'
  | 'LIVESTOCK_ADD'
  | 'LIVESTOCK_MOVEMENT'
  | 'MARKET_LISTING_CREATE'
  | 'MARKET_RESERVATION_ADD'
  | 'MARKET_RESERVATION_RELEASE'
  | 'MARKET_SALE_COMPLETE'
  | 'MARKET_LISTING_CLOSE'
  | 'FEED_TRANSACTION'
  | 'FINANCE_RECORD_CREATE'
  | 'HEALTH_RECORD'
  | 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'SECURITY_OVER_RESERVATION_ATTEMPT'
  | 'AUTH_RATE_LIMIT_BLOCKED'
  | 'IP_BLOCKED_BRUTE_FORCE'
  | 'SECURITY_XSS_DETECTED'
  | 'SECURITY_SQLI_DETECTED'
  | 'SETTINGS_CHANGE'
  | 'PAYROLL_UPDATE'
  | 'PAYROLL_DISBURSED'
  | 'ADMIN_PROFIT_PAYOUT';

export interface AuditLog {
  id: string;
  farm_id?: string;
  timestamp: string;
  user_email: string;
  user_name: string;
  action_type: AuditActionType;
  result: 'SUCCESS' | 'DENIED' | 'FAILED' | 'BLOCKED';
  resource_name: string;
  details: string;
  ip_address?: string;
}

export interface SecurityTestCase {
  id: string;
  code: string;
  name: string;
  objective: string;
  expected_outcome: string;
  actual_outcome: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  execution_log?: string[];
  remediation_advice: string;
}

// --- Payroll & Salary Management Types ---
export type PayrollPeriodType = 'avans' | 'oylik';

export interface EmployeeSalaryConfig {
  user_id: string;
  user_name: string;
  user_email: string;
  role: UserRole;
  base_monthly_salary_uzs: number;
}

export interface EmployeePayoutItem {
  user_id: string;
  user_name: string;
  role: UserRole;
  base_monthly_salary_uzs: number;
  period_amount_uzs: number;
  status: 'paid';
}

export interface PayrollRunRecord {
  id: string;
  farm_id: string;
  period_year_month: string;
  period_type: PayrollPeriodType;
  period_label: string;
  payment_date: string;
  total_employee_payout_uzs: number;
  employees_paid: EmployeePayoutItem[];
  single_feed_cycle_cost_uzs: number;
  feed_reserve_cycles?: number; // Administrator tanlagan minimal ozuqa karraligi (masalan, 1x, 2x, 3x)
  feed_reserve_retained_uzs: number;
  farm_balance_before_run_uzs: number;
  admin_user_id?: string;
  admin_user_name?: string;
  admin_payout_uzs: number; // Rahbar sof foyda ulushi (dividend)
  farm_balance_after_run_uzs: number;
  finance_record_id?: string;
  is_cancelled?: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  created_by_name: string;
  created_by_role: UserRole;
  created_at: string;
}

export interface FarmFinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalAdminPayouts: number;
  farmBalance: number;
  singleFeedCycleCost: number;
  feedReserveCyclesCount: number; // Tanlangan zaxira karraligi (default: 2)
  feedReserveCyclesCost: number; // Tanlangan karralikka ko'ra zaxira summasi
  fiveCyclesFeedReserve: number; // backward compatibility
  adminAvailableSurplus: number;
}
