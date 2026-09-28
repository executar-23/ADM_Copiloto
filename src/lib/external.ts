// Classificação de efeito externo (I-05) — usada pelo hook guard-external e testável isoladamente.
export const EXTERNAL_PATTERNS: [RegExp, string][] = [
  [/\bgit\s+push\b/, "git push"],
  [/\b(npm|pnpm|yarn)\s+publish\b/, "publicação de pacote"],
  [/\bgh\s+(pr\s+(create|merge)|release\s+create|repo\s+create|issue\s+create)\b/, "escrita no GitHub (gh)"],
  [/\bgh\s+api\b.*(-X|--method)\s*(POST|PUT|PATCH|DELETE)\b/i, "escrita no GitHub (gh api)"],
  [/\bvercel\b(?!\s+(env\s+ls|ls|list|inspect|logs|whoami|--version|help))/, "Vercel (deploy)"],
  [/\bwrangler\s+(deploy|publish|pages\s+deploy|r2\s+object\s+put|kv\s+key\s+put)\b/, "Cloudflare (wrangler)"],
  [/\brailway\s+(up|deploy|redeploy)\b/, "Railway (deploy)"],
  [/\b(netlify|firebase|fly|flyctl)\s+deploy\b/, "deploy"],
  [/\bsupabase\s+(db\s+push|functions\s+deploy|secrets\s+set)\b/, "Supabase (escrita)"],
  [/\b(docker|podman)\s+push\b/, "push de imagem"],
  [/\bterraform\s+(apply|destroy)\b/, "terraform apply/destroy"],
  [/\bkubectl\s+(apply|delete|create|patch|rollout)\b/, "kubectl (escrita)"],
  [/\bhelm\s+(install|upgrade|uninstall)\b/, "helm (escrita)"],
  [/\bcurl\b.*(-X\s*(POST|PUT|PATCH|DELETE)|--request\s+(POST|PUT|PATCH|DELETE)|\s(-d|--data\S*|-F|--form)\s)/i, "requisição HTTP de escrita (curl)"],
  [/\bwget\b.*--(post|method)/i, "requisição HTTP de escrita (wget)"],
  [/\b(scp|sftp)\s/, "cópia para host remoto"],
  [/\brsync\b.*\s[\w.-]+@?[\w.-]+:/, "rsync para host remoto"],
  [/\b(sendmail|mail\s+-s|mutt)\b/, "envio de e-mail"],
];

/** Verbos de escrita em ferramentas MCP de conectores (Notion, Drive, Vercel, Railway…). */
const MCP_WRITE = /__(?:[a-z0-9_-]*[_-])?(create|update|delete|remove|trash|send|publish|deploy|write|post|put|patch|upload|merge|schedule|trigger|run|execute|set|add|move|share|reply|forward|redeploy|restart|accept|apply|push|rotate|revoke|buy|cancel)(?:[_-][a-z0-9_-]*)?$/i;

export function classifyExternal(toolName: string, command?: string): string | null {
  if (toolName === "Bash" && command) {
    for (const [re, label] of EXTERNAL_PATTERNS) if (re.test(command)) return label;
    return null;
  }
  if (toolName === "mcp__plugin_maestro_estado__authorization_grant") return "concessão de autorização (exige o humano)";
  if (toolName.startsWith("mcp__") && !toolName.startsWith("mcp__plugin_maestro_") && MCP_WRITE.test(toolName)) {
    return `escrita em conector MCP (${toolName})`;
  }
  return null;
}
