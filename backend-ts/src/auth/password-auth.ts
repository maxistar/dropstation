import crypto from "node:crypto";
import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import type { AppConfig } from "../config/load-config.js";

export interface AuthLoginRequestBody {
  username?: string;
  password?: string;
}

interface TokenPayload {
  username: string;
  exp: number;
}

function signPayload(payloadBase64: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

export function createAuthToken(username: string, config: AppConfig): string {
  const payload: TokenPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + config.authTokenTtlSeconds,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(payloadBase64, config.authTokenSecret);
  return `${payloadBase64}.${signature}`;
}

export function verifyAuthToken(token: string, config: AppConfig): TokenPayload | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadBase64, config.authTokenSecret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as TokenPayload;
    if (typeof payload.username !== "string" || payload.username.length === 0) {
      return null;
    }
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyCredentials(body: AuthLoginRequestBody, config: AppConfig): boolean {
  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return false;
  }

  return username === config.authUsername && password === config.authPassword;
}

function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header || typeof header !== "string") {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function sendUnauthorized(reply: FastifyReply): void {
  reply.code(401).send({
    error: "Unauthorized",
  });
}

export const sendForbidden = (reply: FastifyReply): void => {
  reply.code(403).send({
    error: "Forbidden",
  });
};

export function buildUiAuthPreHandler(config: AppConfig): preHandlerHookHandler {
  return async (request, reply) => {
    const token = extractBearerToken(request);
    if (!token) {
      sendUnauthorized(reply);
      return;
    }

    const payload = verifyAuthToken(token, config);
    if (!payload) {
      sendUnauthorized(reply);
      return;
    }

    (request as FastifyRequest & { authUser?: string }).authUser = payload.username;
  };
}
