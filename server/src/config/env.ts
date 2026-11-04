import "dotenv/config";

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  nodeEnv,
  isDev: nodeEnv !== "production",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  databaseUrl: optional("DATABASE_URL"),
  googleClientEmail: optional("GOOGLE_CLIENT_EMAIL"),
  /**
   * Service account keys in .env are stored with escaped newlines.
   * Restore real PEM line breaks before constructing the JWT client.
   */
  googlePrivateKey: optional("GOOGLE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",
  googleImpersonateEmail: optional("GOOGLE_IMPERSONATE_EMAIL"),
};

export const calendarConfigured = Boolean(
  env.googleClientEmail && env.googlePrivateKey,
);

export const databaseConfigured = Boolean(env.databaseUrl);
