const INVALID_NAME_CHARS = /[\x00-\x1F\x7F/]/;

export function validateDisplayName(value: string, min: number, max: number): boolean {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  if (trimmed === "." || trimmed === "..") return false;
  if (INVALID_NAME_CHARS.test(trimmed)) return false;
  return true;
}

export function validateHeirName(name: string): boolean {
  return validateDisplayName(name, 2, 50);
}

export function validateFamilyName(name: string): boolean {
  return validateDisplayName(name, 2, 30);
}

export function validateUsername(username: string): boolean {
  return validateDisplayName(username, 2, 30);
}

export function normalizeUsername(username: string): string {
  return username.trim();
}

export function usernameKey(username: string): string {
  return username.trim().toLowerCase();
}

export function isUsernameAllowed(username: string): boolean {
  const allowlist = import.meta.env.VITE_ALLOWED_USERNAMES?.trim();
  if (!allowlist) return true;

  const allowed = allowlist
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(usernameKey(username));
}

export const NAME_VALIDATION_MESSAGE =
  "Use 2-50 characters. Spaces and special characters are allowed, but not /.";

export const USERNAME_VALIDATION_MESSAGE =
  "Use 2-30 characters. Spaces and special characters are allowed, but not /.";
