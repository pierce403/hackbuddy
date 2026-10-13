# Hackbuddy Cloudflare port

Root, login, Twitter callback, host, list, update, favicon and static paths remain.
The original templates and Jitsi integration are retained. Session updates use a
parameterized upsert, repairing the original missing-row/add bug. List ordering
retains descending creation time and adds stable ID tie ordering. HTML descriptions
are escaped; JSON keeps url, user, description and count fields.

On 2026-10-13 the owner explicitly waived historical backups/data carryover because
this site never launched. Production starts with a fresh D1 hack_sesh table and
retains the existing fields, ordering and atomic upsert. The inaccessible legacy
PostgreSQL source remains untouched. DATABASE_URL2 remains an unused runtime
recovery credential; active code no longer connects to it. Staging uses its separate
synthetic D1 database. The homepage shows read-only notices and handles failed reads
without exposing records or arbitrary error messages.

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
