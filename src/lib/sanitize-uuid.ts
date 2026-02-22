/**
 * Converte "" e "none" para null em campos UUID antes de enviar ao banco.
 * PostgreSQL rejeita string vazia para tipo uuid.
 */
export function sanitizeUuidFields<T extends Record<string, unknown>>(
  obj: T,
  fields: string[]
): T {
  const result = { ...obj };
  fields.forEach((f) => {
    if (f in result && (result[f] === "" || result[f] === "none")) {
      (result as Record<string, unknown>)[f] = null;
    }
  });
  return result;
}
