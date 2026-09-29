// Identidade do usuário via Cloudflare Access (D15) para a rota /authorize do gateway OAuth
// (Fase 1 da ADR-MCP-REMOTE-001 / CC-003). Nunca inventa identidade: se o Access não rodou para
// esta requisição, falha fechado (AccessNotConfiguredError) em vez de assumir anônimo/autenticado.
//
// Duas fontes, nessa ordem:
//   1) ctx.access — integração nativa do runtime, populada quando este Worker (ou a rota) está
//      protegido pelo toggle "Protect this Worker"/Access nativo. Cloudflare já validou o JWT.
//   2) Fallback manual — valida o header Cf-Access-Jwt-Assertion via JWKS do team domain, o método
//      documentado pela Cloudflare para quando a rota é protegida por uma Access application
//      "self-hosted" apontando para um hostname/path específico (não o toggle nativo do Worker
//      inteiro), caso em que ctx.access pode não ser populado. Exige os dois secrets
//      (CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD) — nunca inventa team domain/AUD (I-02).
import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AccessIdentity {
  userId: string;
  email: string | null;
  name: string | null;
}

export interface AccessEnv {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}

export class AccessNotConfiguredError extends Error {
  constructor(detail: string) {
    super(
      `Cloudflare Access não confirmou a identidade desta requisição: ${detail}. Configure a Access ` +
        "application que protege /authorize (Zero Trust → Access → Applications, ou Workers & Pages → " +
        "este Worker → aba Access) e, se usar o fallback manual, os secrets CF_ACCESS_TEAM_DOMAIN/" +
        "CF_ACCESS_AUD (`wrangler secret put`) — ver D15 e cloudflare-worker/README.md.",
    );
    this.name = "AccessNotConfiguredError";
  }
}

function identityFromRecord(record: Record<string, unknown> | undefined): AccessIdentity {
  const email = typeof record?.email === "string" ? record.email : null;
  const userUuidRaw = record?.user_uuid ?? record?.sub;
  const userUuid = typeof userUuidRaw === "string" ? userUuidRaw : null;
  const userId = userUuid ?? email;
  if (!userId) throw new AccessNotConfiguredError("a identidade verificada não trouxe user_uuid/sub nem email");
  const name = typeof record?.name === "string" ? record.name : null;
  return { userId, email, name };
}

async function fromRuntimeAccess(ctx: ExecutionContext): Promise<AccessIdentity | null> {
  if (!ctx.access) return null;
  const identity = await ctx.access.getIdentity();
  return identityFromRecord(identity);
}

async function fromManualJwt(request: Request, env: AccessEnv): Promise<AccessIdentity | null> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return null;
  if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) {
    throw new AccessNotConfiguredError(
      "chegou um Cf-Access-Jwt-Assertion, mas CF_ACCESS_TEAM_DOMAIN/CF_ACCESS_AUD não estão configurados para validá-lo",
    );
  }
  const jwks = createRemoteJWKSet(new URL("/cdn-cgi/access/certs", env.CF_ACCESS_TEAM_DOMAIN));
  const { payload } = await jwtVerify(token, jwks, { issuer: env.CF_ACCESS_TEAM_DOMAIN, audience: env.CF_ACCESS_AUD });
  return identityFromRecord(payload);
}

export async function requireAccessIdentity(request: Request, env: AccessEnv, ctx: ExecutionContext): Promise<AccessIdentity> {
  const viaRuntime = await fromRuntimeAccess(ctx);
  if (viaRuntime) return viaRuntime;
  const viaManual = await fromManualJwt(request, env);
  if (viaManual) return viaManual;
  throw new AccessNotConfiguredError(
    "nem ctx.access nem o header Cf-Access-Jwt-Assertion estavam presentes — /authorize provavelmente ainda não está protegido por uma Cloudflare Access application",
  );
}
