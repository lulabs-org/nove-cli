import type { AddressInfo } from 'node:net';

import * as crypto from 'node:crypto';
import { createServer } from 'node:http';
import open from 'open';

import { type AuthStatus, getOAuthAuth, saveOAuthAuth } from './auth.js';
import { getConfig } from './config.js';

export const OAUTH_CLIENT_ID = 'nove-cli';
export const DEFAULT_OAUTH_SCOPES = [
  'meeting:read', 'meeting:create', 'meeting:update', 'meeting:delete', 'meeting:stats_view',
  'minute:read', 'minute:delete',
  'speaker-summary:read', 'speaker-summary:create', 'speaker-summary:update', 'speaker-summary:delete',
  'tracking-report:read', 'tracking-report:create', 'tracking-report:update', 'tracking-report:delete',
  'user:read', 'user:create', 'user:update', 'user:delete',
  'product:read', 'product:create', 'product:update', 'product:toggle-status', 'product:delete',
  'order:read', 'order:create', 'order:update', 'order:status', 'order:delete',
] as const;

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  organization_id: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

const refreshPromises = new Map<string, Promise<string>>();

export function getBaseUrl(configDir: string): string {
  const config = getConfig(configDir);
  return process.env.NOVE_API_URL || config.baseUrl || 'https://noveapi.proflu.cn';
}

function endpoint(configDir: string, pathname: string): URL {
  const baseUrl = getBaseUrl(configDir);
  return new URL(pathname.replace(/^\/+/, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
}

async function parseTokenResponse(response: Response): Promise<OAuthTokenResponse> {
  const data = (await response.json()) as Partial<OAuthTokenResponse> & { message?: string | string[] };
  if (!response.ok) {
    const detail = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(detail || `OAuth token request failed with status ${response.status}.`);
  }

  if (
    typeof data.access_token !== 'string' || typeof data.refresh_token !== 'string' ||
    typeof data.expires_in !== 'number' || typeof data.scope !== 'string' ||
    typeof data.organization_id !== 'string'
  ) throw new Error('Nove API returned an invalid OAuth token response.');
  return data as OAuthTokenResponse;
}

function saveTokens(configDir: string, token: OAuthTokenResponse): AuthStatus {
  return saveOAuthAuth(configDir, {
    accessToken: token.access_token,
    accessTokenExpiresAt: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    clientId: OAUTH_CLIENT_ID,
    organizationId: token.organization_id,
    refreshToken: token.refresh_token,
    scopes: token.scope.split(/\s+/).filter(Boolean),
  });
}

function callbackPage(success: boolean): string {
  const title = success ? 'Nove CLI 登录成功' : 'Nove CLI 登录失败';
  const detail = success ? '授权已完成，现在可以返回终端继续使用。' : '授权没有完成，请返回终端查看错误信息。';
  const icon = success
    ? '<path d="m7.5 12.5 3 3 6-7"/>'
    : '<path d="M12 8v5m0 3.5v.01"/>';
  const hint = success
    ? '<span class="hint" aria-label="使用 Command W 或 Control W 关闭标签页">可安全关闭此页 · <kbd>⌘ W</kbd> / Ctrl + W</span>'
    : '<span class="hint error-hint">返回终端后可重新发起登录</span>';

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
  <style>
    :root{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033;background:#f4f7fc}
    *{box-sizing:border-box}
    body{min-height:100vh;margin:0;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 20% 15%,#e0eaff 0,transparent 34%),radial-gradient(circle at 85% 85%,#e2f5f1 0,transparent 28%),#f5f7fb}
    main{width:min(100%,460px);padding:28px 32px 30px;border:1px solid rgba(111,133,168,.16);border-radius:24px;background:rgba(255,255,255,.94);box-shadow:0 24px 64px rgba(30,58,100,.13);backdrop-filter:blur(16px)}
    header{display:flex;align-items:center;gap:11px}
    .brand{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;color:white;background:linear-gradient(135deg,#2563eb,#07847f)}
    .brand svg{width:20px;height:20px;stroke:currentColor;stroke-width:1.8;fill:none}
    header strong{font-size:15px;letter-spacing:-.01em}
    .content{padding:34px 0 2px;text-align:center}
    .status-icon{display:grid;place-items:center;width:60px;height:60px;margin:0 auto 20px;border-radius:20px;color:${success ? '#07956f' : '#d84c4c'};background:${success ? '#e7f8f2' : '#fff0f0'};box-shadow:inset 0 0 0 1px ${success ? '#bfe9dc' : '#ffd0d0'} }
    .status-icon svg{width:32px;height:32px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    h1{margin:0;font-size:28px;line-height:1.2;letter-spacing:-.035em}
    .detail{margin:12px 0 0;color:#69758a;font-size:14px;line-height:1.7}
    .hint{display:inline-block;margin-top:24px;color:#8a94a5;font-size:12px}
    kbd{padding:3px 6px;border:1px solid #dce2eb;border-bottom-width:2px;border-radius:6px;color:#536075;background:#fbfcfe;font:600 11px/1 inherit}
    .error-hint{color:#b13c3c;font-weight:650}
    @media(max-width:520px){main{padding:24px;border-radius:20px}.content{padding-top:30px}h1{font-size:25px}}
    @media(prefers-reduced-motion:no-preference){main{animation:arrive .45s cubic-bezier(.2,.8,.2,1) both}@keyframes arrive{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}}
  </style>
</head>
<body>
  <main data-status="${success ? 'success' : 'error'}">
    <header>
      <span class="brand" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg></span>
      <strong>Nove CLI</strong>
    </header>
    <section class="content">
      <span class="status-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${icon}</svg></span>
      <h1>${title}</h1>
      <p class="detail">${detail}</p>
      ${hint}
    </section>
  </main>
</body>
</html>`;
}

export async function startCallbackServer(state: string, timeoutMs = 5 * 60 * 1000) {
  let settle: ((value: { code: string }) => void) | undefined;
  let fail: ((error: Error) => void) | undefined;
  const callback = new Promise<{ code: string }>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });
  const server = createServer((request, response) => {
    const {remoteAddress} = request.socket;
    if (remoteAddress !== '127.0.0.1' && remoteAddress !== '::ffff:127.0.0.1') {
      response.writeHead(403).end();
      return;
    }

    const url = new URL(request.url || '/', 'http://127.0.0.1');
    if (request.method !== 'GET' || url.pathname !== '/oauth/callback') {
      response.writeHead(404).end();
      return;
    }

    if (url.searchParams.get('state') !== state) {
      response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
      response.end(callbackPage(false));
      return;
    }

    const oauthError = url.searchParams.get('error');
    const code = url.searchParams.get('code');
    if (oauthError || !code) {
      response.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
      response.end(callbackPage(false));
      fail?.(new Error(oauthError === 'access_denied' ? 'Authorization was cancelled.' : 'OAuth callback did not include a code.'));
      server.close();
      return;
    }

    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(callbackPage(true));
    settle?.({ code });
    server.close();
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo;
  const timer = setTimeout(() => {
    fail?.(new Error('Browser authorization timed out.'));
    server.close();
  }, timeoutMs);
  callback.finally(() => clearTimeout(timer)).catch(() => {});
  return {
    close: () => server.close(),
    redirectUri: `http://127.0.0.1:${address.port}/oauth/callback`,
    wait: () => callback,
  };
}

export async function loginWithBrowser(
  configDir: string,
  options: { noBrowser?: boolean; onAuthorizationUrl?: (url: string, fallback: boolean) => void; scopes?: string[]; } = {}
): Promise<AuthStatus> {
  const state = crypto.randomBytes(32).toString('base64url');
  const codeVerifier = crypto.randomBytes(48).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const callbackServer = await startCallbackServer(state);
  const authorizationUrl = endpoint(configDir, '/api/oauth/authorize');
  authorizationUrl.search = new URLSearchParams([
    ['client_id', OAUTH_CLIENT_ID],
    ['code_challenge', codeChallenge],
    ['code_challenge_method', 'S256'],
    ['redirect_uri', callbackServer.redirectUri],
    ['response_type', 'code'],
    ['scope', (options.scopes?.length ? options.scopes : [...DEFAULT_OAUTH_SCOPES]).join(' ')],
    ['state', state],
  ]).toString();

  let fallback = Boolean(options.noBrowser);
  if (!options.noBrowser) {
    try { await open(authorizationUrl.toString()); } catch { fallback = true; }
  }

  options.onAuthorizationUrl?.(authorizationUrl.toString(), fallback);
  try {
    const { code } = await callbackServer.wait();
    const response = await fetch(endpoint(configDir, '/api/oauth/token'), {
      body: new URLSearchParams([
        ['client_id', OAUTH_CLIENT_ID],
        ['code', code],
        ['code_verifier', codeVerifier],
        ['grant_type', 'authorization_code'],
        ['redirect_uri', callbackServer.redirectUri],
      ]),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
    });
    return saveTokens(configDir, await parseTokenResponse(response));
  } finally {
    callbackServer.close();
  }
}

export async function refreshOAuthAccessToken(configDir: string, force = false): Promise<string> {
  const auth = getOAuthAuth(configDir);
  if (!auth) throw new Error('OAuth credential is missing. Run `nove login`.');
  if (!force && Date.parse(auth.accessTokenExpiresAt) > Date.now() + 30_000) return auth.accessToken;
  const existing = refreshPromises.get(configDir);
  if (existing) return existing;
  const refresh = fetch(endpoint(configDir, '/api/oauth/token'), {
    body: new URLSearchParams([
      ['client_id', auth.clientId],
      ['grant_type', 'refresh_token'],
      ['refresh_token', auth.refreshToken],
    ]),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  }).then(parseTokenResponse).then((token) => {
    saveTokens(configDir, token);
    return token.access_token;
  }).finally(() => refreshPromises.delete(configDir));
  refreshPromises.set(configDir, refresh);
  return refresh;
}

export async function revokeOAuthCredential(configDir: string): Promise<void> {
  const auth = getOAuthAuth(configDir);
  if (!auth) return;
  const response = await fetch(endpoint(configDir, '/api/oauth/revoke'), {
    body: new URLSearchParams([['client_id', auth.clientId], ['token', auth.refreshToken]]),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Unable to revoke OAuth credential (${response.status}).`);
}
