export function parseCookie(name: string, cookie?: string): string | null {
  const _cookie =
    cookie || (typeof document !== "undefined" ? document.cookie : "");
  const cookies = _cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}
