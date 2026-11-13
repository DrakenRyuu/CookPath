# CookPath account integration

## Status — 13 November 2026

The browser and CLI now both access the CookPath project owned by the user’s GitHub account, DrakenRyuu. Created the CookPath organization on its free plan and the CookPath project in Frankfurt (`eu-central-1`). The authoritative project is `kcohdrjkgvnhlsecvolc`, organization `zgwibreywcchpxkpsrfw`.

The hosted progress database is installed and verified. The sign-in dialog and account adapter are implemented in English and Greek. Auth return URLs are configured and verified. Public account mode remains disabled until a verified email sender is connected and a real delivered email sign-in succeeds. Existing public visitors can keep practicing with their browser progress.

- Project: https://supabase.com/dashboard/project/kcohdrjkgvnhlsecvolc
- URL settings: https://supabase.com/dashboard/project/kcohdrjkgvnhlsecvolc/auth/url-configuration
- Email delivery: https://supabase.com/dashboard/project/kcohdrjkgvnhlsecvolc/auth/smtp
- API URL and public publishable key are saved in `account-config.js`; `enabled: false` is intentional.
- Migration applied: `supabase/migrations/20261113120005_cookpath_accounts.sql`.

## Remaining activation

1. Account access is resolved through the official Supabase CLI browser login. The new project is visibly accessible in the GitHub dashboard. The plugin still reports an earlier, different organization/project (`gopcxdjvpkykohckhevz` / `wmeljscrxrrvikrhnqsn`); do not use that target for this app. Use the directly authenticated CLI with explicit `--remote=kcohdrjkgvnhlsecvolc`.
2. Completed: Auth Site URL is `https://cookpath.onrender.com/`; allowed return URLs are that root and `https://cookpath.onrender.com/index.html`. `supabase/config.toml` saves these public settings with email verification enabled. Config diff reports zero declared updates; unrelated undeclared defaults are not pushed.
3. Remaining: connect a verified SMTP sender for public learners. Supabase’s built-in sender accepts only project-team addresses. No SMTP provider is configured. Brevo has a free transactional-email plan with 300 daily emails and no credit-card requirement. Its signup page is open for the owner to create/verify their account and accept the provider’s terms. Provider setup and real email delivery remain unverified. See [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp) and [Brevo free plan](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans). Keep email verification enabled.
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
- Hosted real Auth test on the authoritative project: two synthetic users and three independently authenticated passwordless sessions verified cross-session task/answer persistence, first-answer immutability, account isolation, direct-write rejection, sequential unlocks and anonymous denial. The admin-generated test links were verified without email delivery. All synthetic sessions were signed out and test users/progress removed. This does not verify SMTP delivery. See `tests/cloud-accounts.mjs`.
- Real anonymous REST request returns HTTP 401, permission denied for the progress RPC. Public Auth settings respond successfully and show email enabled.
- Supabase CLI advisors on the authoritative project: no security or performance warnings/errors. The private catalogue intentionally has no client access policy or table grants.
- Browser preview: English desktop and Greek at 390px; no console errors. Real passwordless API sessions have passed the hosted test; delivered-email and physical-device sign-in remain outstanding.

Test dependencies are pinned in `/tmp/cookpath-test-runtime/package.json` and its lockfile. Override `COOKPATH_TEST_RUNTIME` to use another location. The vendored browser Supabase client is version 2.119.0, MIT-licensed; its licence is retained in `vendor/supabase-LICENSE`. It loads only when account mode is enabled.

## Hosted test command

Run only against a deliberately selected project. Set `COOKPATH_CLOUD_TEST_URL` and `COOKPATH_CLOUD_TEST_KEYS` (a private file outside the repository containing that project’s API-key response), then run `node tests/cloud-accounts.mjs`. The test creates only uniquely named `@example.invalid` users and removes them with their synthetic progress. Never publish the private key file or put secret/service-role keys in browser code.
