# CookPath account integration

## Status — 13 November 2026

The account UI, Supabase client adapter and database migration are implemented. They are not activated on the public site: the Supabase plugin reports not installed/connected, and the dashboard requires sign-in. No Supabase project, database or Auth configuration has been changed by this update. `account-config.js` deliberately keeps `enabled: false` until a project is connected and verified.

The challenge and quiz changes work independently with the existing browser progress. This is not cross-device account storage yet.

## Activation

1. Connect the Supabase plugin to the intended CookPath project. Inspect existing schema before applying the migration.
2. Apply `supabase/migrations/202611130001_cookpath_accounts.sql` once. It creates two account-owned progress tables, the private answer catalogue and four authenticated RPC functions.
3. In Supabase Auth, enable email sign-in. Set Site URL to `https://cookpath.onrender.com/`. Allow return URLs `https://cookpath.onrender.com/`, `https://cookpath.onrender.com/index.html`, and the chosen localhost URLs for development.
4. Configure production email delivery before inviting the public. Supabase’s built-in sender is limited to project-team addresses; use an existing verified SMTP sender for real learners. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).
5. Put the project URL and **public publishable key** in `account-config.js`. A legacy anon key is also supported. Never use a secret or service-role key. Set `enabled: true` only after the migration and Auth configuration are verified.
6. Test a real email sign-in, task completion and an answer; reload and sign in on a second device. Verify the same first answer and task progress. Test a different account and sign-out. Publish the enabled configuration only after these pass.

## Login and saved progress

The login dialog uses [Supabase email magic links](https://supabase.com/docs/guides/auth/auth-email-passwordless); learners do not need a password. New accounts are confirmed through their email link. Sign-out clears the displayed account state. Cached progress is keyed by user ID. A delayed response from one account cannot populate another account’s view.

Earlier browser progress is offered as an explicit import, rather than silently assigning a shared browser’s history to a signed-in account. Existing server answers retain their first choice during import. The browser copy is retained.

## Database guarantees

- Row-level security restricts each account to its own task and quiz rows.
- Browser roles cannot insert, update or delete progress tables directly; only scoped authenticated RPCs can write.
- The `(user_id, question_id)` primary key and append-only submission function retain the first submitted choice. Retrying a different choice returns the original saved answer.
- Correctness is calculated against the private 300-question catalogue by the database.
- Sequential challenge unlocks are enforced on the server. Every earlier set needs five tasks and ten submitted answers. There is no calendar gate.
- Each write takes a per-account transaction lock to serialize competing submissions.

## Validation

`node --test tests/progress.test.cjs tests/accounts.test.cjs`

`node tests/database.mjs`

Account tests use a local mocked SDK with JSDOM. Database tests apply the actual migration to local PostgreSQL through PGlite with two users and authenticated/anonymous roles. They verify isolation, immutable first answers, denied direct writes, challenge gates and legacy import. These are local tests, not a claim of successful cloud configuration.

The test runtimes were installed under `/tmp/cookpath-test-runtime` using `npm install --prefix /tmp/cookpath-test-runtime @electric-sql/pglite @supabase/supabase-js jsdom`. Override `COOKPATH_TEST_RUNTIME` if using another location.

The vendored Supabase client is version 2.119.0, MIT-licensed; its licence is retained in `vendor/supabase-LICENSE`. It loads only when account mode is enabled.
