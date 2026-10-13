# Hackbuddy migration

Preserve original source commit 3f4ca924b8133648ed986794996c488d5e07d1fc, deployed slug
and external DATABASE_URL2. Its connection timeout is not evidence of empty data.
Production queries the same PostgreSQL table with encrypted transport, bounded
queries and parameterized writes. Never create an empty production replacement.
Native main builds own publishing. Disable Heroku automatic deploys before pushing.
Keep deployment credentials in Cloudflare and previews off. Staging uses a separate
D1 fixture and mocked Twitter calls, with no production secrets or personal data.
No live Twitter write, video call or existing-user message is needed for validation.

Keep historical Python manifests as snapshots, without disabling dependency scans.
Run actual Worker tests and verify hosted/DNS/TLS separately from builds. Record
unresolved storage and OAuth integration gates explicitly.
