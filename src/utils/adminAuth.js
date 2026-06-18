import * as C from "../data/constants";

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function getStoredHash() {
  const stored = localStorage.getItem("adminPwdHash");
  return stored || C.DEFAULT_ADMIN_PASSWORD_HASH;
}

export function setStoredHash(hash) {
  localStorage.setItem("adminPwdHash", hash);
}

export async function verifyPassword(password) {
  const hash = await hashPassword(password);
  return hash === getStoredHash();
}
