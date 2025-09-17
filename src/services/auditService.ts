export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PAYMENT_ATTEMPT'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'RESERVATION_CREATE'
  | 'RESERVATION_CANCEL'
  | 'PROFILE_UPDATE';

export interface AuditEntry {
  id: string;
  actorId: string;
  actorRole: 'admin' | 'staff' | 'system';
  action: AuditAction;
  target?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: string; // ISO
}

const STORAGE_KEY = 'nzoo_audit_log_v1';

const readLog = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch {
    return [];
  }
};

const writeLog = (entries: AuditEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-1000)));
};

export const AuditService = {
  record: (entry: Omit<AuditEntry, 'id' | 'createdAt'>) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const all = readLog();
    all.push(newEntry);
    writeLog(all);
    return newEntry;
  },

  list: (filters?: {
    actorId?: string;
    actorRole?: 'admin' | 'staff' | 'system';
    action?: AuditAction;
    search?: string;
    limit?: number;
  }): AuditEntry[] => {
    let all = readLog();
    if (filters?.actorId) all = all.filter(e => e.actorId === filters.actorId);
    if (filters?.actorRole) all = all.filter(e => e.actorRole === filters.actorRole);
    if (filters?.action) all = all.filter(e => e.action === filters.action);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      all = all.filter(e =>
        (e.target || '').toLowerCase().includes(s) ||
        (e.metadata && JSON.stringify(e.metadata).toLowerCase().includes(s))
      );
    }
    all = all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return filters?.limit ? all.slice(0, filters.limit) : all;
  },

  clear: () => writeLog([]),
};



