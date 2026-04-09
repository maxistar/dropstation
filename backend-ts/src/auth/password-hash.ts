import crypto from "node:crypto";

const DEFAULT_SCRYPT_N = 16_384;
const DEFAULT_SCRYPT_R = 8;
const DEFAULT_SCRYPT_P = 1;
const DEFAULT_KEY_LENGTH = 64;

type ParsedHash = {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
};

export function createPasswordHash(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, DEFAULT_KEY_LENGTH, {
    N: DEFAULT_SCRYPT_N,
    r: DEFAULT_SCRYPT_R,
    p: DEFAULT_SCRYPT_P,
  });

  return [
    "scrypt",
    String(DEFAULT_SCRYPT_N),
    String(DEFAULT_SCRYPT_R),
    String(DEFAULT_SCRYPT_P),
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export function verifyPasswordHash(password: string, encoded: string): boolean {
  const parsed = parseHash(encoded);
  if (!parsed) {
    return false;
  }

  const computed = crypto.scryptSync(password, parsed.salt, parsed.hash.length, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p,
  });

  if (computed.length !== parsed.hash.length) {
    return false;
  }

  return crypto.timingSafeEqual(computed, parsed.hash);
}

function parseHash(encoded: string): ParsedHash | null {
  const [algorithm, rawN, rawR, rawP, rawSalt, rawHash] = encoded.split("$");
  if (algorithm !== "scrypt" || !rawN || !rawR || !rawP || !rawSalt || !rawHash) {
    return null;
  }

  const n = Number.parseInt(rawN, 10);
  const r = Number.parseInt(rawR, 10);
  const p = Number.parseInt(rawP, 10);
  if (![n, r, p].every((value) => Number.isInteger(value) && value > 0)) {
    return null;
  }

  try {
    const salt = Buffer.from(rawSalt, "base64url");
    const hash = Buffer.from(rawHash, "base64url");
    if (salt.length === 0 || hash.length === 0) {
      return null;
    }

    return { n, r, p, salt, hash };
  } catch {
    return null;
  }
}
