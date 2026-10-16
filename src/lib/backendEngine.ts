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
  DailyFarmCycleSummary,
  EmployeeSalaryConfig,
  PayrollPeriodType,
  EmployeePayoutItem,
  PayrollRunRecord,
  FarmFinancialSummary,
  AnimalDailyFeedNorm,
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

export const UNIVERSAL_ANIMAL_FEED_NORMS: Record<string, AnimalDailyFeedNorm> = {
  qoramol: {
    species: 'Qoramol',
    category: 'Yirik shoxli',
    beda_daily_boglam: 0.5,
    yem_daily_kg: 4.0,
    silos_daily_tonna: 0.015,
    milk_daily_liters: 20,
    milk_price_per_liter_uzs: 5500,
  },
  qoy: {
    species: 'Qo\'y',
    category: 'Mayda tuyoqli',
    beda_daily_boglam: 0.15,
    yem_daily_kg: 0.6,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  echki: {
    species: 'Echki',
    category: 'Mayda tuyoqli',
    beda_daily_boglam: 0.12,
    yem_daily_kg: 0.4,
    silos_daily_tonna: 0,
    milk_daily_liters: 1.8,
    milk_price_per_liter_uzs: 10000,
  },
  ot: {
    species: 'Ot',
    category: 'Otsimon',
    beda_daily_boglam: 0.4,
    yem_daily_kg: 3.0,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  tuya: {
    species: 'Tuya',
    category: 'Tuyasimon',
    beda_daily_boglam: 0.6,
    yem_daily_kg: 3.5,
    silos_daily_tonna: 0.01,
    milk_daily_liters: 4.0,
    milk_price_per_liter_uzs: 25000,
  },
  eshak: {
    species: 'Eshak',
    category: 'Otsimon',
    beda_daily_boglam: 0.2,
    yem_daily_kg: 1.0,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  tovuq: {
    species: 'Tovuq',
    category: 'Parranda',
    beda_daily_boglam: 0,
    yem_daily_kg: 0.12,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  ordak: {
    species: 'O\'rdak',
    category: 'Parranda',
    beda_daily_boglam: 0,
    yem_daily_kg: 0.18,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  goz: {
    species: 'G\'oz',
    category: 'Parranda',
    beda_daily_boglam: 0.02,
    yem_daily_kg: 0.25,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  kurka: {
    species: 'Kurka',
    category: 'Parranda',
    beda_daily_boglam: 0,
    yem_daily_kg: 0.25,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
  quyon: {
    species: 'Quyon',
    category: 'Boshqa',
    beda_daily_boglam: 0.03,
    yem_daily_kg: 0.15,
    silos_daily_tonna: 0,
    milk_daily_liters: 0,
    milk_price_per_liter_uzs: 0,
  },
};

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
  employeeSalaries?: Record<string, number>;
  payrollRuns?: PayrollRunRecord[];
  feedReserveCycles?: Record<string, number>;
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
    employeeSalaries: {
      'user-manager-1': 9000000,
      'user-vet-1': 7500000,
    },
    payrollRuns: [],
    feedReserveCycles: {
      'farm-baraka-1': 2,
    },
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

    let stateWasRepaired = false;

    if (!parsed.employeeSalaries) {
      parsed.employeeSalaries = {
        'user-manager-1': 9000000,
        'user-vet-1': 7500000,
      };
      stateWasRepaired = true;
    }

    if (!Array.isArray(parsed.payrollRuns)) {
      parsed.payrollRuns = [];
      stateWasRepaired = true;
    }

    if (!parsed.feedReserveCycles) {
      parsed.feedReserveCycles = {
        'farm-baraka-1': 2,
      };
      stateWasRepaired = true;
    }

    // Auto-sync missing feed purchases into finances if any exist in feedTransactions
    if (Array.isArray(parsed.feedTransactions) && Array.isArray(parsed.finances)) {
      parsed.feedTransactions.forEach((tx: FeedTransaction) => {
        if (tx.transaction_type === 'incoming') {
          const alreadyLinked = parsed.finances.some(
            (f: FinanceRecord) =>
              f.linked_entity_id === tx.id ||
              (f.linked_entity_type === 'feed_purchase' && f.date === tx.date && f.description.includes(tx.feed_name))
          );
          if (!alreadyLinked) {
            const feed = parsed.feedItems?.find((item: FeedItem) => item.id === tx.feed_id);
            const cost = tx.total_cost_uzs || (feed?.unit_price_uzs ? tx.quantity * feed.unit_price_uzs : 0);
            if (cost > 0) {
              tx.total_cost_uzs = cost;
              parsed.finances.unshift({
                id: 'fin-exp-' + Math.random().toString(36).substring(2, 9),
                farm_id: tx.farm_id,
                type: 'xarajat',
                category: 'yem_xashak',
                amount_uzs: cost,
                date: tx.date,
                description: `Ozuqa sotib olish: ${tx.quantity} ${feed?.unit || 'birlik'} ${tx.feed_name}${tx.notes ? ` (${tx.notes})` : ''}`,
                linked_entity_type: 'feed_purchase',
                linked_entity_id: tx.id,
                created_by: parsed.currentUser?.full_name || 'Boshqaruv Tizimi',
                created_at: new Date().toISOString(),
              });
            }
          }
        }
      });
    }

    // Auto-repair: Ferma administratorsiz qolmasligi va asosiy admin rolini qayta tiklash
    if (Array.isArray(parsed.farmMembers)) {
      parsed.farmMembers.forEach((m: FarmMember) => {
        if ((m.user_email === 'admin@podachi.uz' || m.user_id === 'user-admin-1') && m.role !== 'admin') {
          m.role = 'admin';
          stateWasRepaired = true;
        }
        // Upgrade Bobur Rustamov to head_manager
        if ((m.user_email === 'manager@podachi.uz' || m.user_id === 'user-manager-1') && m.role === 'manager') {
          m.role = 'head_manager';
          stateWasRepaired = true;
        }
      });
      if (Array.isArray(parsed.farms)) {
        parsed.farms.forEach((f: Farm) => {
          const hasAdmin = parsed.farmMembers.some((m: FarmMember) => m.farm_id === f.id && m.role === 'admin' && m.status === 'active');
          if (!hasAdmin) {
            const ownerOrFirst = parsed.farmMembers.find((m: FarmMember) => m.farm_id === f.id);
            if (ownerOrFirst && ownerOrFirst.role !== 'admin') {
              ownerOrFirst.role = 'admin';
              stateWasRepaired = true;
            }
          }
          // Ensure only 1 active head_manager per farm
          const headManagers = parsed.farmMembers.filter((m: FarmMember) => m.farm_id === f.id && m.role === 'head_manager' && m.status === 'active');
          if (headManagers.length > 1) {
            for (let i = 1; i < headManagers.length; i++) {
              headManagers[i].role = 'manager';
              stateWasRepaired = true;
            }
          }
        });
      }
    }

    if (stateWasRepaired) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch (err) {}
    }

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

  public getRoleTitle(role?: string): string {
    const r = role || this.getCurrentRole();
    const roleTitles: Record<string, string> = {
      admin: 'Administrator',
      head_manager: 'Bosh Menejer',
      manager: 'Menejer',
      veterinarian: 'Bosh Veterinar',
      viewer: 'Kuzatuvchi',
      watcher: 'Kuzatuvchi',
      worker: 'Chorvador',
    };
    return roleTitles[r] || r;
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
    user_email?: string;
    user_name?: string;
  }): void {
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      farm_id: entry.farm_id,
      timestamp: new Date().toISOString(),
      user_email: entry.user_email || this.state.currentUser.email,
      user_name: entry.user_name || this.state.currentUser.full_name,
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
      if (assignedRole === 'head_manager') {
        const existingHead = this.state.farmMembers.find(
          m => m.farm_id === req.farm_id && m.role === 'head_manager' && m.status === 'active'
        );
        if (existingHead) {
          throw new Error(`Fermada faqat bitta Bosh Menejer bo'lishi mumkin! Hozirgi Bosh Menejer: ${existingHead.user_name}. Boshqa rol (masalan, Menejer) tanlang.`);
        }
      }

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
    this.checkPermission(['admin', 'head_manager', 'manager'], 'animal_groups', 'Chorva guruhi yaratish');

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
    total_price_uzs?: number;
  }): AnimalMovement {
    this.checkPermission(['admin', 'head_manager', 'manager'], 'animal_movements', 'Chorva harakati qayd etish');

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
      total_price_uzs: data.total_price_uzs,
      created_by_name: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    // Agar to'g'ridan-to'g'ri sotuv bo'lsa va summa ko'rsatilgan bo'lsa, avtomatik Moliya daromadiga yoziladi
    if (data.movement_type === 'sale' && data.total_price_uzs && data.total_price_uzs > 0) {
      const revenueRecord: FinanceRecord = {
        id: 'rev-' + Math.random().toString(36).substring(2, 9),
        farm_id: this.state.currentFarmId,
        type: 'daromad',
        category: 'chorva_sotuvi',
        amount_uzs: data.total_price_uzs,
        date: movement.date,
        description: `Chorva sotuvi: ${Math.abs(data.delta_count)} bosh ${group.species} (${group.breed}) - Sabab: ${data.reason}`,
        linked_entity_type: 'marketplace_sale',
        linked_entity_id: movement.id,
        created_by: this.state.currentUser.full_name,
        created_at: new Date().toISOString(),
      };
      movement.linked_finance_id = revenueRecord.id;
      this.state.finances.unshift(revenueRecord);
    }

    this.state.movements.push(movement);

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'LIVESTOCK_MOVEMENT',
      result: 'SUCCESS',
      resource_name: 'animal_movements',
      details: `Harakat (${data.movement_type}): ${data.delta_count > 0 ? '+' : ''}${data.delta_count} bosh. Yangi jami: ${after}${
        data.total_price_uzs && data.total_price_uzs > 0 ? ` (Tushum: ${data.total_price_uzs.toLocaleString()} so'm)` : ''
      }`,
    });

    this.notify();
    return movement;
  }

  public cancelAnimalMovement(movementId: string): void {
    this.checkPermission(['admin', 'head_manager', 'manager'], 'animal_movements', 'Chorva harakatini bekor qilish');

    const mov = this.state.movements.find(m => m.id === movementId);
    if (!mov) throw new Error('Harakat qaydi topilmadi.');

    if (mov.is_cancelled) {
      throw new Error('Ushbu harakat allaqachon bekor qilingan.');
    }

    // 1. Guruhdagi chorva sonini dastlabki holatiga qaytarish
    const group = this.state.animalGroups.find(g => g.id === mov.group_id);
    if (group) {
      const reverted = group.current_head_count - mov.delta_count;
      if (reverted < 0) {
        throw new Error(`Bekor qilib bo'lmaydi: Guruhdagi chorva soni manfiy (${reverted}) bo'lib qoladi.`);
      }
      group.current_head_count = reverted;
    }

    mov.is_cancelled = true;
    mov.cancelled_at = new Date().toISOString();
    mov.cancelled_by = this.state.currentUser.full_name;

    // 2. Ushbu harakat orqali kelgan daromad (foyda) yoki xarajatni bekor qilish va balansni tiklash
    let cancelledFinanceDetails = '';
    const cancelFin = (fin: FinanceRecord) => {
      if (!fin.is_cancelled) {
        fin.is_cancelled = true;
        fin.cancelled_at = new Date().toISOString();
        fin.cancelled_by = this.state.currentUser.full_name;
        cancelledFinanceDetails += ` Biriktirilgan ${fin.type === 'daromad' ? 'daromad (foyda)' : 'xarajat'}: ${fin.amount_uzs.toLocaleString()} so'm bekor qilindi va balans avvalgi holatiga qaytarildi.`;
      }
    };

    if (mov.linked_finance_id) {
      const fin = this.state.finances.find(f => f.id === mov.linked_finance_id);
      if (fin) cancelFin(fin);
    }

    this.state.finances.forEach(f => {
      if (f.linked_entity_id === mov.id) {
        cancelFin(f);
      }
    });

    // Agar sotuv bo'lsa va to'g'ridan-to'g'ri bog'lanmagan bo'lsa, mos keluvchi daromadni topib bekor qilish
    if (mov.movement_type === 'sale' && !cancelledFinanceDetails) {
      const matchingFin = this.state.finances.find(f =>
        !f.is_cancelled &&
        f.farm_id === mov.farm_id &&
        f.type === 'daromad' &&
        f.category === 'chorva_sotuvi' &&
        (
          (mov.listing_id && f.linked_entity_id === mov.listing_id) ||
          (mov.reason && f.description.toLowerCase().includes(mov.reason.toLowerCase())) ||
          f.description.includes(mov.breed) ||
          f.date === mov.date
        )
      );
      if (matchingFin) cancelFin(matchingFin);
    }

    // 3. Agar bozor e'loni orqali sotilgan bo'lsa, e'londagi qoldiqni tiklash
    if (mov.listing_id) {
      const listing = this.state.marketplaceListings.find(l => l.id === mov.listing_id);
      if (listing) {
        const heads = Math.abs(mov.delta_count);
        listing.quantity_sold = Math.max(0, listing.quantity_sold - heads);
        listing.remaining_quantity += heads;
        listing.quantity_reserved = Math.min(listing.initial_quantity_for_sale, listing.quantity_reserved + heads);
        if (listing.status === 'fully_sold') {
          listing.status = 'active';
        }
      }
    }

    const roleLabel = this.getRoleTitle();

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'LIVESTOCK_MOVEMENT',
      result: 'SUCCESS',
      resource_name: 'animal_movements',
      details: `${roleLabel} (${this.state.currentUser.full_name}) tomonidan chorva harakati bekor qilindi: ${mov.species} (${mov.breed}) ${mov.delta_count > 0 ? '+' : ''}${mov.delta_count} bosh - '${mov.reason}'. Guruhdagi chorva soni avvalgi holatiga qaytarildi.${cancelledFinanceDetails}`,
    });

    this.notify();
  }

  public deleteAnimalMovement(movementId: string): void {
    // Faqat Administrator uchun va FAQATGINA bekor qilingan harakatlar uchun!
    this.checkPermission(['admin'], 'animal_movements', 'Chorva harakatini o\'chirish');

    const index = this.state.movements.findIndex(m => m.id === movementId);
    if (index === -1) throw new Error('Harakat qaydi topilmadi.');

    const mov = this.state.movements[index];
    if (!mov.is_cancelled) {
      throw new Error("Faqat bekor qilingan harakat qaydlarini butunlay o'chirish mumkin. Avval ushbu harakatni bekor qiling.");
    }

    this.state.movements.splice(index, 1);

    const roleLabel = this.getRoleTitle();

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'LIVESTOCK_MOVEMENT',
      result: 'SUCCESS',
      resource_name: 'animal_movements',
      details: `${roleLabel} (${this.state.currentUser.full_name}) tomonidan chorva harakati butunlay o'chirildi: ${mov.species} (${mov.breed}) ${mov.delta_count > 0 ? '+' : ''}${mov.delta_count} bosh - '${mov.reason}'.`,
    });

    this.notify();
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
    this.checkPermission(['admin', 'head_manager', 'manager'], 'marketplace_listings', 'Sotuv e\'loni berish');

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
    this.checkPermission(['admin', 'head_manager', 'manager'], 'completed_sales', 'Sotuvni yakunlash');

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

    // 3. Create single revenue record first so we have its ID
    const revenueRecordId = 'rev-' + Math.random().toString(36).substring(2, 9);
    const movementId = 'mov-' + Math.random().toString(36).substring(2, 9);

    const movement: AnimalMovement = {
      id: movementId,
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
      total_price_uzs: totalRevenue,
      listing_id: listing.id,
      linked_finance_id: revenueRecordId,
      created_by_name: this.state.currentUser.full_name,
      created_at: new Date().toISOString(),
    };
    this.state.movements.push(movement);

    // 4. Create single revenue record (Enforcing idempotency)
    const revenueRecord: FinanceRecord = {
      id: revenueRecordId,
      farm_id: listing.farm_id,
      type: 'daromad',
      category: 'chorva_sotuvi',
      amount_uzs: totalRevenue,
      date: new Date().toISOString().split('T')[0],
      description: `Bozor sotuvi: ${data.heads_sold} bosh ${listing.species} (${listing.breed}) - Xaridor: ${data.buyer_name}`,
      linked_entity_type: 'marketplace_sale',
      linked_entity_id: movementId,
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
    this.checkPermission(['admin', 'head_manager', 'manager'], 'marketplace_listings', 'E\'lonni yopish');

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
    this.checkPermission(['admin', 'head_manager', 'manager', 'veterinarian'], 'health_records', 'Veterinariya qaydini kiritish');

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
    this.checkPermission(['admin', 'head_manager', 'manager'], 'feed_inventory', 'Yangi ozuqa qo\'shish');

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

    const initialCost = (data.stock_quantity > 0 && data.unit_price_uzs && data.unit_price_uzs > 0)
      ? data.stock_quantity * data.unit_price_uzs
      : 0;

    if (data.stock_quantity > 0) {
      const today = new Date().toISOString().split('T')[0];
      const tx: FeedTransaction = {
        id: 'feed-tx-' + Math.random().toString(36).substring(2, 9),
        farm_id: this.state.currentFarmId,
        feed_id: item.id,
        feed_name: item.name,
        transaction_type: 'incoming',
        quantity: data.stock_quantity,
        previous_stock: 0,
        new_stock: data.stock_quantity,
        date: today,
        notes: 'Boshlang\'ich zaxira kiritildi',
        total_cost_uzs: initialCost > 0 ? initialCost : undefined,
      };
      this.state.feedTransactions.unshift(tx);

      if (initialCost > 0) {
        const finRecord: FinanceRecord = {
          id: 'fin-exp-' + Math.random().toString(36).substring(2, 9),
          farm_id: this.state.currentFarmId,
          type: 'xarajat',
          category: 'yem_xashak',
          amount_uzs: initialCost,
          date: today,
          description: `Yangi ozuqa zaxirasi xaridi: ${data.stock_quantity} ${data.unit} ${data.name}`,
          linked_entity_type: 'feed_purchase',
          linked_entity_id: tx.id,
          created_by: this.state.currentUser.full_name,
          created_at: new Date().toISOString(),
        };
        this.state.finances.unshift(finRecord);
      }
    }

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'FEED_TRANSACTION',
      result: 'SUCCESS',
      resource_name: 'feed_inventory',
      details: `Yangi ozuqa qo'shildi: ${data.name} (${data.stock_quantity} ${data.unit})${initialCost > 0 ? `, xarajat: ${initialCost.toLocaleString()} so'm` : ''}`,
    });

    this.notify();
    return item;
  }

  public recordFeedTransaction(data: {
    feed_id: string;
    transaction_type: 'incoming' | 'outgoing';
    quantity: number;
    unit_price_uzs?: number;
    total_cost_uzs?: number;
    notes?: string;
  }): FeedTransaction {
    this.checkPermission(['admin', 'head_manager', 'manager'], 'feed_inventory', 'Ozuqa kirim/chiqim amali');

    const feed = this.state.feedItems.find(f => f.id === data.feed_id);
    if (!feed) throw new Error('Ozuqa topilmadi.');

    if (data.quantity <= 0) throw new Error('Miqdor musbat bo\'lishi shart.');

    const prev = feed.stock_quantity;
    let next = prev;

    if (data.transaction_type === 'incoming') {
      next = prev + data.quantity;
      if (data.unit_price_uzs && data.unit_price_uzs > 0) {
        feed.unit_price_uzs = data.unit_price_uzs;
      }
    } else {
      if (data.quantity > prev) {
        throw new Error(`Sarf mavjud qoldiqdan oshishi mumkin emas! Omborda faqat ${prev} ${feed.unit} mavjud.`);
      }
      next = prev - data.quantity;
    }

    feed.stock_quantity = next;
    feed.updated_at = new Date().toISOString();

    const effectiveUnitPrice = data.unit_price_uzs ?? feed.unit_price_uzs ?? 0;
    const calculatedCost = data.total_cost_uzs ?? (data.transaction_type === 'incoming' && effectiveUnitPrice > 0 ? data.quantity * effectiveUnitPrice : 0);

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
      total_cost_uzs: calculatedCost > 0 ? calculatedCost : undefined,
    };
    this.state.feedTransactions.unshift(tx);

    // If incoming purchase with positive cost, automatically write to finance expenses
    if (data.transaction_type === 'incoming' && calculatedCost > 0) {
      const finRecord: FinanceRecord = {
        id: 'fin-exp-' + Math.random().toString(36).substring(2, 9),
        farm_id: this.state.currentFarmId,
        type: 'xarajat',
        category: 'yem_xashak',
        amount_uzs: calculatedCost,
        date: tx.date,
        description: `Ozuqa sotib olish: ${data.quantity} ${feed.unit} ${feed.name}${data.notes ? ` (${data.notes})` : ''}`,
        linked_entity_type: 'feed_purchase',
        linked_entity_id: tx.id,
        created_by: this.state.currentUser.full_name,
        created_at: new Date().toISOString(),
      };
      this.state.finances.unshift(finRecord);
    }

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'FEED_TRANSACTION',
      result: 'SUCCESS',
      resource_name: 'feed_inventory',
      details: `${feed.name}: ${data.transaction_type === 'incoming' ? '+' : '-'}${data.quantity} ${feed.unit}${calculatedCost > 0 ? ` (Xarajat: ${calculatedCost.toLocaleString()} so'm)` : ''}. Yangi qoldiq: ${next}`,
    });

    this.notify();
    return tx;
  }

  // --- Universal Animal Feed Calculation Formula (Ax + By + Cz = E) ---
  public getNormalizedSpeciesKey(species: string): string {
    const s = species.toLowerCase().replace(/['`’ʼ]/g, '');
    if (s.includes('qora') || s.includes('mol') || s.includes('sigir') || s.includes('buqa')) return 'qoramol';
    if (s.includes('qoy')) return 'qoy';
    if (s.includes('echki')) return 'echki';
    if (s.includes('ot') || s.includes('yilqi')) return 'ot';
    if (s.includes('tuya')) return 'tuya';
    if (s.includes('eshak')) return 'eshak';
    if (s.includes('tovuq') || s.includes('tuxum')) return 'tovuq';
    if (s.includes('ordak')) return 'ordak';
    if (s.includes('goz')) return 'goz';
    if (s.includes('kurka')) return 'kurka';
    if (s.includes('quyon')) return 'quyon';
    return 'boshqa';
  }

  public getSpeciesFeedNorm(species: string): AnimalDailyFeedNorm {
    const key = this.getNormalizedSpeciesKey(species);
    return UNIVERSAL_ANIMAL_FEED_NORMS[key] || {
      species,
      category: 'Boshqa',
      beda_daily_boglam: 0.1,
      yem_daily_kg: 0.5,
      silos_daily_tonna: 0,
      milk_daily_liters: 0,
      milk_price_per_liter_uzs: 0,
    };
  }

  public calculateFarmFeedFormula(farmGroups: AnimalGroup[]): {
    totalBedaDaily: number;
    totalYemDailyKg: number;
    totalSilosDailyTonna: number;
    totalHeads: number;
    existingSpeciesBreakdown: {
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
  } {
    // 1. Fermadagi barcha hayvonlarni turlari bo'yicha guruhlash (mavjud sonlar: x, y, z...)
    const speciesHeadCounts: Record<string, { count: number; displayName: string }> = {};

    farmGroups.forEach(g => {
      const key = this.getNormalizedSpeciesKey(g.species);
      if (!speciesHeadCounts[key]) {
        speciesHeadCounts[key] = { count: 0, displayName: g.species };
      }
      speciesHeadCounts[key].count += g.current_head_count;
    });

    let totalBeda = 0;
    let totalYem = 0;
    let totalSilos = 0;
    let totalHeads = 0;

    const existingSpeciesBreakdown: {
      species: string;
      category: string;
      headCount: number;
      normBedaBoglam: number;
      normYemKg: number;
      normSilosTonna: number;
      totalBedaBoglam: number;
      totalYemKg: number;
      totalSilosTonna: number;
    }[] = [];

    // 2. Universal formula: Ax + By + Cz = E
    // Barcha hayvon turlari hisobga olinadi. Fermada yo'q bo'lsa (By kabi holat), soni = 0 deb hisoblanadi.
    // Natijada faqat fermada mavjud bo'lgan (soni > 0) turlar ro'yxatda chiqariladi.
    Object.entries(UNIVERSAL_ANIMAL_FEED_NORMS).forEach(([key, norm]) => {
      const entry = speciesHeadCounts[key];
      const count = entry ? entry.count : 0; // Agar fermada yo'q bo'lsa: 0

      if (count > 0) {
        totalHeads += count;
        const subBeda = Math.round(count * norm.beda_daily_boglam * 10) / 10;
        const subYem = Math.round(count * norm.yem_daily_kg * 10) / 10;
        const subSilos = Math.round(count * norm.silos_daily_tonna * 100) / 100;

        totalBeda += subBeda;
        totalYem += subYem;
        totalSilos += subSilos;

        existingSpeciesBreakdown.push({
          species: entry ? entry.displayName : norm.species,
          category: norm.category,
          headCount: count,
          normBedaBoglam: norm.beda_daily_boglam,
          normYemKg: norm.yem_daily_kg,
          normSilosTonna: norm.silos_daily_tonna,
          totalBedaBoglam: subBeda,
          totalYemKg: subYem,
          totalSilosTonna: subSilos,
        });
      }
    });

    // Standart katalogdan tashqari boshqa kiritilgan har qanday zot/turlar
    Object.entries(speciesHeadCounts).forEach(([key, val]) => {
      if (!UNIVERSAL_ANIMAL_FEED_NORMS[key] && val.count > 0) {
        const norm = this.getSpeciesFeedNorm(val.displayName);
        totalHeads += val.count;
        const subBeda = Math.round(val.count * norm.beda_daily_boglam * 10) / 10;
        const subYem = Math.round(val.count * norm.yem_daily_kg * 10) / 10;
        const subSilos = Math.round(val.count * norm.silos_daily_tonna * 100) / 100;

        totalBeda += subBeda;
        totalYem += subYem;
        totalSilos += subSilos;

        existingSpeciesBreakdown.push({
          species: val.displayName,
          category: norm.category,
          headCount: val.count,
          normBedaBoglam: norm.beda_daily_boglam,
          normYemKg: norm.yem_daily_kg,
          normSilosTonna: norm.silos_daily_tonna,
          totalBedaBoglam: subBeda,
          totalYemKg: subYem,
          totalSilosTonna: subSilos,
        });
      }
    });

    return {
      totalBedaDaily: Math.round(totalBeda),
      totalYemDailyKg: Math.round(totalYem),
      totalSilosDailyTonna: Math.round(totalSilos * 10) / 10,
      totalHeads,
      existingSpeciesBreakdown,
    };
  }

  public isFeedNeededForExistingAnimals(
    feed: FeedItem,
    farmGroups: AnimalGroup[],
    feedFormula?: ReturnType<PodachiBackendEngine['calculateFarmFeedFormula']>
  ): boolean {
    const activeGroups = farmGroups.filter(g => g.current_head_count > 0);
    if (activeGroups.length === 0) return false;

    const formula = feedFormula || this.calculateFarmFeedFormula(activeGroups);
    if (formula.totalHeads === 0) return false;

    const existingSpecies = activeGroups.map(g => g.species.toLowerCase());
    const feedName = feed.name.toLowerCase();
    const feedType = feed.feed_type.toLowerCase();

    // 1. Jonivor nomi ozuqa nomida bevosita ko'rsatilgan bo'lsa (Masalan: tovuq yemi, quyon ozuqasi, ot yemi)
    const hasPoultryKeyword =
      feedName.includes('tovuq') ||
      feedName.includes('parranda') ||
      feedName.includes('jo\'ja') ||
      feedName.includes('joj') ||
      feedName.includes('o\'rdak') ||
      feedName.includes('ordak') ||
      feedName.includes('g\'oz') ||
      feedName.includes('goz') ||
      feedName.includes('kurka');

    if (hasPoultryKeyword) {
      const hasPoultryOnFarm = existingSpecies.some(
        s =>
          s.includes('tovuq') ||
          s.includes('parranda') ||
          s.includes('o\'rdak') ||
          s.includes('ordak') ||
          s.includes('g\'oz') ||
          s.includes('goz') ||
          s.includes('kurka')
      );
      if (!hasPoultryOnFarm) return false; // Fermada tovuq/parranda mavjud bo'lmasa, tovuq yemi hisoblanmaydi!
    }

    if (feedName.includes('quyon')) {
      const hasQuyon = existingSpecies.some(s => s.includes('quyon'));
      if (!hasQuyon) return false;
    }

    if (feedName.includes('ot ') || feedName.includes('otlar') || feedName.includes('toy')) {
      const hasOt = existingSpecies.some(s => s.includes('ot'));
      if (!hasOt) return false;
    }

    if (feedName.includes('tuya') || feedName.includes('bo\'taloq')) {
      const hasTuya = existingSpecies.some(s => s.includes('tuya'));
      if (!hasTuya) return false;
    }

    // 2. Ozuqa toifasiga ko'ra universal formuladagi sarf tekshiruvi:
    // Silos faqat qoramol va tuya kabi silos iste'mol qiluvchi mavjud jonivorlarga kerak
    if (feedType === 'silos' || feed.unit === 'tonna' || feedName.includes('silos')) {
      return formula.totalSilosDailyTonna > 0;
    }

    // Beda va xashak faqat beda iste'mol qiluvchi mavjud jonivorlarga kerak (masalan, tovuqda 0)
    if (feedType === 'xashak' || feed.unit === 'bog\'lam' || feedName.includes('beda') || feedName.includes('somon')) {
      return formula.totalBedaDaily > 0;
    }

    // Donli / aralash yem faqat yem iste'mol qiluvchi mavjud jonivorlarga kerak
    if (feedType === 'yem' || feed.unit === 'kg' || feedName.includes('yem') || feedName.includes('arpa') || feedName.includes('bug\'doy')) {
      return formula.totalYemDailyKg > 0;
    }

    // Vitamin va premikslar umumiy bosh soniga bog'liq
    if (feedType === 'vitamin' || feed.unit === 'qop' || feedName.includes('vitamin') || feedName.includes('premiks')) {
      return formula.totalHeads > 0;
    }

    return formula.totalHeads > 0;
  }

  /**
   * Universal formula (Ax + By + Cz = E) asosida faqat fermada mavjud hayvonlar uchun
   * minimal ozuqa to'ldirish me'yorini hisoblaydi (3 kunlik minimal ehtiyoj).
   * Agar fermada tegishli hayvon bo'lmasa (masalan tovuq 0 bosh), 0 qaytaradi.
   */
  public getFeedRestockQuantityForAnimals(
    feed: FeedItem,
    farmGroups?: AnimalGroup[],
    feedFormula?: ReturnType<PodachiBackendEngine['calculateFarmFeedFormula']>
  ): number {
    const targetFarmId = feed.farm_id || this.state.currentFarmId;
    const groups = farmGroups || this.state.animalGroups.filter(g => g.farm_id === targetFarmId && g.current_head_count > 0);
    if (groups.length === 0) return 0;

    const formula = feedFormula || this.calculateFarmFeedFormula(groups);
    if (formula.totalHeads === 0) return 0;

    if (!this.isFeedNeededForExistingAnimals(feed, groups, formula)) {
      return 0;
    }

    const feedType = feed.feed_type.toLowerCase();
    const feedName = feed.name.toLowerCase();
    const unit = feed.unit.toLowerCase();

    // Universal formula (Ax + By + Cz = E) bo'yicha mavjud hayvonlarning kunlik sarfi
    let dailyNeed = 0;
    if (feedType === 'xashak' || feedName.includes('beda') || unit === 'bog\'lam') {
      dailyNeed = formula.totalBedaDaily;
    } else if (feedType === 'yem' || unit === 'kg' || feedName.includes('yem') || feedName.includes('arpa') || feedName.includes('bug\'doy')) {
      dailyNeed = formula.totalYemDailyKg;
    } else if (feedType === 'silos' || unit === 'tonna' || feedName.includes('silos')) {
      dailyNeed = formula.totalSilosDailyTonna;
    } else if (feedType === 'vitamin' || unit === 'qop' || feedName.includes('vitamin') || feedName.includes('premiks')) {
      dailyNeed = formula.totalHeads > 0 ? 0.5 : 0;
    } else {
      dailyNeed = formula.totalHeads > 0 ? 1 : 0;
    }

    if (dailyNeed <= 0) return 0;

    // Minimal zaxiraga tushganda faqat mavjud hayvonlar uchun yetadigan to'ldirish me'yori (3 kunlik ehtiyoj)
    if (unit === 'tonna') {
      return Math.max(1, Math.round(dailyNeed * 3 * 10) / 10);
    }
    return Math.max(1, Math.ceil(dailyNeed * 3));
  }

  // --- Daily Farm Cycle Preview (Hisob-kitobni oldindan ko'rish, yangi yozuv yaratmaydi) ---
  public calculateDailyFarmCyclePreview(): DailyFarmCycleSummary {
    const today = new Date().toISOString().split('T')[0];
    const farmId = this.state.currentFarmId;

    const farmGroups = this.state.animalGroups.filter(g => g.farm_id === farmId);
    const farmFeed = this.state.feedItems.filter(f => f.farm_id === farmId);

    // 1. Qoramol va echkilarning kunlik sutini hisoblash
    let cowMilkingHeads = 0;
    let goatMilkingHeads = 0;

    farmGroups.forEach(g => {
      const species = g.species.toLowerCase();
      if (species.includes('qoramol')) {
        if (g.gender_type === 'urg\'ochi') {
          cowMilkingHeads += g.current_head_count;
        } else if (g.gender_type === 'aralash') {
          cowMilkingHeads += Math.floor(g.current_head_count * 0.6);
        }
      } else if (species.includes('echki')) {
        if (g.gender_type === 'urg\'ochi') {
          goatMilkingHeads += g.current_head_count;
        } else if (g.gender_type === 'aralash') {
          goatMilkingHeads += Math.floor(g.current_head_count * 0.6);
        }
      }
    });

    const cowMilkPerHead = 20; // 20 L/kun
    const goatMilkPerHead = 1.8; // 1.8 L/kun
    const cowPricePerLiter = 5500; // 5,500 so'm/L
    const goatPricePerLiter = 10000; // 10,000 so'm/L

    const cowMilkLiters = Math.round(cowMilkingHeads * cowMilkPerHead);
    const goatMilkLiters = Math.round(goatMilkingHeads * goatMilkPerHead);

    const cowRevenue = cowMilkLiters * cowPricePerLiter;
    const goatRevenue = goatMilkLiters * goatPricePerLiter;
    const totalMilkRevenue = cowRevenue + goatRevenue;

    // 2. Mavjud yemdan universal formula (Ax + By + Cz = E) bo'yicha kunlik sarfni hisoblash
    const feedFormula = this.calculateFarmFeedFormula(farmGroups);
    const bedaDaily = Math.round(feedFormula.totalBedaDaily);
    const yemDailyKg = Math.round(feedFormula.totalYemDailyKg);
    const silosDailyTonna = Math.round(feedFormula.totalSilosDailyTonna * 10) / 10;
    const vitaminDailyQop = feedFormula.totalHeads > 0 ? 1 : 0;

    const feedDeductions: { name: string; quantity: number; unit: string; currentStock: number }[] = [];

    farmFeed.forEach(feed => {
      if (!this.isFeedNeededForExistingAnimals(feed, farmGroups, feedFormula)) {
        return;
      }

      let consumeQty = 0;
      const ft = feed.feed_type;
      const nm = feed.name.toLowerCase();

      if (ft === 'xashak' || nm.includes('beda') || feed.unit === 'bog\'lam') {
        consumeQty = bedaDaily;
      } else if (ft === 'yem' || feed.unit === 'kg') {
        consumeQty = yemDailyKg;
      } else if (ft === 'silos' || feed.unit === 'tonna') {
        consumeQty = silosDailyTonna;
      } else if (ft === 'vitamin' || feed.unit === 'qop') {
        consumeQty = vitaminDailyQop;
      }

      if (consumeQty > 0) {
        feedDeductions.push({
          name: feed.name,
          quantity: Math.min(feed.stock_quantity, consumeQty),
          unit: feed.unit,
          currentStock: feed.stock_quantity,
        });
      }
    });

    // 3. Minimal chegaraga yetgan yemlarni avtomatik to'ldirish hisobi (faqat mavjud chorva uchun va FAQATGINA chegaraga yetgan ozuqa)
    const feedReplenishments: { name: string; quantity: number; unit: string; cost: number; currentStock: number; threshold: number }[] = [];

    farmFeed.forEach(feed => {
      if (!this.isFeedNeededForExistingAnimals(feed, farmGroups, feedFormula)) {
        return;
      }

      const deduction = feedDeductions.find(d => d.name === feed.name)?.quantity || 0;
      const stockAfterDeduct = feed.stock_quantity - deduction;

      // Qoida: minimal chegaraga faqatgina 1 ta ozuqa tushsa, hamma ozuqa emas, faqat o'sha ozuqa to'ldiriladi!
      if (stockAfterDeduct <= feed.min_threshold) {
        const restockQty = this.getFeedRestockQuantityForAnimals(feed, farmGroups, feedFormula);
        if (restockQty <= 0) return;

        const unitPrice = feed.unit_price_uzs || 30000;
        const totalCost = restockQty * unitPrice;

        feedReplenishments.push({
          name: feed.name,
          quantity: restockQty,
          unit: feed.unit,
          cost: totalCost,
          currentStock: feed.stock_quantity,
          threshold: feed.min_threshold,
        });
      }
    });

    // 4. Veterinariya bo'yicha profilaktik reja
    const vetActions: {
      title: string;
      groupInfo: string;
      headsTreated: number;
      medicine: string;
      cost: number;
    }[] = [];

    farmGroups.forEach(group => {
      const sp = group.species.toLowerCase();
      if (sp.includes('qoramol')) {
        vetActions.push({
          title: "Sog'in sigirlar kunlik mastit va sut gigiyenasi profilaktikasi",
          groupInfo: `${group.breed} ${group.species} (${group.current_head_count} bosh)`,
          headsTreated: group.current_head_count,
          medicine: "Kenotik dezinfeksiya eritmasi va D-vitamin",
          cost: 45000,
        });
      } else if (sp.includes('echki')) {
        vetActions.push({
          title: "Sog'in echkilar profilaktik ko'rigi va tuyoq gigiyenasi",
          groupInfo: `${group.breed} ${group.species} (${group.current_head_count} bosh)`,
          headsTreated: group.current_head_count,
          medicine: "Tuyoq dezinfeksiyasi uchun vanna eritmasi",
          cost: 35000,
        });
      } else if (sp.includes('qo\'y') || sp.includes('qoy')) {
        vetActions.push({
          title: "Suruvdagi qo'ylarning mavsumiy emlash va vitaminoterapiya ko'rigi",
          groupInfo: `${group.breed} ${group.species} (${group.current_head_count} bosh)`,
          headsTreated: Math.min(group.current_head_count, 50),
          medicine: "Albendazol 10% va mineral premiks",
          cost: 65000,
        });
      } else if (sp.includes('ot')) {
        vetActions.push({
          title: "Otlarning tuyoq, nafas va mushak faolligi tekshiruvi",
          groupInfo: `${group.breed} ${group.species} (${group.current_head_count} bosh)`,
          headsTreated: group.current_head_count,
          medicine: "Glukozali kalsiy eritmasi va tuyoq moyi",
          cost: 50000,
        });
      }
    });

    return {
      date: today,
      cowMilkingHeads,
      goatMilkingHeads,
      cowMilkLiters,
      goatMilkLiters,
      cowRevenue,
      goatRevenue,
      totalMilkRevenue,
      feedDeductions,
      feedReplenishments,
      vetActions,
      existingSpeciesFeedFormula: feedFormula.existingSpeciesBreakdown,
    };
  }

  // --- Daily Farm Cycle (Sut Tushumi, Yem Sarfi va Avto-To'ldirishni Qo'llash va Qaydlarni Saqlash) ---
  public processDailyFarmCycle(): DailyFarmCycleSummary {
    this.checkPermission(['admin', 'head_manager', 'manager', 'veterinarian'], 'daily_cycle', 'Kunlik siklni qayd etish');

    const today = new Date().toISOString().split('T')[0];
    const farmId = this.state.currentFarmId;

    // Mas'ul Bosh Menejer akkaunti
    const managerUser = this.state.users.find(u => u.email === 'manager@podachi.uz') || {
      full_name: 'Bobur Rustamov (Bosh Menejer)',
      email: 'manager@podachi.uz',
    };
    const managerName = managerUser.full_name;
    const managerEmail = managerUser.email;

    const farmGroups = this.state.animalGroups.filter(g => g.farm_id === farmId);
    const farmFeed = this.state.feedItems.filter(f => f.farm_id === farmId);

    // 1. Qoramol va echkilarning kunlik sutini hisoblash va daromadga yozish
    let cowMilkingHeads = 0;
    let goatMilkingHeads = 0;

    farmGroups.forEach(g => {
      const species = g.species.toLowerCase();
      if (species.includes('qoramol')) {
        if (g.gender_type === 'urg\'ochi') {
          cowMilkingHeads += g.current_head_count;
        } else if (g.gender_type === 'aralash') {
          cowMilkingHeads += Math.floor(g.current_head_count * 0.6);
        }
      } else if (species.includes('echki')) {
        if (g.gender_type === 'urg\'ochi') {
          goatMilkingHeads += g.current_head_count;
        } else if (g.gender_type === 'aralash') {
          goatMilkingHeads += Math.floor(g.current_head_count * 0.6);
        }
      }
    });

    const cowMilkPerHead = 20; // 20 L/kun
    const goatMilkPerHead = 1.8; // 1.8 L/kun
    const cowPricePerLiter = 5500; // 5,500 so'm/L
    const goatPricePerLiter = 10000; // 10,000 so'm/L

    const cowMilkLiters = Math.round(cowMilkingHeads * cowMilkPerHead);
    const goatMilkLiters = Math.round(goatMilkingHeads * goatMilkPerHead);

    const cowRevenue = cowMilkLiters * cowPricePerLiter;
    const goatRevenue = goatMilkLiters * goatPricePerLiter;
    const totalMilkRevenue = cowRevenue + goatRevenue;

    if (totalMilkRevenue > 0) {
      const milkRecord: FinanceRecord = {
        id: 'fin-rev-' + Math.random().toString(36).substring(2, 9),
        farm_id: farmId,
        type: 'daromad',
        category: 'sut_mahsulotlari',
        amount_uzs: totalMilkRevenue,
        date: today,
        description: `Kunlik sut sotuvi tushumi: ${cowMilkLiters} L sigir suti (${cowRevenue.toLocaleString()} so'm) va ${goatMilkLiters} L echki suti (${goatRevenue.toLocaleString()} so'm)`,
        linked_entity_type: 'manual',
        created_by: managerName,
        created_at: new Date().toISOString(),
      };
      this.state.finances.unshift(milkRecord);

      this.logAudit({
        farm_id: farmId,
        user_name: managerName,
        user_email: managerEmail,
        action_type: 'FINANCE_RECORD_CREATE',
        result: 'SUCCESS',
        resource_name: 'finances',
        details: `Menejer qaydi: Kunlik sut sotuvidan tushum kiritildi: ${totalMilkRevenue.toLocaleString()} so'm (${cowMilkLiters}L sigir, ${goatMilkLiters}L echki suti)`,
      });
    }

    // 2. Mavjud yemdan universal formula (Ax + By + Cz = E) bo'yicha sarfni ayirish
    const feedFormula = this.calculateFarmFeedFormula(farmGroups);
    const bedaDaily = Math.round(feedFormula.totalBedaDaily);
    const yemDailyKg = Math.round(feedFormula.totalYemDailyKg);
    const silosDailyTonna = Math.round(feedFormula.totalSilosDailyTonna * 10) / 10;
    const vitaminDailyQop = feedFormula.totalHeads > 0 ? 1 : 0;
    const totalHeads = feedFormula.totalHeads;

    const feedDeductions: DailyFarmCycleSummary['feedDeductions'] = [];

    farmFeed.forEach(feed => {
      if (!this.isFeedNeededForExistingAnimals(feed, farmGroups, feedFormula)) {
        return;
      }

      let consumeQty = 0;
      const ft = feed.feed_type;
      const nm = feed.name.toLowerCase();

      if (ft === 'xashak' || nm.includes('beda') || feed.unit === 'bog\'lam') {
        consumeQty = bedaDaily;
      } else if (ft === 'yem' || feed.unit === 'kg') {
        consumeQty = yemDailyKg;
      } else if (ft === 'silos' || feed.unit === 'tonna') {
        consumeQty = silosDailyTonna;
      } else if (ft === 'vitamin' || feed.unit === 'qop') {
        consumeQty = vitaminDailyQop;
      }

      if (consumeQty > 0) {
        const actualDeduct = Math.min(feed.stock_quantity, consumeQty);
        if (actualDeduct > 0) {
          const prev = feed.stock_quantity;
          const next = prev - actualDeduct;
          feed.stock_quantity = next;
          feed.updated_at = new Date().toISOString();

          const tx: FeedTransaction = {
            id: 'feed-tx-' + Math.random().toString(36).substring(2, 9),
            farm_id: farmId,
            feed_id: feed.id,
            feed_name: feed.name,
            transaction_type: 'outgoing',
            quantity: actualDeduct,
            previous_stock: prev,
            new_stock: next,
            date: today,
            notes: `Kunlik rejaviy sarf (${totalHeads} bosh chorva uchun)`,
          };
          this.state.feedTransactions.unshift(tx);
          feedDeductions.push({ name: feed.name, quantity: actualDeduct, unit: feed.unit, currentStock: next });
        }
      }
    });

    if (feedDeductions.length > 0) {
      this.logAudit({
        farm_id: farmId,
        user_name: managerName,
        user_email: managerEmail,
        action_type: 'FEED_TRANSACTION',
        result: 'SUCCESS',
        resource_name: 'feed_inventory',
        details: `Menejer qaydi: Kunlik ozuqa sarfi amalga oshirildi (${feedDeductions.map(f => `${f.name}: -${f.quantity} ${f.unit}`).join(', ')})`,
      });
    }

    // 3. Yem minimal chegara ogohlantirishiga (min_threshold) yetganda avtomatik sotib olish va xarajatlarga yozish (faqat mavjud chorva uchun)
    const feedReplenishments: DailyFarmCycleSummary['feedReplenishments'] = [];

    farmFeed.forEach(feed => {
      if (!this.isFeedNeededForExistingAnimals(feed, farmGroups, feedFormula)) {
        return;
      }

      // Qoida: minimal chegaraga faqatgina 1 ta ozuqa tushsa, faqat o'sha ozuqa sotib olinadi!
      if (feed.stock_quantity <= feed.min_threshold) {
        const restockQty = this.getFeedRestockQuantityForAnimals(feed, farmGroups, feedFormula);
        if (restockQty <= 0) return;

        const unitPrice = feed.unit_price_uzs || 30000;
        const totalCost = restockQty * unitPrice;

        const prev = feed.stock_quantity;
        const next = prev + restockQty;
        feed.stock_quantity = next;
        feed.updated_at = new Date().toISOString();

        const tx: FeedTransaction = {
          id: 'feed-tx-' + Math.random().toString(36).substring(2, 9),
          farm_id: farmId,
          feed_id: feed.id,
          feed_name: feed.name,
          transaction_type: 'incoming',
          quantity: restockQty,
          previous_stock: prev,
          new_stock: next,
          date: today,
          notes: `Minimal chegara ogohlantirishi (${prev} <= ${feed.min_threshold} ${feed.unit}): Menejer Bobur Rustamov nomidan avtomatik to'ldirish`,
          total_cost_uzs: totalCost,
        };
        this.state.feedTransactions.unshift(tx);

        const expenseRecord: FinanceRecord = {
          id: 'fin-exp-' + Math.random().toString(36).substring(2, 9),
          farm_id: farmId,
          type: 'xarajat',
          category: 'yem_xashak',
          amount_uzs: totalCost,
          date: today,
          description: `Minimal chegara xaridi: ${restockQty} ${feed.unit} ${feed.name} (Menejer tomonidan zaxira to'ldirildi)`,
          linked_entity_type: 'feed_purchase',
          linked_entity_id: tx.id,
          created_by: managerName,
          created_at: new Date().toISOString(),
        };
        this.state.finances.unshift(expenseRecord);

        this.logAudit({
          farm_id: farmId,
          user_name: managerName,
          user_email: managerEmail,
          action_type: 'FEED_TRANSACTION',
          result: 'SUCCESS',
          resource_name: 'feed_inventory',
          details: `Menejer Bobur Rustamov qaydi: ${feed.name} minimal chegaraga (${prev} <= ${feed.min_threshold} ${feed.unit}) yetgani sababli ${restockQty} ${feed.unit} sotib olindi (Xarajat: ${totalCost.toLocaleString()} so'm)`,
        });

        feedReplenishments.push({
          name: feed.name,
          quantity: restockQty,
          unit: feed.unit,
          cost: totalCost,
          currentStock: next,
          threshold: feed.min_threshold,
        });
      }
    });

    // 4. Veterinariya bo'yicha avtomatik profilaktik ko'rik va muolaja qaydlari (Dr. Jamshid Zokirov)
    const vetActions: {
      title: string;
      groupInfo: string;
      headsTreated: number;
      medicine: string;
      cost: number;
      recordId: string;
    }[] = [];

    const vetUser = this.state.users.find(u => u.email === 'vet@podachi.uz') || {
      full_name: 'Dr. Jamshid Zokirov (Bosh Veterinar)',
      email: 'vet@podachi.uz',
    };
    const vetName = vetUser.full_name;
    const vetEmail = vetUser.email;

    farmGroups.forEach(group => {
      const sp = group.species.toLowerCase();
      let shouldTreat = false;
      let title = '';
      let recordType: VeterinaryRecord['record_type'] = 'korik';
      let medicineName = '';
      let dosage = '';
      let notes = '';
      let medicineCost = 0;
      let headsTreated = group.current_head_count;

      if (sp.includes('qoramol')) {
        title = "Sog'in sigirlar kunlik mastit va sut gigiyenasi profilaktikasi";
        recordType = 'korik';
        medicineName = "Kenotik dezinfeksiya eritmasi va D-vitamin kompleksi";
        dosage = "Sog'ishdan keyin emchak uchlariga profilaktik ishlov";
        notes = "Umumiy klinik ko'rik o'tkazildi, elin salomatligi va sut gigiyenasi me'yorda.";
        medicineCost = 45000;
        shouldTreat = true;
      } else if (sp.includes('echki')) {
        title = "Sog'in echkilar profilaktik ko'rigi va tuyoq gigiyenasi";
        recordType = 'korik';
        medicineName = "Tuyoq dezinfeksiyasi uchun vanna eritmasi";
        dosage = "Yaylovdan qaytishda profilaktik vanna";
        notes = "Tuyoq va teri parazitlari profilaktikasi o'tkazildi, holati qoniqarli.";
        medicineCost = 35000;
        shouldTreat = true;
      } else if (sp.includes('qo\'y') || sp.includes('qoy')) {
        title = "Suruvdagi qo'ylarning mavsumiy emlash va vitaminoterapiya ko'rigi";
        recordType = 'dori_berish';
        medicineName = "Albendazol 10% va mineral premiks";
        dosage = "5 ml ichirish yo'li bilan va ozuqaga qo'shish";
        notes = "Ozuqalanish holati va umumiy immunitet mustahkamligi tekshirildi.";
        headsTreated = Math.min(group.current_head_count, 50);
        medicineCost = 65000;
        shouldTreat = true;
      } else if (sp.includes('ot')) {
        title = "Otlarning tuyoq, nafas va mushak faolligi tekshiruvi";
        recordType = 'korik';
        medicineName = "Glukozali kalsiy eritmasi va tuyoq moyi";
        dosage = "Profilaktik surtish va ko'rik";
        notes = "Yurak-qon tomir va harakat apparati me'yorda.";
        medicineCost = 50000;
        shouldTreat = true;
      }

      if (shouldTreat) {
        const nextDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
        const vetRecord: VeterinaryRecord = {
          id: 'vet-auto-' + Math.random().toString(36).substring(2, 9),
          farm_id: farmId,
          group_id: group.id,
          group_info: `${group.breed} ${group.species} (${group.current_head_count} bosh)`,
          record_type: recordType,
          title,
          heads_treated: headsTreated,
          total_group_heads: group.current_head_count,
          medicine_name: medicineName,
          dosage,
          veterinarian_name: vetName,
          date: today,
          next_checkup_date: nextDate,
          notes,
          status: 'bajarildi',
          created_at: new Date().toISOString(),
        };
        this.state.vetRecords.unshift(vetRecord);

        if (medicineCost > 0) {
          const finExpense: FinanceRecord = {
            id: 'fin-exp-' + Math.random().toString(36).substring(2, 9),
            farm_id: farmId,
            type: 'xarajat',
            category: 'veterinariya',
            amount_uzs: medicineCost,
            date: today,
            description: `Veterinariya profilaktika xarajati: ${title} (${medicineName})`,
            linked_entity_type: 'manual',
            linked_entity_id: vetRecord.id,
            created_by: vetName,
            created_at: new Date().toISOString(),
          };
          this.state.finances.unshift(finExpense);
        }

        this.logAudit({
          farm_id: farmId,
          user_name: vetName,
          user_email: vetEmail,
          action_type: 'HEALTH_RECORD',
          result: 'SUCCESS',
          resource_name: 'health_records',
          details: `Bosh Veterinar Dr. Jamshid Zokirov qaydi: ${title} (${headsTreated} bosh, xarajat: ${medicineCost.toLocaleString()} so'm)`,
        });

        vetActions.push({
          title,
          groupInfo: vetRecord.group_info,
          headsTreated,
          medicine: medicineName,
          cost: medicineCost,
          recordId: vetRecord.id,
        });
      }
    });

    try {
      localStorage.setItem('podachi_last_cycle_date', today);
    } catch (e) {}

    this.notify();

    return {
      date: today,
      cowMilkingHeads,
      goatMilkingHeads,
      cowMilkLiters,
      goatMilkLiters,
      cowRevenue,
      goatRevenue,
      totalMilkRevenue,
      feedDeductions,
      feedReplenishments,
      vetActions,
      existingSpeciesFeedFormula: feedFormula.existingSpeciesBreakdown,
    };
  }

  public runAutomatedVeterinaryCheck(): VeterinaryRecord[] {
    const cycle = this.processDailyFarmCycle();
    return this.state.vetRecords.slice(0, cycle.vetActions.length);
  }

  // --- Finance Records ---
  public addFinanceRecord(data: {
    type: FinanceRecord['type'];
    category: FinanceRecord['category'];
    amount_uzs: number;
    date: string;
    description: string;
  }): FinanceRecord {
    this.checkPermission(['admin', 'head_manager', 'manager'], 'finances', 'Moliya yozuvi kiritish');

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

  public cancelFinanceRecord(recordId: string): void {
    this.checkPermission(['admin', 'head_manager', 'manager'], 'finances', 'Moliya yozuvini bekor qilish');

    const record = this.state.finances.find(f => f.id === recordId);
    if (!record) throw new Error('Moliya yozuvi topilmadi.');

    if (record.is_cancelled) {
      throw new Error('Ushbu moliya yozuvi allaqachon bekor qilingan.');
    }

    if (record.category === 'veterinariya') {
      throw new Error("Veterinariya xarajatlarini bekor qilib bo'lmaydi: qilingan tibbiy muolaja yoki ishlatilgan dori vositalarini ortga qaytarish imkonsiz.");
    }

    record.is_cancelled = true;
    record.cancelled_at = new Date().toISOString();
    record.cancelled_by = this.state.currentUser.full_name;

    const roleLabel = this.getRoleTitle();

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'FINANCE_RECORD_CREATE',
      result: 'SUCCESS',
      resource_name: 'finances',
      details: `${roleLabel} (${this.state.currentUser.full_name}) tomonidan moliya yozuvi bekor qilindi: [${record.type === 'daromad' ? 'Daromad' : 'Xarajat'}] ${record.amount_uzs.toLocaleString()} so'm ('${record.description}'). Balans avvalgi holatiga qaytarildi.`,
    });

    this.notify();
  }

  public deleteFinanceRecord(recordId: string): void {
    // Faqat Administrator uchun va FAQATGINA bekor qilingan yozuvlar uchun!
    this.checkPermission(['admin'], 'finances', 'Moliya yozuvini o\'chirish');

    const index = this.state.finances.findIndex(f => f.id === recordId);
    if (index === -1) throw new Error('Moliya yozuvi topilmadi.');

    const record = this.state.finances[index];
    if (!record.is_cancelled) {
      throw new Error("Faqat bekor qilingan moliya yozuvlarini butunlay o'chirish mumkin. Avval yozuvni bekor qiling.");
    }

    this.state.finances.splice(index, 1);

    const roleLabel = this.getRoleTitle();

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'FINANCE_RECORD_CREATE',
      result: 'SUCCESS',
      resource_name: 'finances',
      details: `${roleLabel} (${this.state.currentUser.full_name}) tomonidan bekor qilingan moliya yozuvi butunlay o'chirildi: [${record.type === 'daromad' ? 'Daromad' : 'Xarajat'}] ${record.amount_uzs.toLocaleString()} so'm ('${record.description}').`,
    });

    this.notify();
  }

  // --- User Role Management ---
  public updateUserRole(memberId: string, newRole: UserRole): void {
    this.checkPermission(['admin'], 'farm_members', 'Foydalanuvchi rolini o\'zgartirish');

    const member = this.state.farmMembers.find(m => m.id === memberId && m.farm_id === this.state.currentFarmId);
    if (!member) throw new Error('A\'zo topilmadi.');

    // 1. Administrator o'zining rolini o'zi o'zgartira olmaydi
    if (member.user_id === this.state.currentUser.id) {
      throw new Error("Xavfsizlik qoidasi: Administrator o'zining rolini o'zgartira olmaydi!");
    }

    // 2. Ferma yagona administratorsiz qolib ketishi mumkin emas
    if (member.role === 'admin' && newRole !== 'admin') {
      const activeAdmins = this.state.farmMembers.filter(
        m => m.farm_id === this.state.currentFarmId && m.role === 'admin' && m.id !== member.id && m.status === 'active'
      );
      if (activeAdmins.length === 0) {
        throw new Error("Ferma administratorsiz qolishi mumkin emas! Avval boshqa a'zoga administrator huquqini bering.");
      }
    }

    // 3. Fermada faqat bitta Bosh Menejer bo'lishi mumkin (Menejer roli esa cheklanmagan)
    if (newRole === 'head_manager') {
      const existingHead = this.state.farmMembers.find(
        m => m.farm_id === this.state.currentFarmId && m.id !== member.id && m.role === 'head_manager' && m.status === 'active'
      );
      if (existingHead) {
        throw new Error(
          `Fermada faqat bitta Bosh Menejer bo'lishi mumkin! Hozirgi Bosh Menejer: ${existingHead.user_name}. Yangi Bosh Menejer tayinlash uchun avval mavjud Bosh Menejer rolini boshqa rolga (masalan, Menejer) o'zgartiring.`
        );
      }
    }

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

  public restoreAdminRole(): void {
    // Qaysi hisobda bo'lishidan qat'i nazar administratorlikni zudlik bilan qayta tiklaydi
    const curUserId = this.state.currentUser.id;
    let member = this.state.farmMembers.find(
      m => m.user_id === curUserId && m.farm_id === this.state.currentFarmId
    );

    if (!member) {
      member = this.state.farmMembers.find(
        m => m.user_email === 'admin@podachi.uz' && m.farm_id === this.state.currentFarmId
      );
    }

    if (member) {
      member.role = 'admin';
    }

    // Shuningdek, asosiy admin@podachi.uz a'zoligini ham tiklash
    const mainAdmin = this.state.farmMembers.find(m => m.user_email === 'admin@podachi.uz');
    if (mainAdmin) mainAdmin.role = 'admin';

    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'USER_ROLE_CHANGE',
      result: 'SUCCESS',
      resource_name: 'farm_members',
      details: `Administratorlik roli muvaffaqiyatli qayta tiklandi`,
    });

    this.notify();
  }

  // --- Animal Breed Catalog Expansion ---
  public addCustomBreed(species: string, breedName: string): void {
    this.checkPermission(['admin', 'head_manager', 'manager'], 'animal_catalog', 'Yangi zot qo\'shish');
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

  // --- Payroll & Salary Management ---

  public getFeedReplenishmentCycleCost(farmId?: string): number {
    const targetFarmId = farmId || this.state.currentFarmId;
    const farmGroups = this.state.animalGroups.filter(g => g.farm_id === targetFarmId && g.current_head_count > 0);
    const feedFormula = this.calculateFarmFeedFormula(farmGroups);

    // Agar fermada chorva mavjud bo'lmasa, ozuqa zaxirasi talab etilmaydi
    if (feedFormula.totalHeads === 0) {
      return 0;
    }

    const farmFeed = this.state.feedItems.filter(f => f.farm_id === targetFarmId);

    // Faqat mavjud hayvonlarga zarur ozuqa turlari uchun narxlarni hisoblash
    const singleFeedReplenishmentCosts: { feed: FeedItem; cost: number }[] = [];

    farmFeed.forEach(feed => {
      // Faqatgina fermada amalda mavjud bo'lgan hayvonlarga kerak bo'ladigan ozuqalar hisoblanadi
      // (Masalan: fermada tovuq yo'q bo'lsa, tovuq uchun minimal miqdor hisoblanmaydi)
      if (!this.isFeedNeededForExistingAnimals(feed, farmGroups, feedFormula)) {
        return;
      }

      const restockQty = this.getFeedRestockQuantityForAnimals(feed, farmGroups, feedFormula);
      if (restockQty <= 0) return;

      const unitPrice = feed.unit_price_uzs || 30000;
      const cost = restockQty * unitPrice;
      singleFeedReplenishmentCosts.push({ feed, cost });
    });

    if (singleFeedReplenishmentCosts.length === 0) {
      return 0;
    }

    // Foydalanuvchi qoidasi: "minimal chegaraga faqatgina 1 ta ozuqa turi tushsa hamma ozuqadan minimal qiymatda sotib olish kerak emas"
    // Ya'ni 1 martalik ozuqa zaxirasi - barcha ozuqalar summasi emas, balki 1 ta ozuqa turi minimal chegaraga yetganda
    // uni to'ldirishga yetadigan 1 ta ozuqa xaridi narxidir.
    const currentlyLowFeeds = singleFeedReplenishmentCosts.filter(
      item => item.feed.stock_quantity <= item.feed.min_threshold
    );

    if (currentlyLowFeeds.length > 0) {
      // Agar amalda qaysidir ozuqa(lar) minimal chegaraga tushgan bo'lsa, o'sha ozuqalar xarid narxi
      return currentlyLowFeeds.reduce((sum, item) => sum + item.cost, 0);
    }

    // Agar hali hech qaysi ozuqa chegaraga yetmagan bo'lsa, mavjud hayvonlar uchun eng asosiy (maksimal) 1 ta ozuqa xaridi narxi
    // (Masalan: beda yoki yem to'ldirish narxi)
    const maxSingleFeedCost = Math.max(...singleFeedReplenishmentCosts.map(item => item.cost));
    return maxSingleFeedCost;
  }

  public getFarmFeedReserveCycles(farmId?: string): number {
    const targetFarmId = farmId || this.state.currentFarmId;
    if (!this.state.feedReserveCycles) {
      this.state.feedReserveCycles = {};
    }
    return this.state.feedReserveCycles[targetFarmId] ?? 2;
  }

  public setFarmFeedReserveCycles(cycles: number, farmId?: string): void {
    this.checkPermission(['admin', 'head_manager'], 'payroll', 'Ozuqa zaxirasi karraligini o\'zgartirish');
    if (cycles < 0) throw new Error("Zaxira karraligi manfiy bo'lishi mumkin emas.");
    const targetFarmId = farmId || this.state.currentFarmId;
    if (!this.state.feedReserveCycles) {
      this.state.feedReserveCycles = {};
    }
    this.state.feedReserveCycles[targetFarmId] = cycles;

    this.logAudit({
      farm_id: targetFarmId,
      action_type: 'SETTINGS_CHANGE',
      result: 'SUCCESS',
      resource_name: 'payroll',
      details: `Administrator ozuqa zaxirasi daxlsiz qoldig'ini ${cycles} martalikka soziladi`,
    });

    this.notify();
  }

  public getFeedReserveCost(farmId?: string, customCycles?: number): number {
    const cycles = customCycles !== undefined ? customCycles : this.getFarmFeedReserveCycles(farmId);
    return this.getFeedReplenishmentCycleCost(farmId) * cycles;
  }

  public getTwoCyclesFeedReserve(farmId?: string): number {
    return this.getFeedReserveCost(farmId, 2);
  }

  public getFiveCyclesFeedReserve(farmId?: string): number {
    return this.getFeedReserveCost(farmId);
  }

  public getFarmBalance(farmId?: string): number {
    const summary = this.getFarmFinancialSummary(farmId);
    return summary.farmBalance;
  }

  public getFarmFinancialSummary(farmId?: string, customCycles?: number): FarmFinancialSummary {
    const targetFarmId = farmId || this.state.currentFarmId;
    const farmFinances = this.state.finances.filter(f => f.farm_id === targetFarmId && !f.is_cancelled);
    const totalRevenue = farmFinances.filter(f => f.type === 'daromad').reduce((sum, f) => sum + f.amount_uzs, 0);
    const totalExpenses = farmFinances.filter(f => f.type === 'xarajat').reduce((sum, f) => sum + f.amount_uzs, 0);
    const netProfit = totalRevenue - totalExpenses;

    const totalAdminPayouts = (this.state.payrollRuns || [])
      .filter(r => r.farm_id === targetFarmId)
      .reduce((sum, r) => sum + (r.admin_payout_uzs || 0), 0);

    const farmBalance = netProfit - totalAdminPayouts;
    const singleFeedCycleCost = this.getFeedReplenishmentCycleCost(targetFarmId);
    const cyclesCount = customCycles !== undefined ? customCycles : this.getFarmFeedReserveCycles(targetFarmId);
    const feedReserveCyclesCost = singleFeedCycleCost * cyclesCount;
    const adminAvailableSurplus = Math.max(0, farmBalance - feedReserveCyclesCost);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalAdminPayouts,
      farmBalance,
      singleFeedCycleCost,
      feedReserveCyclesCount: cyclesCount,
      feedReserveCyclesCost,
      fiveCyclesFeedReserve: feedReserveCyclesCost,
      adminAvailableSurplus,
    };
  }

  public getEmployeeSalaryConfigs(farmId?: string): EmployeeSalaryConfig[] {
    const targetFarmId = farmId || this.state.currentFarmId;
    const activeMembers = this.state.farmMembers.filter(
      m => m.farm_id === targetFarmId && m.status === 'active' && m.role !== 'admin' && m.role !== 'viewer'
    );

    const defaultSalariesByRole: Record<UserRole, number> = {
      admin: 0,
      head_manager: 9000000,
      manager: 6500000,
      veterinarian: 7500000,
      viewer: 0,
    };

    const salaryMap = this.state.employeeSalaries || {};

    return activeMembers.map(m => {
      const configuredSalary = salaryMap[m.user_id] ?? salaryMap[m.id];
      const baseSalary = configuredSalary !== undefined ? configuredSalary : (defaultSalariesByRole[m.role] || 5000000);
      return {
        user_id: m.user_id,
        user_name: m.user_name,
        user_email: m.user_email,
        role: m.role,
        base_monthly_salary_uzs: baseSalary,
      };
    });
  }

  public updateEmployeeBaseSalary(userId: string, newBaseSalaryUzs: number): void {
    this.checkPermission(['admin', 'head_manager'], 'payroll', 'Xodim oyligini o\'zgartirish');
    if (newBaseSalaryUzs < 0) throw new Error("Oylik maoshi manfiy bo'lishi mumkin emas.");

    if (!this.state.employeeSalaries) {
      this.state.employeeSalaries = {};
    }
    const salaries = this.state.employeeSalaries as Record<string, number>;
    salaries[userId] = newBaseSalaryUzs;

    const user = this.state.users.find(u => u.id === userId);
    this.logAudit({
      farm_id: this.state.currentFarmId,
      action_type: 'PAYROLL_UPDATE',
      result: 'SUCCESS',
      resource_name: 'payroll',
      details: `${user?.full_name || userId} oylik maoshi ${newBaseSalaryUzs.toLocaleString()} so'mga o'zgartirildi`,
    });

    this.notify();
  }

  public getCurrentPayrollPeriodInfo(dateStr?: string): {
    currentDay: number;
    periodType: PayrollPeriodType;
    periodYearMonth: string;
    periodLabel: string;
    isAlreadyPaid: boolean;
    paidRecord?: PayrollRunRecord;
  } {
    const date = dateStr ? new Date(dateStr) : new Date();
    const currentDay = date.getDate();
    const periodYearMonth = date.toISOString().slice(0, 7);
    const periodType: PayrollPeriodType = currentDay <= 15 ? 'avans' : 'oylik';

    const monthNames = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
    ];
    const monthName = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const periodLabel = periodType === 'avans'
      ? `${year}-yil ${monthName} (1-davr: Avans, 1-15 kunlari)`
      : `${year}-yil ${monthName} (2-davr: Oylik qoldig'i, 16-31 kunlari)`;

    const farmId = this.state.currentFarmId;
    const paidRecord = (this.state.payrollRuns || []).find(
      r => r.farm_id === farmId && r.period_year_month === periodYearMonth && r.period_type === periodType
    );

    return {
      currentDay,
      periodType,
      periodYearMonth,
      periodLabel,
      isAlreadyPaid: !!paidRecord,
      paidRecord,
    };
  }

  public previewPayrollDistribution(forcePeriodType?: PayrollPeriodType, paymentDateStr?: string, customReserveCycles?: number) {
    const farmId = this.state.currentFarmId;
    const date = paymentDateStr ? new Date(paymentDateStr) : new Date();
    const periodInfo = this.getCurrentPayrollPeriodInfo(paymentDateStr);
    const periodType = forcePeriodType || periodInfo.periodType;
    const reserveCycles = customReserveCycles !== undefined ? customReserveCycles : this.getFarmFeedReserveCycles(farmId);

    const employees = this.getEmployeeSalaryConfigs(farmId);
    const employeesPaid: EmployeePayoutItem[] = employees.map(e => ({
      user_id: e.user_id,
      user_name: e.user_name,
      role: e.role,
      base_monthly_salary_uzs: e.base_monthly_salary_uzs,
      period_amount_uzs: Math.round(e.base_monthly_salary_uzs / 2),
      status: 'paid',
    }));

    const totalEmployeePayout = employeesPaid.reduce((sum, e) => sum + e.period_amount_uzs, 0);

    const financialSummary = this.getFarmFinancialSummary(farmId, reserveCycles);
    const farmBalanceBefore = financialSummary.farmBalance;
    const singleFeedCost = financialSummary.singleFeedCycleCost;
    const feedReserveRetained = financialSummary.feedReserveCyclesCost;

    const balanceAfterEmployees = farmBalanceBefore - totalEmployeePayout;
    const adminPayout = Math.max(0, balanceAfterEmployees - feedReserveRetained);
    const farmBalanceAfter = balanceAfterEmployees - adminPayout;

    const adminMember = this.state.farmMembers.find(
      m => m.farm_id === farmId && m.role === 'admin' && m.status === 'active'
    );

    return {
      periodType,
      periodYearMonth: periodInfo.periodYearMonth,
      periodLabel: periodInfo.periodLabel,
      paymentDate: date.toISOString().split('T')[0],
      employeesPaid,
      totalEmployeePayout,
      singleFeedCost,
      reserveCycles,
      feedReserveCycles: reserveCycles,
      fiveCyclesFeedReserve: feedReserveRetained, // backward compatibility
      feedReserveRetained,
      farmBalanceBefore,
      balanceAfterEmployees,
      adminPayout,
      farmBalanceAfter,
      adminUser: adminMember,
      isAlreadyPaid: periodInfo.isAlreadyPaid,
    };
  }

  public executePayrollDistribution(options?: {
    periodType?: PayrollPeriodType;
    paymentDate?: string;
    reserveCycles?: number;
  }): PayrollRunRecord {
    this.checkPermission(['admin', 'head_manager'], 'payroll', 'Oylik va ish haqini taqsimlash');

    const farmId = this.state.currentFarmId;
    const today = options?.paymentDate || new Date().toISOString().split('T')[0];
    const preview = this.previewPayrollDistribution(options?.periodType, today, options?.reserveCycles);

    if (options?.reserveCycles !== undefined && options.reserveCycles >= 0) {
      if (!this.state.feedReserveCycles) {
        this.state.feedReserveCycles = {};
      }
      this.state.feedReserveCycles[farmId] = options.reserveCycles;
    }

    // Tekshiruv: Oyda 2 martadan ko'p bajarilmasin (1-15 bir marta, 16-30/31 bir marta)
    const existingRun = (this.state.payrollRuns || []).find(
      r => r.farm_id === farmId && r.period_year_month === preview.periodYearMonth && r.period_type === preview.periodType
    );
    if (existingRun) {
      throw new Error(
        `Xavfsizlik qoidasi: ${preview.periodLabel} uchun oylik allaqachon to'langan (${existingRun.payment_date} da qayd etilgan). Oyda bir davr uchun faqat bir marta oylik tarqatish mumkin!`
      );
    }

    if (preview.farmBalanceBefore < preview.totalEmployeePayout) {
      throw new Error(
        `Mablag' yetarli emas: Ferma hisobida ${preview.farmBalanceBefore.toLocaleString()} so'm mavjud, biroq xodimlar ish haqi uchun ${preview.totalEmployeePayout.toLocaleString()} so'm talab etiladi.`
      );
    }

    // 1. Xodimlarga oylik berildi va bu ferma xarajatlariga qo'shildi
    if (preview.totalEmployeePayout > 0) {
      const finExpense: FinanceRecord = {
        id: 'fin-sal-' + Math.random().toString(36).substring(2, 9),
        farm_id: farmId,
        type: 'xarajat',
        category: 'ish_haqi',
        amount_uzs: preview.totalEmployeePayout,
        date: today,
        description: `${preview.periodType === 'avans' ? '1-davr: Avans to\'lovi (1-15 kunlari)' : '2-davr: Oylik to\'lovi (16-31 kunlari)'} - ${preview.employeesPaid.length} nafar xodimga ish haqi`,
        linked_entity_type: 'manual',
        created_by: this.state.currentUser.full_name,
        created_at: new Date().toISOString(),
      };
      this.state.finances.unshift(finExpense);

      this.logAudit({
        farm_id: farmId,
        action_type: 'PAYROLL_DISBURSED',
        result: 'SUCCESS',
        resource_name: 'payroll',
        details: `${preview.periodLabel}: ${preview.employeesPaid.length} nafar xodimga jami ${preview.totalEmployeePayout.toLocaleString()} so'm ish haqi xarajatlarga yozildi`,
      });
    }

    // 2. Administratorga sof foyda ulushi / dividend (Daromad ham xarajat ham deb hisoblanmaydi, lekin ferma balansidan yechiladi)
    const runRecord: PayrollRunRecord = {
      id: 'payroll-run-' + Math.random().toString(36).substring(2, 9),
      farm_id: farmId,
      period_year_month: preview.periodYearMonth,
      period_type: preview.periodType,
      period_label: preview.periodLabel,
      payment_date: today,
      total_employee_payout_uzs: preview.totalEmployeePayout,
      employees_paid: preview.employeesPaid,
      single_feed_cycle_cost_uzs: preview.singleFeedCost,
      feed_reserve_cycles: preview.reserveCycles,
      feed_reserve_retained_uzs: preview.feedReserveRetained,
      farm_balance_before_run_uzs: preview.farmBalanceBefore,
      admin_user_id: preview.adminUser?.user_id,
      admin_user_name: preview.adminUser?.user_name,
      admin_payout_uzs: preview.adminPayout,
      farm_balance_after_run_uzs: preview.farmBalanceAfter,
      created_by_name: this.state.currentUser.full_name,
      created_by_role: this.getCurrentRole(),
      created_at: new Date().toISOString(),
    };

    if (!Array.isArray(this.state.payrollRuns)) {
      this.state.payrollRuns = [];
    }
    this.state.payrollRuns.unshift(runRecord);

    if (preview.adminPayout > 0) {
      this.logAudit({
        farm_id: farmId,
        action_type: 'ADMIN_PROFIT_PAYOUT',
        result: 'SUCCESS',
        resource_name: 'payroll',
        details: `Administrator ${preview.adminUser?.user_name || 'Rahbar'} ga sof foyda ulushi (dividend) ajratildi: ${preview.adminPayout.toLocaleString()} so'm (Ferma hisobida faqat mavjud hayvonlar uchun ${preview.reserveCycles} martalik minimal ozuqa zaxirasi: ${preview.feedReserveRetained.toLocaleString()} so'm qoldirildi)`,
      });
    }

    this.notify();
    return runRecord;
  }
}

export const backendEngine = new PodachiBackendEngine();
