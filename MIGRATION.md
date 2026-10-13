# Hackbuddy Cloudflare port

Root, login, Twitter callback, host, list, update, favicon and static paths remain.
The original templates and Jitsi integration are retained. Session updates use a
parameterized upsert, repairing the original missing-row/add bug. List ordering
retains descending creation time and adds stable ID tie ordering. HTML descriptions
are escaped; JSON keeps url, user, description and count fields.

Production retains the existing DATABASE_URL2 PostgreSQL identity. No schema or
empty database is created automatically. Source connection timeouts mean historical
records are unrecovered, not absent. Database failures return explicit503 responses.
Keep both source configuration and slug for recovery, and hold writes until storage
and its backups are verified. Staging uses independent synthetic D1 data only.
The read-only notice appears inside valid homepage HTML. An unavailable list shows an
explicit recovery message instead of an unhandled browser error.
Runtime storage diagnostics record only the connection/query phase and an allowlisted
error code. Connection strings, arbitrary error messages and user records are excluded.

OAuth1 requests are signed at request time, with the original Twitter app identity.
The callback is bound to an encrypted, expiring request-token cookie, fixing the
original use of the verifier as the request-token secret. Access cookies retain
their names with Secure, HttpOnly and SameSite=Lax. AUTH_COOKIE_SECRET is a new
stable runtime secret for the pending login cookie. No real Twitter interaction
has yet been verified. READ_ONLY blocks updates and login/callback side effects.

Native main builds run npm ci, npm run build and npx wrangler deploy --env "".
The original source commit branch remains recovery source. Previews remain disabled and
Cloudflare credentials stay in Cloudflare. Current hosting cutover is pending.

Driver guidance: https://developers.cloudflare.com/workers/tutorials/postgres/
OAuth signature vector: https://oauth.net/core/1.0a/#rfc.section.A.5.2
