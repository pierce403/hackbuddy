# Hackbuddy migration

Preserve original source commit 3f4ca924b8133648ed986794996c488d5e07d1fc and deployed slug.
On 2026-10-13 the owner waived historical storage carryover because the site never
launched. Production now uses a fresh D1 database; leave the old database untouched.
Parameterize queries and preserve session field/API contracts. Staging has its own D1.
Native main builds own publishing. Disable Heroku automatic deploys before pushing.
Keep deployment credentials in Cloudflare and previews off. Staging uses a separate
D1 fixture and mocked Twitter calls, with no production secrets or personal data.
No live Twitter write, video call or existing-user message is needed for validation.

Keep historical Python manifests as snapshots, without disabling dependency scans.
Run actual Worker tests and verify hosted/DNS/TLS separately from builds. Record
unresolved storage and OAuth integration gates explicitly.
