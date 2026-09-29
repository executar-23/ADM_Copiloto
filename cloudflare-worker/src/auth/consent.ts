// Página de consentimento do /authorize (Fase 1 da ADR-MCP-REMOTE-001 / CC-003) — segue o padrão
// documentado em node_modules/@cloudflare/workers-oauth-provider/docs/consent-page.md, adaptado
// para usar a identidade do Cloudflare Access (D15) em vez de um sistema de sessão próprio.
import type { AuthRequest, ConsentDescription, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { AuthorizationError, CimdFetchError } from "@cloudflare/workers-oauth-provider";
import { type AccessEnv, AccessNotConfiguredError, requireAccessIdentity } from "./identity.ts";

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function renderConsentPage(details: ConsentDescription, handle: string, email: string | null): string {
  const name = escape(details.clientName);
  const origin = details.clientDomain
    ? `Publicado por <strong>${escape(details.clientDomain)}</strong>.`
    : "Este app se registrou sozinho; o nome não é verificado.";
  const scopes = details.scope
    .map((scope) => `<label><input type="checkbox" name="scope" value="${escape(scope)}" checked> ${escape(scope)}</label>`)
    .join("<br>");
  const who = email ? `<p>Autenticado via Cloudflare Access como <strong>${escape(email)}</strong>.</p>` : "";
  return `<!doctype html>
<meta charset="utf-8">
<title>Autorizar ${name} — Maestro</title>
<h1>Permitir que ${name} acesse o Maestro?</h1>
${who}
<p>${origin} O acesso será enviado para <strong>${escape(details.redirectHost)}</strong>.</p>
${details.redirectIsLoopback ? "<p><strong>Isto envia acesso para um app no seu computador.</strong> Continue só se você mesmo começou o login por ele.</p>" : ""}
<form method="post">
  <input type="hidden" name="handle" value="${escape(handle)}">
  ${scopes}
  <p><button name="decision" value="approve">Permitir</button> <button name="decision" value="deny">Negar</button></p>
</form>`;
}

function renderError(message: string, status: number): Response {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export async function handleAuthorize(request: Request, env: AccessEnv & { OAUTH_PROVIDER: OAuthHelpers }, ctx: ExecutionContext): Promise<Response> {
  const oauth = env.OAUTH_PROVIDER;
  try {
    if (request.method === "GET") {
      const identity = await requireAccessIdentity(request, env, ctx);
      const authRequest: AuthRequest = await oauth.parseAuthRequest(request);
      const details = await oauth.describeConsent(authRequest); // antes do beginConsent — falha aqui não deixa nada na KV
      const consent = await oauth.beginConsent(authRequest);
      consent.headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(renderConsentPage(details, consent.handle, identity.email), { headers: consent.headers });
    }
    if (request.method === "POST") {
      const identity = await requireAccessIdentity(request, env, ctx);
      const form = await request.formData();
      const handle = String(form.get("handle") ?? "");
      if (form.get("decision") !== "approve") {
        const denied = await oauth.denyConsent(request, handle);
        return new Response(null, { status: 302, headers: denied.headers });
      }
      const approved = await oauth.approveConsent(request, handle, { scope: form.getAll("scope").map(String) });
      const { redirectTo } = await oauth.completeAuthorization({
        request: approved.request, // vem do storage, nunca do form
        userId: identity.userId,
        metadata: { email: identity.email, name: identity.name },
        scope: approved.request.scope,
        props: { userId: identity.userId, email: identity.email, name: identity.name },
      });
      approved.headers.set("Location", redirectTo);
      return new Response(null, { status: 302, headers: approved.headers });
    }
    return renderError("Method Not Allowed", 405);
  } catch (error) {
    if (error instanceof AccessNotConfiguredError) return renderError(error.message, 401);
    if (error instanceof AuthorizationError) {
      if (error.redirectTo) return Response.redirect(error.redirectTo, 302);
      return renderError(error.description, 400);
    }
    if (error instanceof CimdFetchError) {
      return renderError("Não consegui verificar o client (documento de metadados CIMD inacessível).", 400);
    }
    throw error;
  }
}
