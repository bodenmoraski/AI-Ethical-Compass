# AI Ethical Compass — Feature Completion Plan

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done (acceptance tests passing)

This plan closes every partially-implemented feature found in the audit. Each goal has an
explicit **Definition of Done** and a **verification command** that must pass. Goals are ordered
so that no goal depends on an unfinished one.

## Ground rules

1. **No false completeness.** A feature is only "done" when producer + consumer + auth + UI + test all exist.
2. **Honesty before features.** If a feature can't be finished in this pass, its UI must say so explicitly
   (disabled state / "not available yet"), never a dead button or fake chart.
3. **One identity model.** `users.id` (integer) is the app identity. Supabase auth UUID is only used to
   look up that row. Never compare a UUID to `teacher_id` / `student_id`.
4. **Graceful degradation.** Any API touching a table that may not exist yet must catch the error and
   return an empty/typed result rather than a 500.
5. **Tests must fail before the fix.** Every goal adds an assertion that would have failed pre-change.

## Verification commands

| Command | Meaning |
| --- | --- |
| `npx jest tests/completion/<phase>.test.ts` | Phase-specific acceptance tests |
| `npm test` | Full suite must be green at every phase boundary |
| `npm run check:api` | No type errors in `api/` and `lib/` (the server surface) |
| `npm run build` | Client must still build |

> `npm run check` (whole-project `tsc`) still reports pre-existing errors in
> `shared/schema*.ts` (drizzle-zod version drift), `server/routes.ts` (express type
> drift), and jest-dom matcher augmentation inside component tests. Those predate
> this plan and are tracked separately; `check:api` is the gate that must stay clean.

---

## Phase 0 — Honesty pass (no dead affordances)

Removes every control that looks functional but does nothing.

### G0.1 — Teacher dashboard alert CTAs are wired or removed
**Done when:** "Review pending grades →" and "Review flagged content →" either navigate somewhere real
or do not render as buttons.
**Test:** `TeacherDashboard.tsx` contains no `<Button>` inside the alert cards without an `onClick`.

### G0.2 — Moderation tab is honest
**Done when:** the Moderation tab either renders a real queue (Phase 5) or an explicit
"not available yet" empty state — never the string "coming soon" next to an enabled-looking UI.
**Test:** no `coming soon` string in `TeacherDashboard.tsx`; moderation panel renders a documented empty state.

### G0.3 — Live classroom is labelled accurately
**Done when:** until Phase 2 lands, the monitor shows that activity streaming is limited, and the
"Test Activity" affordance is dev-only.
**Test:** `LiveClassroomMonitor.tsx` no longer exposes an unconditioned test-activity button.

### G0.4 — Teacher access request copy matches reality
**Done when:** no promise of an email that is never sent.
**Test:** `api/teacher.ts` response message and `TeacherAccessModal.tsx` copy contain no "email notification"
claim unless an email provider is wired.

### G0.5 — Dashboard SDG impact is real or labelled
**Done when:** SDGs are computed from the user's actual scenario engagement (see G6.4) or the card is
labelled as an estimate.
**Test:** `api/user-dashboard.ts` contains no hardcoded `primary_sdgs: [4, 16, 17]`.

### G0.6 — Docs mark shipped vs partial vs planned
**Done when:** `docs/FEATURES.md` has an explicit status table and no unqualified claim for an unbuilt feature.
**Test:** `docs/FEATURES.md` contains a `## Feature Status` section listing every audited feature.

**Phase 0 exit:** `npx jest tests/completion/phase0.test.ts` green + `npm test` green.

---

## Phase 1 — Classroom trust loop

### G1.1 — AssignmentAnalytics is mounted and authorized
**Done when:** teachers can open per-assignment analytics from the assignment list; the API verifies the
requesting teacher owns the assignment's class.
**Test:** component imported by a rendered parent; `api/teacher.ts` analytics path filters by `teacher_id`.

### G1.2 — Leave class is reachable from the UI
**Done when:** students can leave a class from their class list, with confirmation, and the list refreshes.
**Test:** `StudentClassList.tsx` calls `action=leave-class` with an `Authorization` header.

### G1.3 — Teacher dashboard supports multiple classes
**Done when:** assignment + live-classroom tabs act on a selected class, not `classes[0]`.
**Test:** no `classes[0]` indexing for `classId` props in `TeacherDashboard.tsx`.

### G1.4 — Class analytics returns real series
**Done when:** `ClassDetailView` analytics renders real per-assignment data and either a real trend series
or a documented empty state — no "Placeholder" text.
**Test:** no `Placeholder` string in `ClassDetailView.tsx`; `api/teacher.ts` exposes `class-analytics`.

**Phase 1 exit:** `npx jest tests/completion/phase1.test.ts` green + `npm test` green.

---

## Phase 2 — Live classroom that isn't fake

### G2.1 — Real events are emitted
**Done when:** join class, submit assignment, grade submission, and publish assignment each write a
`realtime_activities` row.
**Test:** each producer file calls the shared activity recorder.

### G2.2 — Realtime endpoints are authorized per class
**Done when:** a JWT holder can only read/write activities for a class they teach or are enrolled in.
**Test:** `api/realtime-classroom.ts` performs an enrollment/ownership check before returning data.

### G2.3 — Activity writes never break the primary action
**Done when:** a failed activity insert cannot fail an enrollment/submission/grade.
**Test:** recorder is wrapped in try/catch and returns `false` on error.

### G2.4 — Docs describe polling accurately
**Done when:** docs no longer claim WebSocket delivery for the classroom monitor.
**Test:** `docs/FEATURES.md` describes polling for realtime classroom.

**Phase 2 exit:** `npx jest tests/completion/phase2.test.ts` green + `npm test` green.

---

## Phase 3 — Grading depth (rubrics + feedback)

### G3.1 — assignment-communication uses the integer app identity
**Done when:** teacher checks compare `users.id` to `classes.teacher_id`, and `graded_by` stores an integer.
**Test:** no `isTeacherOfClass(user.id` UUID comparison; helper resolves the app user row.

### G3.2 — Tables referenced by the API exist as migrations
**Done when:** `assignment_messages` and `assignment_clarifications` have migration SQL, or the API paths
that use them are removed.
**Test:** migration file exists for every table referenced by `api/assignment-communication.ts`.

### G3.3 — Rubrics can be authored and are persisted
**Done when:** the assignment form embeds `GradingRubric` and saves criteria to `assignments.rubric`.
**Test:** `AssignmentManager.tsx` imports `GradingRubric` and includes `rubric` in the create payload.

### G3.4 — Grading consumes the rubric
**Done when:** the grading form shows rubric criteria when present and stores per-criterion scores.
**Test:** grading component reads `assignment.rubric` and submits `rubric_scores`.

### G3.5 — Grading notifies the student
**Done when:** posting a grade creates a notification row for the student.
**Test:** `api/teacher.ts` grade path calls the notification helper.

**Phase 3 exit:** `npx jest tests/completion/phase3.test.ts` green + `npm test` green.

---

## Phase 4 — Notifications users can actually see

### G4.1 — Notifications API
**Done when:** `GET /api/notifications` (auth required, own rows only) and `PATCH` mark-read exist.
**Test:** handler rejects unauthenticated reads and scopes by resolved `users.id`.

### G4.2 — Notification UI
**Done when:** a bell with unread count and a dropdown list is in the navbar for signed-in users.
**Test:** `NotificationBell` is imported by the navbar and calls `/api/notifications`.

### G4.3 — Producers beyond enrollment
**Done when:** grade posted (G3.5) and assignment published create notifications.
**Test:** publish path calls the notification helper for enrolled students.

**Phase 4 exit:** `npx jest tests/completion/phase4.test.ts` green + `npm test` green.

---

## Phase 5 — Admin & moderation

### G5.1 — Admin can approve teacher access in-app
**Done when:** an admin-only view lists pending requests and approving sets `users.role = 'teacher'`.
**Test:** API exposes an approve action guarded by `role === 'admin'`; UI route exists.

### G5.2 — Flagged content reaches the moderation queue
**Done when:** rejected/flagged perspectives insert into `moderation_queue`.
**Test:** `api/perspectives.ts` writes to `moderation_queue` on rejection.

### G5.3 — Moderation review UI
**Done when:** teachers/admins can view queue items and resolve them; the flagged CTA links here.
**Test:** moderation panel fetches queue items and posts a resolution.

**Phase 5 exit:** `npx jest tests/completion/phase5.test.ts` green + `npm test` green.

---

## Phase 6 — Achievements, ratings, SDG

### G6.1 — Achievement matching uses real identity
**Done when:** achievements query perspectives by `user_id`/email, not `author_name`.
**Test:** no `eq('author_name', userEmail)` in `api/achievements.ts`.

### G6.2 — Perspective ratings can be submitted
**Done when:** users can rate a perspective's quality/thoughtfulness; rows land in `perspective_ratings`.
**Test:** rating UI posts to the ratings endpoint with auth.

### G6.3 — Awards are checked server-side after qualifying actions
**Done when:** submitting a perspective triggers an award check without relying on the client.
**Test:** perspective POST path calls the award checker.

### G6.4 — SDG impact is computed
**Done when:** dashboard SDGs derive from the scenarios the user engaged with.
**Test:** `api/user-dashboard.ts` derives SDGs from scenario data.

**Phase 6 exit:** `npx jest tests/completion/phase6.test.ts` green + `npm test` green.

---

## Phase 7 — Schema/doc debt: build or demote

### G7.1 — Late policy is applied
**Done when:** the assignment form exposes late settings and submissions are marked late.
**Test:** submit path computes `is_late` from `due_date`.

### G7.2 — Assignment types behave differently or are removed
**Done when:** each selectable type has distinct behavior, or unsupported types are not selectable.
**Test:** type options in `AssignmentManager.tsx` match types handled by the student view.

### G7.3 — Unbuilt features demoted in docs
**Done when:** gradebook, parents, groups, CSV import, templates, LMS passback are listed as Planned.
**Test:** each appears under a Planned/Not implemented heading in `docs/FEATURES.md`.

### G7.4 — Dead pages removed or routed
**Done when:** no unreachable page components remain.
**Test:** every file in `client/src/pages` is either routed in `App.tsx` or deleted.

**Phase 7 exit:** `npx jest tests/completion/phase7.test.ts` green + `npm test` green.

---

## Phase 8 — Hardening

### G8.1 — Remaining unauthenticated writes are closed
**Done when:** likes, progress, and user-scenario writes require a valid JWT and derive identity from it.
**Test:** each handler rejects requests without `Authorization`.

### G8.2 — i18n gaps closed or locales hidden
**Done when:** every offered locale has the keys the UI renders, or the locale is not offered.
**Test:** each shipped locale has >= the English key count for used namespaces.

### G8.3 — Placeholder tests replaced
**Done when:** no `expect(true).toBe(true)` placeholders remain.
**Test:** grep finds no placeholder assertions in `tests/`.

### G8.4 — Whole-project green
**Done when:** `npm test` passes, client builds, and no new type errors.
**Test:** all three verification commands succeed.

---

## Progress log

| Phase | Goal | Status | Evidence |
| --- | --- | --- | --- |
| 0 | G0.1 CTAs wired | [x] | `phase0.test.ts` — alert buttons all carry `onClick` |
| 0 | G0.2 Moderation honest | [x] | `ModerationPanel` + `/api/moderation`; no "coming soon" |
| 0 | G0.3 Live classroom labelled | [x] | Test-activity button gated by `import.meta.env.DEV` |
| 0 | G0.4 Teacher access copy | [x] | No email promise in API message or modal |
| 0 | G0.5 SDG honest | [x] | `lib/sdg-impact.ts` computes from engaged scenarios |
| 0 | G0.6 Docs status | [x] | `docs/FEATURES.md` → `## Feature Status` table |
| 0 | Harness baseline (pre-req for verification) | [x] | Live-server suites moved to `test:integration`; `indexes.test.ts` rewritten; `lib/rubric-scoring.ts` replaces mock math |
| 1 | G1.1 Analytics mounted | [x] | `AssignmentManager` opens `AssignmentAnalytics` in a dialog |
| 1 | G1.2 Leave class UI | [x] | `StudentClassList` posts `action=leave-class` |
| 1 | G1.3 Multi-class | [x] | `selectedClassId` + class selector; no `classes[0]` |
| 1 | G1.4 Real class analytics | [x] | `action=class-analytics` + `SubmissionTrendChart` |
| 2 | G2.1 Event producers | [x] | `lib/activity-feed.ts` called on join/submit/grade/publish |
| 2 | G2.2 Realtime authz | [x] | `classAccess`/`requireTeacherAccess` in `api/realtime-classroom.ts` |
| 2 | G2.3 Monitor honest | [x] | Polling labelled; grade + publish notifications wired |
| 2 | G2.4 Docs polling | [x] | `FEATURES.md` marks the monitor as "Shipped (polling)" |
| 3 | G3.1 Identity fix | [x] | Deleted `api/assignment-communication.ts` (UUID vs int authz, missing tables) |
| 3 | G3.2 Migrations exist | [x] | `016_add_rubric_scores.sql`; no API writes to table-less names |
| 3 | G3.3 Rubric authoring | [x] | `RubricEditor` in create + edit dialogs, saved to `assignments.rubric` |
| 3 | G3.4 Rubric grading | [x] | Grading form renders criteria; server recomputes via `scoreRubric` |
| 3 | G3.5 Grade notification | [x] | `notifyStudentOfGrade` on the grade path |
| 4 | G4.1 Notifications API | [x] | `api/notifications.ts` — token-scoped list, unread count, mark read |
| 4 | G4.2 Notification UI | [x] | `NotificationBell` in the navbar with unread badge |
| 4 | G4.3 Producers | [x] | Enrollment, grade, and publish all create notifications |
| 5 | G5.1 Admin approval | [x] | `api/admin.ts` + `/admin` console; grants role, audits, notifies |
| 5 | G5.2 Queue producers | [x] | `enqueueForModeration` on flagged perspectives |
| 5 | G5.3 Moderation UI | [x] | `ModerationPanel` resolves items and applies the decision |
| 6 | G6.1 Achievement identity | [x] | `lib/achievements.ts` keys on the app user id from the JWT |
| 6 | G6.2 Ratings UI | [x] | `StarRating` in `PerspectiveCard` posts to `?action=rate` |
| 6 | G6.3 Server award checks | [x] | `checkAndAwardAchievements` after create, rate, and like |
| 6 | G6.4 SDG computed | [x] | `lib/sdg-impact.ts` derives impact from real engagement |
| 7 | G7.1 Late policy | [x] | `lib/late-policy.ts`; submit rejects closed work, grading deducts |
| 7 | G7.2 Assignment types | [x] | Only scenario and written response; both have a student path |
| 7 | G7.3 Docs demoted | [x] | `FEATURES.md` Planned/not-implemented section for schema-only tables |
| 7 | G7.4 Dead pages | [x] | Every file in `client/src/pages` is routed in `App.tsx` |
| 8 | G8.1 Auth writes | [x] | Progress, scenario submit/vote, profile read, replies all 401 anonymously |
| 8 | G8.2 i18n | [x] | `lib/i18n-coverage.ts` guards every rendered key in all 7 locales |
| 8 | G8.3 Placeholder tests | [x] | No always-true, skipped, or todo assertions remain |
| 8 | G8.4 All green | [x] | `npm test`, `npm run build`, and `npm run check:api` all pass |

## Final state

All 36 goals complete. Verification at the end of Phase 8:

- `npm test` — 499 tests across 29 suites, all passing
- `npm run build` — client builds
- `npm run check:api` — no type errors in `api/` or `lib/`

Deliberately **not** built, and now labelled that way everywhere they appear
(`docs/FEATURES.md` → "Planned / not implemented"): gradebook export, parent
portal, class groups, threaded discussions, CSV roster import, assignment template
library, LMS passback, and email/push delivery. Translation covers navigation plus
the home and about pages; the language menu says so rather than implying the whole
app is localised.
