# CookPath account integration

## Status — 14 November 2026

The browser and CLI now both access the CookPath project owned by the user’s GitHub account, DrakenRyuu. Created the CookPath organization on its free plan and the CookPath project in Frankfurt (`eu-central-1`). The authoritative project is `kcohdrjkgvnhlsecvolc`, organization `zgwibreywcchpxkpsrfw`.

Account mode is enabled for the public release. Brevo custom SMTP is configured privately in Supabase; the verified sender is named CookPath. An English/Greek code email reached the owner’s Gmail inbox on 14 November, and entering its 8-digit code successfully signed in on the public site; refresh retained the session. The final public sign-in/reload check is recorded in DEPLOYMENT.md. The interface remains available in English and Greek.
- Project: https://supabase.com/dashboard/project/kcohdrjkgvnhlsecvolc
- URL settings: https://supabase.com/dashboard/project/kcohdrjkgvnhlsecvolc/auth/url-configuration
- Email delivery: https://supabase.com/dashboard/project/kcohdrjkgvnhlsecvolc/auth/smtp
- API URL and public publishable key are saved in `account-config.js`; `enabled: true` activates personal-account progress.
- Migration applied: `supabase/migrations/20261113120005_cookpath_accounts.sql`.

## Configuration and operations

- Authoritative project: `kcohdrjkgvnhlsecvolc`, organization `zgwibreywcchpxkpsrfw`, visible in the GitHub account DrakenRyuu. Use the directly authenticated Supabase CLI with explicit `--remote=kcohdrjkgvnhlsecvolc`. The plugin still reports an earlier unused project; do not apply this app’s changes there.
- Auth Site URL is `https://cookpath.onrender.com/`; allowed return URLs are that root and `https://cookpath.onrender.com/index.html`. Email verification stays enabled.
- Brevo SMTP uses `smtp-relay.brevo.com:587`. The key, username and verified sender address are stored privately in Supabase and deliberately omitted from `supabase/config.toml` and all public files. Do not add them to the repository. Future config pushes preserve the undeclared SMTP settings.
- Both confirmation and magic-link emails use `supabase/templates/sign-in.html`, with English and Greek text and an 8-digit, single-use sign-in code entered inside CookPath.
- Supabase’s project email limit is 30/hour with a 60-second minimum interval per email address. The email limit was applied in the dashboard because CLI v3.1 does not manage this property yet. Brevo’s free allowance is 300 emails/day. See [Brevo limits](https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans).
- The verified sender currently uses Brevo’s managed sending domain for the freemail address. Real inbox delivery passed. A branded owned domain can be configured later.
- The local sign-in UI preview is `http://127.0.0.1:4175/?lang=en` while its temporary server runs. Public users should use `https://cookpath.onrender.com/`.

## Personal progress analytics

My account includes Check my progress: saved task completion, completed challenges, questions answered, correct/wrong counts and percentages, and a breakdown of all 30 challenges. Percentages use submitted answers only; unanswered quizzes show no accuracy score. Statistics derive from the account-owned progress already returned by the existing RPC. No extra tracking table or public access is introduced. A different account or sign-out clears the displayed statistics. All labels support English and Greek.

## Login and saved progress

The dialog uses [Supabase email OTP codes](https://supabase.com/docs/guides/auth/auth-email-passwordless); learners do not need a password. New accounts are confirmed by entering the emailed code. Legacy expired-link callbacks show a recovery message and offer a fresh code. Sign-out clears the displayed account state. Cached progress is keyed by user ID. A delayed response from one account cannot populate another account's view.

Earlier browser progress is offered as an explicit import. It is never silently assigned to a signed-in account. Existing server answers retain their first choice during import. The browser copy is retained. If earlier history includes a still-locked challenge, the import offer remains available and explains how to import the remainder after preceding challenges are finished. It is never marked fully imported while history is still pending.

## Database guarantees

- RLS restricts each account to its own task and quiz rows. Browser roles cannot insert, update or delete progress tables directly.
- Public RPC entry points are SECURITY INVOKER. Privileged implementations stay in the unexposed `cookpath_private` schema, check `auth.uid()` and accept no user ID argument.
- The `(user_id, question_id)` primary key and append-only submission function retain the first submitted choice. Retrying another choice returns the original answer.
- Correctness is calculated against the private 300-question catalogue by the database.
- Sequential challenge unlocks are enforced on the server. Every earlier set requires five tasks and ten submitted answers. No calendar gate remains.
- Each write takes a per-account transaction lock to serialize competing submissions.

## Verification completed

- `node --test tests/progress.test.cjs tests/accounts.test.cjs`: 15 tests passed, including partial legacy-history import and first-answer preservation.
- `node tests/database.mjs`: applies the actual migration to PGlite and verifies isolation, immutable answers, denied direct writes, challenge gates, safe legacy import, anonymous denial, private catalogue denial, absence of public SECURITY DEFINER functions, and exact parity with all 300 app question IDs and correct-choice indices.
- Hosted real Auth test on the authoritative project: two synthetic users and three independently authenticated passwordless sessions verified cross-session task/answer persistence, first-answer immutability, account isolation, direct-write rejection, sequential unlocks and anonymous denial. The admin-generated test links were verified without email delivery. All synthetic sessions were signed out and test users/progress removed. This does not verify SMTP delivery. See `tests/cloud-accounts.mjs`.
- Real anonymous REST request returns HTTP 401, permission denied for the progress RPC. Public Auth settings respond successfully and show email enabled.
- Supabase CLI advisors on the authoritative project: no security or performance warnings/errors. The private catalogue intentionally has no client access policy or table grants.
- Browser preview: English desktop and Greek at 390px; no console errors. Real passwordless API sessions passed the hosted test. A delivered Gmail inbox message and its live verification callback also passed. Two separate physical devices were not available for testing; independent Auth sessions verified the same cross-session storage contract.

Test dependencies are pinned in `/tmp/cookpath-test-runtime/package.json` and its lockfile. Override `COOKPATH_TEST_RUNTIME` to use another location. The vendored browser Supabase client is version 2.119.0, MIT-licensed; its licence is retained in `vendor/supabase-LICENSE`. It loads only when account mode is enabled.

## Hosted test command

Run only against a deliberately selected project. Set `COOKPATH_CLOUD_TEST_URL` and `COOKPATH_CLOUD_TEST_KEYS` (a private file outside the repository containing that project’s API-key response), then run `node tests/cloud-accounts.mjs`. The test creates only uniquely named `@example.invalid` users and removes them with their synthetic progress. Never publish the private key file or put secret/service-role keys in browser code.
