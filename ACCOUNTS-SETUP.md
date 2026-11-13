# CookPath account integration

## Status — 13 November 2026

Supabase is connected. Created the CookPath project in the existing CookPath organization on its free plan, in Frankfurt (`eu-central-1`). Project reference: `wmeljscrxrrvikrhnqsn`.

The hosted progress database is installed and verified. The sign-in dialog and account adapter are implemented in English and Greek. Public account mode remains disabled until Auth return URLs and a verified email sender are configured and a real email sign-in succeeds. Existing public visitors can keep practicing with their browser progress.

- Project: https://supabase.com/dashboard/project/wmeljscrxrrvikrhnqsn
- URL settings: https://supabase.com/dashboard/project/wmeljscrxrrvikrhnqsn/auth/url-configuration
- Email delivery: https://supabase.com/dashboard/project/wmeljscrxrrvikrhnqsn/auth/smtp
- API URL and public publishable key are saved in `account-config.js`; `enabled: false` is intentional.
- Migration applied: `supabase/migrations/20261113120005_cookpath_accounts.sql`.

## Remaining activation

1. Sign into the Supabase dashboard. The connected plugin can manage the database but has no Auth-settings or SMTP tool. The dashboard currently requires a separate sign-in, and the local Supabase CLI is not authenticated. No access tokens or passwords were obtained from browser storage.
2. Set Auth Site URL to `https://cookpath.onrender.com/`. Allow return URLs `https://cookpath.onrender.com/` and `https://cookpath.onrender.com/index.html`. Only add specific localhost return URLs while testing.
3. Configure a verified SMTP sender for public learners. Supabase's built-in sender accepts only project-team email addresses and is limited to two messages per hour. Its default service cannot provide public sign-in. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp). Keep email verification enabled.
4. Test a real email link, task completion and an answer. Reload and sign in on a second device. Verify the same first answer and task progress; also test another account and sign-out.
5. Set `enabled: true`, advance the app shell cache, publish and verify the public flow. Do not publish an enabled sign-in button before email delivery works.

The local UI preview is `http://127.0.0.1:4175/?lang=en` while the temporary preview server runs. It shows the real account interface with the public project client, but no email was sent and it is not an activated public login service. Review images are saved in `review-screenshots/account-login-preview-2026-11-13.jpg` and `review-screenshots/account-login-greek-phone-2026-11-13.jpg`.

## Login and saved progress

The dialog uses [Supabase email magic links](https://supabase.com/docs/guides/auth/auth-email-passwordless); learners do not need a password. New accounts are confirmed through their email link. Sign-out clears the displayed account state. Cached progress is keyed by user ID. A delayed response from one account cannot populate another account's view.

Earlier browser progress is offered as an explicit import. It is never silently assigned to a signed-in account. Existing server answers retain their first choice during import. The browser copy is retained.

## Database guarantees

- RLS restricts each account to its own task and quiz rows. Browser roles cannot insert, update or delete progress tables directly.
- Public RPC entry points are SECURITY INVOKER. Privileged implementations stay in the unexposed `cookpath_private` schema, check `auth.uid()` and accept no user ID argument.
- The `(user_id, question_id)` primary key and append-only submission function retain the first submitted choice. Retrying another choice returns the original answer.
- Correctness is calculated against the private 300-question catalogue by the database.
- Sequential challenge unlocks are enforced on the server. Every earlier set requires five tasks and ten submitted answers. No calendar gate remains.
- Each write takes a per-account transaction lock to serialize competing submissions.

## Verification completed

- `node --test tests/progress.test.cjs tests/accounts.test.cjs`: 10 tests passed.
- `node tests/database.mjs`: applies the actual migration to PGlite and verifies isolation, immutable answers, denied direct writes, challenge gates, safe legacy import, anonymous denial, private catalogue denial, absence of public SECURITY DEFINER functions, and exact parity with all 300 app question IDs and correct-choice indices.
- Hosted database transaction: two synthetic users verified account isolation, answer immutability, rejected direct updates/deletes, challenge unlocks and anonymous denial. The transaction was rolled back; no test accounts or progress remain.
- Real anonymous REST request returns HTTP 401, permission denied for the progress RPC. Public Auth settings respond successfully and show email enabled.
- Supabase advisors: no security or performance warnings/errors. Informational findings: the private catalogue has no client RLS policy by design (deny access); two new indexes have not yet seen production usage. See [RLS no-policy explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) and [unused index explanation](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
- Browser preview: English desktop and Greek at 390px; no console errors. No claim of real email login or cross-device Auth verification is made yet.

Test dependencies are pinned in `/tmp/cookpath-test-runtime/package.json` and its lockfile. Override `COOKPATH_TEST_RUNTIME` to use another location. The vendored browser Supabase client is version 2.119.0, MIT-licensed; its licence is retained in `vendor/supabase-LICENSE`. It loads only when account mode is enabled.
