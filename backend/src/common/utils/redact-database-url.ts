/**
 * Log an toàn: user + host + port + path + query, không in password.
 */
export function redactDatabaseUrl(raw: string | undefined): string {
  if (raw == null || raw === '') {
    return '(DATABASE_URL unset)';
  }
  try {
    const normalized = raw.replace(/^postgresql:/i, 'http:');
    const u = new URL(normalized);
    const user = decodeURIComponent(u.username || '') || '(no user)';
    const port = u.port ? `:${u.port}` : '';
    return `postgresql://${encodeURIComponent(user)}:***@${u.hostname}${port}${u.pathname}${u.search}`;
  } catch {
    return '(DATABASE_URL present but could not be parsed for logging)';
  }
}
