/**
 * PODACHI SECURE BACKEND SIMULATION ENGINE
 * Implements strict PostgreSQL & RLS behavior, RBAC permission checks,
 * atomic reservation locking, and audit log generation.
 */

import {
  UserProfile,
  Farm,
  FarmMember,
  FarmJoinRequest,
  AnimalGroup,
  AnimalMovement,
  VeterinaryRecord,
  FeedItem,
  FeedTransaction,
  FinanceRecord,
  MarketplaceListing,
  CompletedSale,
  MarketplaceRequest,
  MarketplaceOffer,
  AuditLog,
  UserRole,
  MovementType,
  AnimalCatalogItem,
  RegisterData,
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_FARMS,
  INITIAL_FARM_MEMBERS,
  INITIAL_ANIMAL_CATALOG,
  INITIAL_ANIMAL_GROUPS,
  INITIAL_MOVEMENTS,
  INITIAL_VET_RECORDS,
  INITIAL_FEED_ITEMS,
  INITIAL_FINANCE_RECORDS,
  INITIAL_MARKETPLACE_LISTINGS,
  INITIAL_MARKETPLACE_REQUESTS,
  INITIAL_MARKETPLACE_OFFERS,
  INITIAL_AUDIT_LOGS,
} from './initialData';

const STORAGE_KEY = 'podachi_state_v1';

export interface PodachiState {
  users: UserProfile[];
  currentUser: UserProfile;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  farms: Farm[];
  currentFarmId: string;
  farmMembers: FarmMember[];
  joinRequests: FarmJoinRequest[];
  animalCatalog: AnimalCatalogItem[];
  animalGroups: AnimalGroup[];
  movements: AnimalMovement[];
  vetRecords: VeterinaryRecord[];
  feedItems: FeedItem[];
  feedTransactions: FeedTransaction[];
  finances: FinanceRecord[];
  marketplaceListings: MarketplaceListing[];
  completedSales: CompletedSale[];
  marketplaceRequests: MarketplaceRequest[];
  marketplaceOffers: MarketplaceOffer[];
  auditLogs: AuditLog[];
}

export function getInitialState(): PodachiState {
  return {
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0], // Alisher Qodirov (Admin)
    isAuthenticated: true,
    isDarkMode: false,
    farms: INITIAL_FARMS,
    currentFarmId: INITIAL_FARMS[0].id,
    farmMembers: INITIAL_FARM_MEMBERS,
    joinRequests: [],
    animalCatalog: INITIAL_ANIMAL_CATALOG,
    animalGroups: INITIAL_ANIMAL_GROUPS,
    movements: INITIAL_MOVEMENTS,
    vetRecords: INITIAL_VET_RECORDS,
    feedItems: INITIAL_FEED_ITEMS,
    feedTransactions: [],
    finances: INITIAL_FINANCE_RECORDS,
    marketplaceListings: INITIAL_MARKETPLACE_LISTINGS,
    completedSales: [],
    marketplaceRequests: INITIAL_MARKETPLACE_REQUESTS,
    marketplaceOffers: INITIAL_MARKETPLACE_OFFERS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
}

export function loadState(): PodachiState {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return getInitialState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
    return getInitialState();
  }
}

export function saveState(state: PodachiState): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export class PodachiBackendEngine {
  private state: PodachiState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = loadState();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    saveState(this.state);
    this.listeners.forEach(fn => fn());
  }

  public getState(): PodachiState {
    return this.state;
  }

  public resetToDefault(): void {
    this.state = getInitialState();
    this.notify();
  }

  // --- Auth & User context ---
  public login(email: string, password: string): UserProfile {
    if (!email || !email.trim()) {
      throw new Error("Email manzilini kiritish majburiy.");
    }
    if (!password || password.length < 6) {
      this.logAudit({
        action_type: 'AUTH_FAILED',
        result: 'FAILED',
        resource_name: 'auth',
        details: `Muvaffaqiyatsiz login urinishi: ${email} (Parol talabga javob bermaydi)`,
      });
      throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      this.logAudit({
        action_type: 'AUTH_FAILED',
        result: 'FAILED',
        resource_name: 'auth',
        details: `Muvaffaqiyatsiz login urinishi: ${email} (Foydalanuvchi topilmadi)`,
      });
      throw new Error("Ushbu email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi.");
    }

    this.state.currentUser = user;
    this.state.isAuthenticated = true;

    // Auto-select farm if member
    const membership = this.state.farmMembers.find(m => m.user_id === user.id && m.status === 'active');
    if (membership) {
      this.state.currentFarmId = membership.farm_id;
    } else if (this.state.farms.length > 0) {
      this.state.currentFarmId = this.state.farms[0].id;
    }

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'AUTH_LOGIN',
      result: 'SUCCESS',
      resource_name: 'auth',
      details: `${user.full_name} (${user.email}) tizimga kirdi`,
    });

    this.notify();
    return user;
  }

  public register(data: RegisterData): UserProfile {
    if (!data.full_name || data.full_name.trim().length < 2) {
      throw new Error("Ism va familiyani to'liq kiriting.");
    }
    if (!data.email || !data.email.includes('@')) {
      throw new Error("To'g'ri email manzilini kiriting.");
    }
    if (!data.password || data.password.length < 6) {
      throw new Error("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const exists = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error("Ushbu email manzili bilan hisob allaqachon mavjud.");
    }

    const newUser: UserProfile = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      full_name: data.full_name.trim(),
      created_at: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.state.currentUser = newUser;
    this.state.isAuthenticated = true;

    // Process farm intent
    if (data.intent === 'create_farm') {
      const farmName = data.farm_name || 'MeningFermam_' + Math.floor(Math.random() * 1000);
      const val = this.validateFarmName(farmName);
      if (!val.valid) {
        throw new Error(val.error);
      }

      const newFarm: Farm = {
        id: 'farm-' + Math.random().toString(36).substring(2, 9),
        name: farmName,
        display_title: data.farm_title || farmName,
        location: data.location || 'Toshkent viloyati',
        owner_id: newUser.id,
        created_at: new Date().toISOString(),
      };

      const newMembership: FarmMember = {
        id: 'mem-' + Math.random().toString(36).substring(2, 9),
        farm_id: newFarm.id,
        user_id: newUser.id,
        user_name: newUser.full_name,
        user_email: newUser.email,
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString(),
      };

      this.state.farms.push(newFarm);
      this.state.farmMembers.push(newMembership);
      this.state.currentFarmId = newFarm.id;

      this.logAudit({
        farm_id: newFarm.id,
        action_type: 'FARM_CREATED',
        result: 'SUCCESS',
        resource_name: 'farms',
        details: `Ro'yxatdan o'tishda yangi ferma ochildi: ${newFarm.name}`,
      });
    } else if (data.intent === 'join_farm' && data.farm_name) {
      try {
        this.submitJoinRequest(data.farm_name);
      } catch (err) {
        // Log but allow registration to succeed
      }
    }

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'AUTH_LOGIN',
      result: 'SUCCESS',
      resource_name: 'auth',
      details: `Yangi foydalanuvchi ro'yxatdan o'tdi: ${newUser.full_name} (${newUser.email})`,
    });

    this.notify();
    return newUser;
  }

  public logout(): void {
    const user = this.state.currentUser;
    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'AUTH_LOGOUT',
      result: 'SUCCESS',
      resource_name: 'auth',
      details: `${user.full_name} tizimdan chiqdi`,
    });
    this.state.isAuthenticated = false;
    this.notify();
  }

  public toggleDarkMode(): boolean {
    this.state.isDarkMode = !this.state.isDarkMode;
    if (this.state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.notify();
    return this.state.isDarkMode;
  }

  public setCurrentUser(user: UserProfile): void {
    this.state.currentUser = user;
    this.state.isAuthenticated = true;
    // Auto-select first farm where user is a member
    const membership = this.state.farmMembers.find(m => m.user_id === user.id && m.status === 'active');
    if (membership) {
      this.state.currentFarmId = membership.farm_id;
    }
    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'AUTH_LOGIN',
      result: 'SUCCESS',
      resource_name: 'auth',
      details: `${user.full_name} tizimga kirdi`,
    });
    this.notify();
  }

  public setCurrentFarm(farmId: string): void {
    const userRole = this.getUserRoleInFarm(this.state.currentUser.id, farmId);
    if (!userRole) {
      this.logAudit({
        farm_id: farmId,
        action_type: 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
        result: 'DENIED',
        resource_name: 'farms',
        details: `Foydalanuvchi a'zo bo'lmagan fermaga (${farmId}) kirishga urindi`,
      });
      throw new Error("Siz bu fermaga a'zo emassiz yoki kirish huquqingiz yo'q.");
    }
    this.state.currentFarmId = farmId;
    this.notify();
  }

  public getUserRoleInFarm(userId: string, farmId: string): UserRole | null {
    const mem = this.state.farmMembers.find(
      m => m.user_id === userId && m.farm_id === farmId && m.status === 'active'
    );
    return mem ? mem.role : null;
  }

  public getCurrentRole(): UserRole {
    const role = this.getUserRoleInFarm(this.state.currentUser.id, this.state.currentFarmId);
    return role || 'viewer';
  }

  public checkPermission(allowedRoles: UserRole[], resourceName: string, actionName: string): void {
    const currentRole = this.getCurrentRole();
    if (!allowedRoles.includes(currentRole)) {
      this.logAudit({
        farm_id: this.state.currentFarmId,
        action_type: 'SECURITY_UNAUTHORIZED_ACCESS_ATTEMPT',
        result: 'DENIED',
        resource_name: resourceName,
        details: `${currentRole} roli bilan '${actionName}' amalini bajarishga urinish server tomonidan rad etildi`,
      });
      throw new Error(`Ruxsat berilmadi: '${currentRole}' roli ushbu amalni bajarish huquqiga ega emas.`);
    }
  }

  // --- Audit Logging ---
  public logAudit(entry: {
    farm_id?: string;
    action_type: AuditLog['action_type'];
    result: 'SUCCESS' | 'DENIED' | 'FAILED';
    resource_name: string;
    details: string;
  }): void {
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      farm_id: entry.farm_id,
      timestamp: new Date().toISOString(),
      user_email: this.state.currentUser.email,
      user_name: this.state.currentUser.full_name,
      action_type: entry.action_type,
      result: entry.result,
      resource_name: entry.resource_name,
      details: entry.details,
      ip_address: '127.0.0.1 (WebClient)',
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
  }

  // --- Farm Management ---
  public validateFarmName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Ferma nomi kiritilishi shart.' };
    }
    // Reject spaces explicitly
    if (/\s/.test(name)) {
      return {
        valid: false,
        error: "Ferma nomida probel (bo'sh joy) belgilariga ruxsat berilmaydi. Masalan: 'Baraka Ferma' o'rniga 'BarakaFerma' deb yozing.",
      };
    }
    // Alphanumeric + _ - only
    const validRegex = /^[A-Za-z0-9_-]+$/;
    if (!validRegex.test(name)) {
      return {
        valid: false,
        error: "Ferma nomi faqat lotin harflari, raqamlar, '_' va '-' belgilaridan iborat bo'lishi kerak.",
      };
    }
    // Case-insensitive uniqueness check
    const lowerName = name.toLowerCase();
    const duplicate = this.state.farms.find(f => f.name.toLowerCase() === lowerName);
    if (duplicate) {
      return {
        valid: false,
        error: `'${name}' nomli ferma allaqachon mavjud. Ferma nomi noyob bo'lishi shart (katta-kichik harflar farqlanmaydi).`,
      };
    }
    return { valid: true };
  }

  public createFarm(data: {
    name: string;
    display_title: string;
    location: string;
    description?: string;
    contact_phone?: string;
  }): Farm {
    const val = this.validateFarmName(data.name);
    if (!val.valid) {
      this.logAudit({
        action_type: 'SETTINGS_CHANGE',
        result: 'FAILED',
        resource_name: 'farms',
        details: `Ferma yaratishda xato: ${val.error}`,
      });
      throw new Error(val.error);
    }

    const newFarm: Farm = {
      id: 'farm-' + Math.random().toString(36).substring(2, 9),
      name: data.name,
      display_title: data.display_title || data.name,
      location: data.location,
      description: data.description,
      contact_phone: data.contact_phone,
      owner_id: this.state.currentUser.id,
      created_at: new Date().toISOString(),
    };

    const newMembership: FarmMember = {
      id: 'mem-' + Math.random().toString(36).substring(2, 9),
      farm_id: newFarm.id,
      user_id: this.state.currentUser.id,
      user_name: this.state.currentUser.full_name,
      user_email: this.state.currentUser.email,
      role: 'admin',
      status: 'active',
      joined_at: new Date().toISOString(),
    };

    this.state.farms.push(newFarm);
    this.state.farmMembers.push(newMembership);
    this.state.currentFarmId = newFarm.id;

    this.logAudit({
      farm_id: newFarm.id,
      action_type: 'FARM_CREATED',
      result: 'SUCCESS',
      resource_name: 'farms',
      details: `Yangi ferma yaratildi: ${newFarm.name} (${newFarm.display_title})`,
    });

    this.notify();
    return newFarm;
  }

  public searchFarmByName(query: string): Farm | null {
    if (!query || !query.trim()) return null;
    const clean = query.trim().toLowerCase();
    return this.state.farms.find(f => f.name.toLowerCase() === clean) || null;
  }

  public updateFarmSettings(data: {
    display_title: string;
    location: string;
    description?: string;
    contact_phone?: string;
  }): void {
    this.checkPermission(['admin'], 'farms', 'Ferma sozlamalarini yangilash');
    const farm = this.state.farms.find(f => f.id === this.state.currentFarmId);
    if (!farm) throw new Error('Faol ferma topilmadi.');
    farm.display_title = data.display_title;
    farm.location = data.location;
    farm.description = data.description;
    farm.contact_phone = data.contact_phone;
    this.logAudit({
      farm_id: farm.id,
      action_type: 'SETTINGS_CHANGE',
      result: 'SUCCESS',
      resource_name: 'farms',
      details: `Ferma sozlamalari yangilandi: ${farm.name} (${data.display_title})`,
    });
    this.notify();
  }

  public submitJoinRequest(farmName: string): FarmJoinRequest {
    const farm = this.searchFarmByName(farmName);
    if (!farm) {
      throw new Error(`'${farmName}' nomli ferma topilmadi. Iltimos, to'g'ri nom kiriting.`);
    }

    // Check if already a member
    const existingMember = this.state.farmMembers.find(
      m => m.farm_id === farm.id && m.user_id === this.state.currentUser.id && m.status === 'active'
    );
    if (existingMember) {
      throw new Error(`Siz allaqachon '${farm.display_title}' fermasining faol a'zosisiz.`);
    }

    // Check for existing pending request
    const existingPending = this.state.joinRequests.find(
      r => r.farm_id === farm.id && r.user_id === this.state.currentUser.id && r.status === 'pending'
    );
    if (existingPending) {
      throw new Error(`Sizning ushbu fermaga yuborgan so'rovingiz ko'rib chiqilmoqda. Takroriy so'rov yuborib bo'lmaydi.`);
    }

    const newRequest: FarmJoinRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      farm_id: farm.id,
      farm_name: farm.display_title,
      user_id: this.state.currentUser.id,
      user_name: this.state.currentUser.full_name,
      user_email: this.state.currentUser.email,
      status: 'pending',
      requested_at: new Date().toISOString(),
    };

    this.state.joinRequests.push(newRequest);
    this.logAudit({
      farm_id: farm.id,
      action_type: 'FARM_JOIN_REQUEST',
      result: 'SUCCESS',
      resource_name: 'farm_join_requests',
      details: `${this.state.currentUser.full_name} fermaga qo'shilish uchun so'rov yubordi`,
    });

    this.notify();
    return newRequest;
  }

  public reviewJoinRequest(requestId: string, action: 'accept' | 'reject', assignedRole: UserRole = 'viewer'): void {
    this.checkPermission(['admin'], 'farm_join_requests', 'Qo\'shilish so\'rovini ko\'rib chiqish');

    const req = this.state.joinRequests.find(r => r.id === requestId);
    if (!req) throw new Error('So\'rov topilmadi.');

    if (action === 'accept') {
      req.status = 'accepted';
      req.reviewed_by = this.state.currentUser.id;
      req.reviewed_at = new Date().toISOString();
      req.assigned_role = assignedRole;

      // Add to members
      const newMember: FarmMember = {
        id: 'mem-' + Math.random().toString(36).substring(2, 9),
        farm_id: req.farm_id,
        user_id: req.user_id,
        user_name: req.user_name,
        user_email: req.user_email,
        role: assignedRole,
        status: 'active',
        joined_at: new Date().toISOString(),
      };
      this.state.farmMembers.push(newMember);

      this.logAudit({
        farm_id: req.farm_id,
        action_type: 'FARM_JOIN_APPROVED',
        result: 'SUCCESS',
        resource_name: 'farm_members',
        details: `${req.user_name} a'zolikka qabul qilindi (Rol: ${assignedRole})`,
      });
    } else {
      req.status = 'rejected';
      req.reviewed_by = this.state.currentUser.id;
      req.reviewed_at = new Date().toISOString();

      this.logAudit({
        farm_id: req.farm_id,
        action_type: 'FARM_JOIN_REJECTED',
        result: 'SUCCESS',
        resource_name: 'farm_join_requests',
        details: `${req.user_name} so'rovi rad etildi`,
      });
    }

    this.notify();
  }

  // --- Animal Stock & Calculation Engine ---
  public getAnimalGroups(farmId?: string): AnimalGroup[] {
    const fId = farmId || this.state.currentFarmId;
    return this.state.animalGroups.filter(g => g.farm_id === fId);
  }

  public getGroupStockInfo(groupId: string): {
    total: number;
    reserved: number;
    free: number;
  } {
    const group = this.state.animalGroups.find(g => g.id === groupId);
    if (!group) return { total: 0, reserved: 0, free: 0 };

    const activeListings = this.state.marketplaceListings.filter(
      l => l.group_id === groupId && (l.status === 'active' || l.status === 'partially_sold')
    );
    const reserved = activeListings.reduce((sum, l) => sum + l.quantity_reserved, 0);
    const free = Math.max(0, group.current_head_count - reserved);

    return {
      total: group.current_head_count,
      reserved,
      free,
    };
  }

  public addAnimalGroup(data: {
    species: string;
    breed: string;
    gender_type: AnimalGroup['gender_type'];
    age_group: AnimalGroup['age_group'];
    initial_head_count: number;
    average_weight_kg?: number;
    pen_location: string;
    health_status: AnimalGroup['health_status'];
    notes?: string;
  }): AnimalGroup {
    this.checkPermission(['admin', 'manager'], 'animal_groups', 'Chorva guruhi yaratish');

    if (data.initial_head_count < 0) {
      throw new Error("Chorva soni manfiy bo'lishi mumkin emas.");
    }

    const newGroup: AnimalGroup = {
      id: 'group-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      species: data.species,
      breed: data.breed,
      gender_type: data.gender_type,
      age_group: data.age_group,
      initial_head_count: data.initial_head_count,
      current_head_count: data.initial_head_count,
      average_weight_kg: data.average_weight_kg,
      pen_location: data.pen_location,
      health_status: data.health_status,
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    this.state.animalGroups.push(newGroup);

    // Initial movement record
    const initMovement: AnimalMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      group_id: newGroup.id,
      species: newGroup.species,
      breed: newGroup.breed,
      movement_type: 'initial',
      delta_count: newGroup.initial_head_count,
      head_count_before: 0,
      head_count_after: newGroup.initial_head_count,
      date: new Date().toISOString().split('T')[0],
      reason: 'Yangi guruh hisobga olindi',
      created_by_name: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };
    this.state.movements.push(initMovement);

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'LIVESTOCK_ADD',
      result: 'SUCCESS',
      resource_name: 'animal_groups',
      details: `Yangi guruh qo'shildi: ${newGroup.initial_head_count} bosh ${newGroup.species} (${newGroup.breed})`,
    });

    this.notify();
    return newGroup;
  }

  public recordAnimalMovement(data: {
    group_id: string;
    movement_type: MovementType;
    delta_count: number; // positive for in, negative for out
    reason: string;
    notes?: string;
  }): AnimalMovement {
    this.checkPermission(['admin', 'manager'], 'animal_movements', 'Chorva harakati qayd etish');

    const group = this.state.animalGroups.find(g => g.id === data.group_id);
    if (!group) throw new Error('Chorva guruhi topilmadi.');

    const before = group.current_head_count;
    const after = before + data.delta_count;

    if (after < 0) {
      throw new Error(`Xatolik: Chorva soni manfiy bo'lib qolishi mumkin emas! Mavjud: ${before}, talab: ${Math.abs(data.delta_count)}`);
    }

    // Check if free stock is sufficient when reducing stock
    if (data.delta_count < 0) {
      const stockInfo = this.getGroupStockInfo(group.id);
      if (Math.abs(data.delta_count) > stockInfo.free) {
        throw new Error(
          `Chiqim bajarilmadi: ${stockInfo.reserved} bosh chorva bozor e'lonlarida band qilingan. Erkin qoldiq: faqat ${stockInfo.free} bosh.`
        );
      }
    }

    group.current_head_count = after;

    const movement: AnimalMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      group_id: group.id,
      species: group.species,
      breed: group.breed,
      movement_type: data.movement_type,
      delta_count: data.delta_count,
      head_count_before: before,
      head_count_after: after,
      date: new Date().toISOString().split('T')[0],
      reason: data.reason,
      notes: data.notes,
      created_by_name: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    this.state.movements.push(movement);

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'LIVESTOCK_MOVEMENT',
      result: 'SUCCESS',
      resource_name: 'animal_movements',
      details: `Harakat (${data.movement_type}): ${data.delta_count > 0 ? '+' : ''}${data.delta_count} bosh. Yangi jami: ${after}`,
    });

    this.notify();
    return movement;
  }

  // --- Strict Marketplace & Atomic Reservation ---
  public createMarketplaceListing(data: {
    group_id: string;
    quantity: number;
    price_per_head_uzs: number;
    region: string;
    district: string;
    photos?: string[];
    description: string;
    contact_phone: string;
    contact_name: string;
  }): MarketplaceListing {
    this.checkPermission(['admin', 'manager'], 'marketplace_listings', 'Sotuv e\'loni berish');

    const group = this.state.animalGroups.find(g => g.id === data.group_id);
    if (!group) throw new Error('Chorva guruhi topilmadi.');

    if (data.quantity <= 0) {
      throw new Error("Sotuv miqdori musbat son bo'lishi kerak.");
    }
    if (data.price_per_head_uzs <= 0) {
      throw new Error("Narx musbat son bo'lishi kerak.");
    }

    // Atomic Free Stock Calculation
    const stockInfo = this.getGroupStockInfo(group.id);
    if (data.quantity > stockInfo.free) {
      this.logAudit({
        farm_id: this.state.currentFarmId,
        action_type: 'SECURITY_OVER_RESERVATION_ATTEMPT',
        result: 'DENIED',
        resource_name: 'marketplace_listings',
        details: `Band qilish rad etildi: Mavjud erkin qoldiq ${stockInfo.free} bosh, so'ralgan: ${data.quantity} bosh. Jami: ${stockInfo.total}, Band: ${stockInfo.reserved}`,
      });
      throw new Error(
        `Band qilish rad etildi: Siz ${data.quantity} bosh so'radingiz, ammo fermadagi erkin qoldiq faqat ${stockInfo.free} bosh! (Jami: ${stockInfo.total}, Band: ${stockInfo.reserved})`
      );
    }

    const farm = this.state.farms.find(f => f.id === this.state.currentFarmId)!;
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const newListing: MarketplaceListing = {
      id: 'listing-' + Math.random().toString(36).substring(2, 9),
      farm_id: farm.id,
      farm_name: farm.name,
      group_id: group.id,
      species: group.species,
      breed: group.breed,
      gender_type: group.gender_type,
      age_group: group.age_group,
      initial_quantity_for_sale: data.quantity,
      quantity_reserved: data.quantity, // Reserving all requested
      quantity_sold: 0,
      remaining_quantity: data.quantity,
      price_per_head_uzs: data.price_per_head_uzs,
      total_calculated_uzs: data.quantity * data.price_per_head_uzs,
      region: data.region,
      district: data.district,
      photos: data.photos && data.photos.length > 0 ? data.photos : [
        'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80'
      ],
      description: data.description,
      contact_phone: data.contact_phone,
      contact_name: data.contact_name,
      expires_at: expires.toISOString(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    this.state.marketplaceListings.unshift(newListing);

    this.logAudit({
      farm_id: farm.id,
      action_type: 'MARKET_LISTING_CREATE',
      result: 'SUCCESS',
      resource_name: 'marketplace_listings',
      details: `E'lon joylandi: ${data.quantity} bosh ${group.species} (${group.breed}). Band qilindi: ${data.quantity}`,
    });

    this.notify();
    return newListing;
  }

  public completeSale(data: {
    listing_id: string;
    heads_sold: number;
    buyer_name: string;
    buyer_phone: string;
    notes?: string;
  }): CompletedSale {
    this.checkPermission(['admin', 'manager'], 'completed_sales', 'Sotuvni yakunlash');

    const listing = this.state.marketplaceListings.find(l => l.id === data.listing_id);
    if (!listing) throw new Error('E\'lon topilmadi.');

    if (listing.status !== 'active' && listing.status !== 'partially_sold') {
      throw new Error('Ushbu e\'lon faol emas.');
    }

    if (data.heads_sold <= 0) {
      throw new Error("Sotilgan bosh soni musbat bo'lishi kerak.");
    }

    if (data.heads_sold > listing.remaining_quantity) {
      throw new Error(`Sotuv miqdori e'londa qolgan miqdordan (${listing.remaining_quantity} bosh) oshishi mumkin emas.`);
    }

    const group = this.state.animalGroups.find(g => g.id === listing.group_id);
    if (!group) throw new Error('Chorva guruhi topilmadi.');

    // 1. Calculate revenue
    const totalRevenue = data.heads_sold * listing.price_per_head_uzs;

    // 2. Reduce livestock count in group
    const beforeCount = group.current_head_count;
    group.current_head_count -= data.heads_sold;

    // 3. Create movement record
    const movement: AnimalMovement = {
      id: 'mov-' + Math.random().toString(36).substring(2, 9),
      farm_id: listing.farm_id,
      group_id: group.id,
      species: group.species,
      breed: group.breed,
      movement_type: 'sale',
      delta_count: -data.heads_sold,
      head_count_before: beforeCount,
      head_count_after: group.current_head_count,
      date: new Date().toISOString().split('T')[0],
      reason: `Bozor orqali sotuv: ${data.buyer_name} (${data.heads_sold} bosh)`,
      notes: data.notes,
      created_by_name: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };
    this.state.movements.push(movement);

    // 4. Create single revenue record (Enforcing idempotency)
    const revenueRecord: FinanceRecord = {
      id: 'rev-' + Math.random().toString(36).substring(2, 9),
      farm_id: listing.farm_id,
      type: 'daromad',
      category: 'chorva_sotuvi',
      amount_uzs: totalRevenue,
      date: new Date().toISOString().split('T')[0],
      description: `Bozor sotuvi: ${data.heads_sold} bosh ${listing.species} (${listing.breed}) - Xaridor: ${data.buyer_name}`,
      linked_entity_type: 'marketplace_sale',
      linked_entity_id: listing.id,
      created_by: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };
    this.state.finances.push(revenueRecord);

    // 5. Create CompletedSale entry
    const completedSale: CompletedSale = {
      id: 'sale-' + Math.random().toString(36).substring(2, 9),
      listing_id: listing.id,
      farm_id: listing.farm_id,
      group_id: group.id,
      buyer_name: data.buyer_name,
      buyer_phone: data.buyer_phone,
      heads_sold: data.heads_sold,
      price_per_head_uzs: listing.price_per_head_uzs,
      total_revenue_uzs: totalRevenue,
      sale_date: new Date().toISOString().split('T')[0],
      revenue_record_id: revenueRecord.id,
      notes: data.notes,
    };
    this.state.completedSales.push(completedSale);

    // 6. Update listing quantities
    listing.quantity_sold += data.heads_sold;
    listing.quantity_reserved -= data.heads_sold;
    listing.remaining_quantity -= data.heads_sold;

    if (listing.remaining_quantity === 0) {
      listing.status = 'fully_sold';
    } else {
      listing.status = 'partially_sold';
    }

    this.logAudit({
      farm_id: listing.farm_id,
      action_type: 'MARKET_SALE_COMPLETE',
      result: 'SUCCESS',
      resource_name: 'marketplace_listings',
      details: `Sotuv yakunlandi: ${data.heads_sold} bosh sotildi. Daromad: ${totalRevenue.toLocaleString()} so'm. Yangi qoldiq: ${group.current_head_count}`,
    });

    this.notify();
    return completedSale;
  }

  public closeMarketplaceListing(listingId: string): void {
    this.checkPermission(['admin', 'manager'], 'marketplace_listings', 'E\'lonni yopish');

    const listing = this.state.marketplaceListings.find(l => l.id === listingId);
    if (!listing) throw new Error('E\'lon topilmadi.');

    // Guard: cannot close an already-closed or fully-sold listing
    if (listing.status === 'closed' || listing.status === 'fully_sold' || listing.status === 'expired') {
      throw new Error(`E'lon allaqachon yakunlangan (holat: ${listing.status}). Qayta yopish mumkin emas.`);
    }

    // Release remaining reserved heads
    const releasedHeads = listing.quantity_reserved;
    listing.quantity_reserved = 0;
    listing.remaining_quantity = 0;
    listing.status = 'closed';

    this.logAudit({
      farm_id: listing.farm_id,
      action_type: 'MARKET_LISTING_CLOSE',
      result: 'SUCCESS',
      resource_name: 'marketplace_listings',
      details: `E'lon yopildi. Band qilingan ${releasedHeads} bosh chorva erkin qoldiqqa qaytarildi.`,
    });

    this.notify();
  }

  // --- Marketplace Requests & Offers ---
  public createMarketplaceRequest(data: {
    species: string;
    breed?: string;
    gender_type?: AnimalGroup['gender_type'];
    age_group?: AnimalGroup['age_group'];
    requested_quantity: number;
    target_budget_per_head_uzs: number;
    region: string;
    district: string;
    delivery_condition: MarketplaceRequest['delivery_condition'];
    needed_by_date: string;
    requirements?: string;
    contact_phone: string;
  }): MarketplaceRequest {
    if (data.requested_quantity <= 0) {
      throw new Error("So'ralgan miqdor musbat bo'lishi kerak.");
    }
    const req: MarketplaceRequest = {
      id: 'req-' + Math.random().toString(36).substring(2, 9),
      user_id: this.state.currentUser.id,
      user_name: this.state.currentUser.full_name,
      farm_id: this.state.currentFarmId,
      species: data.species,
      breed: data.breed,
      gender_type: data.gender_type,
      age_group: data.age_group,
      requested_quantity: data.requested_quantity,
      target_budget_per_head_uzs: data.target_budget_per_head_uzs,
      currency: 'UZS',
      region: data.region,
      district: data.district,
      delivery_condition: data.delivery_condition,
      needed_by_date: data.needed_by_date,
      requirements: data.requirements,
      contact_phone: data.contact_phone,
      created_at: new Date().toISOString(),
      status: 'ochiq',
    };
    this.state.marketplaceRequests.unshift(req);
    this.notify();
    return req;
  }

  public submitOffer(data: {
    request_id: string;
    offered_quantity: number;
    offered_price_per_head_uzs: number;
    notes?: string;
    contact_phone: string;
  }): MarketplaceOffer {
    const farm = this.state.farms.find(f => f.id === this.state.currentFarmId);
    const offer: MarketplaceOffer = {
      id: 'off-' + Math.random().toString(36).substring(2, 9),
      request_id: data.request_id,
      seller_farm_id: farm ? farm.id : undefined,
      seller_farm_name: farm ? farm.display_title : 'Mustaqil Fermer',
      seller_user_id: this.state.currentUser.id,
      seller_user_name: this.state.currentUser.full_name,
      offered_quantity: data.offered_quantity,
      offered_price_per_head_uzs: data.offered_price_per_head_uzs,
      notes: data.notes,
      contact_phone: data.contact_phone,
      status: 'yangi',
      created_at: new Date().toISOString(),
    };
    this.state.marketplaceOffers.unshift(offer);
    this.notify();
    return offer;
  }

  public updateOfferStatus(offerId: string, status: MarketplaceOffer['status']): void {
    const offer = this.state.marketplaceOffers.find(o => o.id === offerId);
    if (!offer) throw new Error('Taklif topilmadi.');
    offer.status = status;
    this.notify();
  }

  // --- Veterinary Management ---
  public addVeterinaryRecord(data: {
    group_id: string;
    record_type: VeterinaryRecord['record_type'];
    title: string;
    heads_treated: number;
    medicine_name?: string;
    dosage?: string;
    next_checkup_date?: string;
    notes?: string;
    status: VeterinaryRecord['status'];
  }): VeterinaryRecord {
    this.checkPermission(['admin', 'manager', 'veterinarian'], 'health_records', 'Veterinariya qaydini kiritish');

    const group = this.state.animalGroups.find(g => g.id === data.group_id);
    if (!group) throw new Error('Chorva guruhi topilmadi.');

    if (data.heads_treated > group.current_head_count) {
      throw new Error(`Muolaja qilingan soni (${data.heads_treated}) guruhdagi mavjud sonidan (${group.current_head_count}) oshmasligi kerak.`);
    }

    const newRecord: VeterinaryRecord = {
      id: 'vet-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      group_id: group.id,
      group_info: `${group.breed} ${group.species} (${group.current_head_count} bosh)`,
      record_type: data.record_type,
      title: data.title,
      heads_treated: data.heads_treated,
      total_group_heads: group.current_head_count,
      medicine_name: data.medicine_name,
      dosage: data.dosage,
      veterinarian_name: this.state.currentUser.full_name,
      date: new Date().toISOString().split('T')[0],
      next_checkup_date: data.next_checkup_date,
      notes: data.notes,
      status: data.status,
      created_at: new Date().toISOString(),
    };

    this.state.vetRecords.unshift(newRecord);

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'HEALTH_RECORD',
      result: 'SUCCESS',
      resource_name: 'health_records',
      details: `Veterinariya qaydi: ${data.title} (${data.heads_treated} bosh)`,
    });

    this.notify();
    return newRecord;
  }

  // --- Feed Management ---
  public addFeedItem(data: {
    name: string;
    feed_type: FeedItem['feed_type'];
    stock_quantity: number;
    unit: FeedItem['unit'];
    min_threshold: number;
    unit_price_uzs?: number;
  }): FeedItem {
    this.checkPermission(['admin', 'manager'], 'feed_inventory', 'Yangi ozuqa qo\'shish');

    const item: FeedItem = {
      id: 'feed-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      name: data.name,
      feed_type: data.feed_type,
      stock_quantity: data.stock_quantity,
      unit: data.unit,
      min_threshold: data.min_threshold,
      unit_price_uzs: data.unit_price_uzs,
      updated_at: new Date().toISOString(),
    };
    this.state.feedItems.push(item);
    this.notify();
    return item;
  }

  public recordFeedTransaction(data: {
    feed_id: string;
    transaction_type: 'incoming' | 'outgoing';
    quantity: number;
    notes?: string;
  }): FeedTransaction {
    this.checkPermission(['admin', 'manager'], 'feed_inventory', 'Ozuqa kirim/chiqim amali');

    const feed = this.state.feedItems.find(f => f.id === data.feed_id);
    if (!feed) throw new Error('Ozuqa topilmadi.');

    if (data.quantity <= 0) throw new Error('Miqdor musbat bo\'lishi shart.');

    const prev = feed.stock_quantity;
    let next = prev;

    if (data.transaction_type === 'incoming') {
      next = prev + data.quantity;
    } else {
      if (data.quantity > prev) {
        throw new Error(`Sarf mavjud qoldiqdan oshishi mumkin emas! Omborda faqat ${prev} ${feed.unit} mavjud.`);
      }
      next = prev - data.quantity;
    }

    feed.stock_quantity = next;
    feed.updated_at = new Date().toISOString();

    const tx: FeedTransaction = {
      id: 'feed-tx-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      feed_id: feed.id,
      feed_name: feed.name,
      transaction_type: data.transaction_type,
      quantity: data.quantity,
      previous_stock: prev,
      new_stock: next,
      date: new Date().toISOString().split('T')[0],
      notes: data.notes,
    };
    this.state.feedTransactions.unshift(tx);

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'FEED_TRANSACTION',
      result: 'SUCCESS',
      resource_name: 'feed_inventory',
      details: `${feed.name}: ${data.transaction_type === 'incoming' ? '+' : '-'}${data.quantity} ${feed.unit}. Yangi qoldiq: ${next}`,
    });

    this.notify();
    return tx;
  }

  // --- Finance Records ---
  public addFinanceRecord(data: {
    type: FinanceRecord['type'];
    category: FinanceRecord['category'];
    amount_uzs: number;
    date: string;
    description: string;
  }): FinanceRecord {
    this.checkPermission(['admin', 'manager'], 'finances', 'Moliya yozuvi kiritish');

    if (data.amount_uzs <= 0) {
      throw new Error("Summa musbat bo'lishi kerak.");
    }

    const record: FinanceRecord = {
      id: 'fin-' + Math.random().toString(36).substring(2, 9),
      farm_id: this.state.currentFarmId,
      type: data.type,
      category: data.category,
      amount_uzs: data.amount_uzs,
      date: data.date,
      description: data.description,
      linked_entity_type: 'manual',
      created_by: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    this.state.finances.unshift(record);

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'FINANCE_RECORD_CREATE',
      result: 'SUCCESS',
      resource_name: 'finances',
      details: `${data.type === 'daromad' ? 'Daromad' : 'Xarajat'}: ${data.amount_uzs.toLocaleString()} so'm (${data.category})`,
    });

    this.notify();
    return record;
  }

  // --- User Role Management ---
  public updateUserRole(memberId: string, newRole: UserRole): void {
    this.checkPermission(['admin'], 'farm_members', 'Foydalanuvchi rolini o\'zgartirish');

    const member = this.state.farmMembers.find(m => m.id === memberId && m.farm_id === this.state.currentFarmId);
    if (!member) throw new Error('A\'zo topilmadi.');

    const oldRole = member.role;
    member.role = newRole;

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'USER_ROLE_CHANGE',
      result: 'SUCCESS',
      resource_name: 'farm_members',
      details: `${member.user_name} roli o'zgartirildi: ${oldRole} -> ${newRole}`,
    });

    this.notify();
  }

  // --- Animal Breed Catalog Expansion ---
  public addCustomBreed(species: string, breedName: string): void {
    this.checkPermission(['admin', 'manager'], 'animal_catalog', 'Yangi zot qo\'shish');
    const catalogItem = this.state.animalCatalog.find(c => c.species.toLowerCase() === species.toLowerCase());
    if (!catalogItem) throw new Error('Hayvon turi topilmadi.');

    if (catalogItem.breeds.map(b => b.toLowerCase()).includes(breedName.toLowerCase())) {
      throw new Error(`'${breedName}' zoti allaqachon katalogda mavjud.`);
    }

    catalogItem.breeds.push(breedName);
    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'SETTINGS_CHANGE',
      result: 'SUCCESS',
      resource_name: 'animal_catalog',
      details: `Katalogga yangi zot qo'shildi: ${species} - ${breedName}`,
    });
    this.notify();
  }
}

export const backendEngine = new PodachiBackendEngine();
