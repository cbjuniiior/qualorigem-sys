const STORAGE_KEY = "qualorigem_tenant_logins";

interface TenantLoginsData {
  userId: string;
  tenantIds: string[];
}

export function getTenantLogins(): TenantLoginsData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as TenantLoginsData;
    if (!data?.userId || !Array.isArray(data.tenantIds)) return null;
    return data;
  } catch {
    return null;
  }
}

export function addTenantLogin(tenantId: string, userId: string): void {
  if (typeof window === "undefined") return;
  const current = getTenantLogins();
  let tenantIds: string[];
  if (current && current.userId === userId) {
    tenantIds = current.tenantIds.includes(tenantId)
      ? current.tenantIds
      : [...current.tenantIds, tenantId];
  } else {
    tenantIds = [tenantId];
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ userId, tenantIds })
  );
}

export function clearTenantLogins(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasLoggedInToTenant(tenantId: string, userId: string): boolean {
  const data = getTenantLogins();
  if (!data || data.userId !== userId) return false;
  return data.tenantIds.includes(tenantId);
}
