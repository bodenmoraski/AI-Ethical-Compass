# Overnight Validation Log

Started: 2026-07-29 ~20:00 EDT
Purpose: Stress-test the completion work — find bugs, auth gaps, scalability
issues, and anything else that would bite later. Keep fixing and re-testing.

## Commands that must stay green
- `npm test` (629+ tests)
- `npm run build`
- `npm run check:api`
- `npm run test:validation`

---

## Session entries

### 2026-07-29 20:00 — Kickoff
Built new suites under `tests/validation/`:
- `security-hardening.test.ts`
- `scalability.test.ts`
- `lib-edge-cases.test.ts`
- `api-surface-audit.test.ts`
- `schema-consistency.test.ts`
- `identity-contracts.test.ts`
- `performance.test.ts`
- `idempotency.test.ts`

### 2026-07-29 20:15 — First run + fixes
**Validation:** 130 tests green after fixing test harness bugs (apostrophe in
single-quoted `it()` title; moderation role check regex; grade-block slice
hitting the import of `notifyStudentOfGrade`).

**Real bugs / scale issues found and fixed:**

1. **CRITICAL — Rankings reputation scan was unbounded.**
   `calculateUserReputations()` selected every perspective on the platform with
   no `.limit` and no scenario filter. A popular scenario's rankings endpoint
   would read the entire table on every request.
   - Fix: scope by `scenarioId`; unscoped path now hard-caps at 2000.
   - Rankings fetch itself now `.order().limit(RANKINGS_FETCH_CAP=500)`.

2. **MEDIUM — Class analytics was O(days × submissions).**
   Engagement trend did `submissions.filter(...startsWith(day))` inside a 30-day
   loop. Same for per-assignment counts.
   - Fix: single-pass `Map` aggregation (`countsByDay`, `submittedByAssignment`).

3. **MEDIUM — Missing hot-path indexes.**
   Added `server/migrations/017_hot_path_indexes.sql`:
   - `notifications(recipient_id, is_read, created_at DESC)`
   - `realtime_activities(class_id, timestamp DESC)`
   - `perspective_ratings(perspective_id, user_email)`
   - `scenario_votes(scenario_id, user_email)`
   - partial index on late submissions

**Documented, not fixed this session (need your call later):**

4. **Dual progress tables.** Live API writes `user_progress` (integer `user_id`).
   Legacy `user_scenario_progress` (text `user_id`) still exists in migrations /
   `scripts/sql/016-create-user-scenario-progress.sql`. Operators can confuse
   them. Recommend: pick one, migrate, drop the other.

5. **Publish fan-out = 1 insert per student.**
   `announcePublishedAssignment` uses `Promise.all` (good) but still one
   `notifyStudentOfNewAssignment` call per enrollment. Fine for ~40 students;
   for 200+ prefer a batch `.insert([...])`.

6. **Identity model is still mixed by design.**
   - `users.id` (int) for classes / submissions / notifications
   - email string for `perspectives.user_id` and achievements
   Locked by `identity-contracts.test.ts` so it can't silently drift, but a
   future cleanup to all-integer FKs would simplify everything.

7. **Whole-project `tsc` still dirty** (pre-existing): drizzle-zod drift in
   `shared/schema*.ts`, express types in `server/routes.ts`, jest-dom matchers
   in component tests. Gate is `check:api`, which is clean.

### 2026-07-29 20:25 — Gate status
| Gate | Result |
| --- | --- |
| `npm run test:validation` | 142 passed / 9 suites |
| `npm test` | 641 passed / 38 suites |
| `npm run check:api` | clean |
| `npm run build` | clean |

Added after first pass:
- `idempotency.test.ts` (likes, ratings, awards, votes, late-close)
- `input-bounds.test.ts` (length / limit / score clamps)

### Follow-ups for you when you're back
- [ ] Run migration `017_hot_path_indexes.sql` in Supabase
- [ ] Decide fate of `user_scenario_progress` vs `user_progress`
- [ ] Consider batching assignment-publish notifications
- [ ] (Optional) unify perspective identity onto integer `users.id`

---

## Loop status
Background validation loop is armed (every ~12 minutes). On each tick it
re-runs the gates, fixes regressions, and appends here.

### 2026-07-29 20:18 — Loop tick 1
Gates re-run: all green (142 → 145 validation tests after this tick's fix).

**New finding fixed:**
8. **MEDIUM — Leaderboard GET limit uncapped; recalc scanned whole tables.**
   - `?limit=` accepted any integer (DoS via huge page).
   - `recalculateLeaderboard()` selected all perspectives / scenarios / ratings.
   - Fix: GET capped at 100; recalc fetches capped at 2000 each, ordered by recency.
   - Tests added under scalability suite.

Loop continues; next tick ~12 minutes.

### 2026-07-29 20:30 — Loop tick 2
Gates re-run: all green (644 full suite / 145→147+ validation).

**New findings fixed:**
9. **MEDIUM/PRIVACY — Platform stats selected every `users.email`.**
   Homepage country estimate loaded the full email column. Replaced with a
   headcount heuristic; no emails leave the DB for that counter.
10. **LOW — `collectMetrics` unbounded per-user scans.**
    Achievement checks now cap perspectives (500), scenarios (200), ratings (1000).

Loop continues.

### 2026-07-29 20:42 — Loop tick 3
Gates re-run: all green (646 full suite).

**New findings fixed:**
11. **HIGH — `{DEVYES}` moderation bypass worked in production.**
    Any student could embed the token in their perspective to skip AI moderation.
    Now gated on `NODE_ENV` / `VERCEL_ENV` !== production.
12. **MEDIUM/PRIVACY — Perspectives API logged full `req.body`.**
    Student writing and identity fields were going to serverless logs. Removed.
    Same cleanup on user-dashboard query logging.

Loop continues.

### 2026-07-29 20:54 — Loop tick 4
Gates re-run: all green (648 full suite / 152 validation).

**New finding fixed:**
13. **MEDIUM — XSS via Resources search highlight.**
    `highlightText` fed raw title/description into `dangerouslySetInnerHTML`
    and built a RegExp from the query without escaping. Now HTML-escapes the
    text and regex-escapes query words. Covered by `xss-hardening.test.ts`.

Loop continues.

### 2026-07-29 21:06 — Loop tick 5
Gates re-run: all green (651 full suite).

**New finding fixed:**
14. **MEDIUM — Ad-hoc Bearer parsing accepted `Bearer null` / `Bearer undefined`.**
    `user-profile`, `user-dashboard`, and `leaderboard` used raw `substring(7)`
    without the null-string guard in `lib/api-auth.getBearerToken`. Migrated
    those routes to the shared helper.

Loop continues.

### 2026-07-29 21:18 — Loop tick 6
Gates re-run: all green (652 full suite / 154 validation).

**New findings fixed:**
15. **LOW/MEDIUM — `teacher` and `student` APIs still used ad-hoc Bearer parsing.**
    Migrated both to `getBearerToken` (no remaining `substring(7)` in api/).
16. **LOW — Unbounded grade feedback / assignment text.**
    Feedback capped at 10k chars; assignment description 5k; instructions 20k.

Loop continues.

### 2026-07-29 21:30 — Loop tick 7
Gates re-run: all green (653 full suite / 155 validation).

**New findings fixed:**
17. **MEDIUM — Assignment submissions accepted unbounded JSONB payloads.**
    Now rejects empty/short responses, caps written response at 20k chars, and
    rejects serialized submission payloads over 50KB. Class description also
    capped at 5k.

Loop continues.

### 2026-07-29 21:42 — Loop tick 8
Gates re-run: all green (654 full suite / 157 validation).

**New findings fixed:**
18. **MEDIUM — User-submitted scenarios had no length bounds.**
    Title 5–200 chars; description 40–10k; category truncated to 100.
19. **LOW — Notification rows could grow with long titles.**
    `createNotification` now slices title to 200 and message to 2000.

Loop continues.

### 2026-07-29 21:54 — Loop tick 9
Gates re-run: all green (656 full suite / 157 validation). No new defects found.
Holding further drive-by changes pending commit decision.

### 2026-07-29 22:06 — Loop tick 10
Gates re-run: all green (656 / 157). Still clean; no new defects.

### 2026-07-29 22:18 — Loop tick 11
Gates re-run: all green (656 / 157). Still clean; no new defects.
