# CookPath

A bilingual English/Greek cooking school: 30 challenges, 150 practical tasks, 300 three-choice questions and 30 complete practice recipes. Five tasks and ten untimed questions per day; the next day unlocks at local midnight after completion. Progress is stored in each learner’s browser.

## November 2026 update

Centered navigation and school banner, subtle olive branches, 29 chefs with 37 rotating sourced quotes, and a new knife reference with 16 matching AI-generated knife images, sharpening guides, whetstones and grit ranges, and 30 steel entries with indicative HRC ranges. The knife-room panel features the centered CookPath symbol and two identical mirrored crossed knives.

See PHOTO-CREDITS.md, QUOTE-SOURCES.md and KNIFE-IMAGE-PROMPTS.md for source credits and generated-image prompts.

## Run locally

Run `node server.mjs` and open http://127.0.0.1:4173/. The public app is hosted at https://cookpath.onrender.com/. Updates to main deploy automatically on Render.

Tasks are self-confirmed; photo judging is disabled. The owner’s developer review page is excluded from the public deployment. The app includes a PWA manifest and service worker. Home-screen installation requires HTTPS or localhost.

## Challenge and account update — 13 November 2026

The course is now 30 challenges with five tasks, one recipe and ten questions each. A first quiz answer is final, survives reloads, and cannot be changed using the quiz controls. Finish all five tasks and ten questions to unlock the next challenge without a calendar wait. English and Greek are supported. Existing valid browser progress is preserved.

The Supabase account adapter and database migration are prepared and locally tested. Account mode is not activated because the Supabase connection is unavailable. Current live progress remains device-local. See ACCOUNTS-SETUP.md for the exact activation requirements and validation record.
