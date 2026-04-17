// Cognito Post Confirmation trigger:
// - Runs after user confirmation (e.g. ConfirmSignUp / verification completion)
// - Upserts the corresponding user record into app DB using cognito_sub
//
// Expected event.request.userAttributes includes:
// - sub (Cognito user id)
// - email (since username_attributes = email)
// - name can be present as either `name` or custom `custom:name`

const crypto = require("crypto");
const { Client } = require("pg");

exports.handler = async (event) => {
  // Always return the event so Cognito continues normal flow.
  const safeReturn = () => event;

  // ---- 1) Extract attributes ----
  const attrs = event?.request?.userAttributes ?? {};
  const cognitoSub = attrs.sub;
  const email = attrs.email;
  // Cognito custom attributes are typically prefixed with `custom:`
  const name =
    attrs.name ??
    attrs["custom:name"] ??
    attrs["custom:Name"] ??
    null;

  // If essential attributes are missing, just skip DB sync.
  if (!cognitoSub || !email) {
    return safeReturn();
  }

  // ---- 2) Connect to DB ----
  // Keep DATABASE_URL in Lambda env vars.
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // Fail open (do not block signup).
    console.error("Missing DATABASE_URL env var");
    return safeReturn();
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    // Generate a uuid for primary key user_id (DB schema requires user_id).
    const userId = crypto.randomUUID();

    // ---- 3) Upsert local user record ----
    // Table / columns expected (based on your Prisma migration):
    // - users.user_id (PK)
    // - users.email
    // - users.name
    // - users.cognito_sub (unique)
    //
    // IMPORTANT:
    // If your DB migration uses `cognito_sub` with unique index, ON CONFLICT works.
    await client.query(
      `
      INSERT INTO "users" ("user_id", "email", "name", "cognito_sub", "created_at", "updated_at")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT ("cognito_sub")
      DO UPDATE SET
        "email" = EXCLUDED."email",
        "name" = EXCLUDED."name",
        "updated_at" = NOW()
      `,
      [userId, email, name, cognitoSub]
    );

    return safeReturn();
  } catch (err) {
    // Fail open: don't block Cognito confirmation.
    console.error("Failed to sync user to DB:", err);
    return safeReturn();
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
};

