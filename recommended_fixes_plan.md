# Recommended Fixes and Implementation Plan

This document outlines four key issues identified in the AI Ethical Compass codebase, along with detailed plans for resolution. Each issue includes a description, optimal solution ideas, required changes in other parts of the codebase, suggested tests, and actionable TODO steps.

## Issue 1: Resolve TODO Placeholders in Teacher Dashboard Calculations

### Description
In `client/src/pages/TeacherDashboard.tsx` (lines 159-161), metrics like `averageEngagement`, `pendingGrades`, and `flaggedContent` are hardcoded with placeholder values (e.g., `0.78` for engagement) and marked with TODO comments to "Calculate from real data." This leads to inaccurate dashboard displays.

### Optimal Solution Ideas
- Fetch real data from Supabase via the `/api/teacher` endpoint.
- Calculate `averageEngagement` as the mean of `engagement_score` from the `student_engagement` table, aggregated per class.
- Compute `pendingGrades` by counting ungraded submissions in `assignment_submissions` where `status` is 'submitted'.
- Derive `flaggedContent` from a new or existing moderation table (e.g., count entries in `moderation_queue`).
- Use React Query for caching and optimistic updates to ensure real-time accuracy without UI lag.

### Required Changes in Other Parts
- Update `api/teacher.ts` to add or extend endpoints (e.g., `GET /api/teacher?action=stats`) that query and aggregate these metrics.
- Ensure database schema supports queries (e.g., add indexes on `student_engagement.engagement_score` and `assignment_submissions.status` for performance).
- Modify `TeacherDashboard.tsx` to integrate these fetches in the `fetchDashboardData` function.

### Suggested Tests
- Unit tests: Mock API responses in `tests/api/teacher.test.ts` to verify metric calculations (e.g., test average computation with sample data).
- Integration tests: In `tests/integration/teacher-dashboard.test.ts`, simulate user login and check if metrics update correctly after database inserts (use Jest with Supabase mocks).
- E2E tests: Use Cypress to load the dashboard, insert test data via API, and assert displayed values match calculations.

### Actionable TODO Steps
- [ ] Review and confirm database tables/fields for metrics (e.g., trace to schema in `README.md`).
- [ ] Extend `/api/teacher` endpoint to compute and return real stats.
- [ ] Replace hardcoded values in `TeacherDashboard.tsx` with API-fetched data.
- [ ] Add loading states and error handling for fetches.
- [ ] Write and run unit tests for calculations.
- [ ] Test integration in development environment with sample data.
- [ ] Deploy and verify in staging.

## Issue 2: Replace Mock Data in Analytics Components with Real API Integrations

### Description
Components like `client/src/components/teacher/AssignmentAnalytics.tsx` (lines ~50-120) rely on hardcoded mock data for stats and student progress, with a comment to "replace with actual API call." This creates unreliable visualizations and potential bugs in production.

### Optimal Solution Ideas
- Integrate React Query hooks (e.g., `useQuery`) to fetch from `/api/teacher?action=submissions&assignmentId=X` for real data.
- For charts, use a library like Recharts to render dynamic data (e.g., submission trends from timestamps).
- Handle edge cases like no submissions (show empty states) and add pagination for large student lists.
- Cache results with query keys tied to `assignmentId` for performance.

### Required Changes in Other Parts
- Enhance `api/teacher.ts` to support detailed analytics queries (e.g., aggregate submissions by date, join with `users` for student names).
- Update related components (e.g., `LiveClassroomMonitor.tsx`) if they share similar mocks.
- Add database views or functions for efficient aggregations (e.g., in a new migration script).

### Suggested Tests
- Unit tests: In `tests/components/teacher/AssignmentAnalytics.test.tsx`, mock `useQuery` and test rendering with various data sets (e.g., empty, full).
- Integration tests: In `tests/api/teacher.test.ts`, verify endpoint returns correct aggregated data from mock DB inserts.
- E2E tests: Use Playwright to navigate to analytics tab, create test assignments/submissions, and validate UI updates.

### Actionable TODO Steps
- [ ] Identify all mock data instances in analytics components (grep search for "mockStats" or similar).
- [ ] Create or extend API endpoint for real analytics data.
- [ ] Refactor component to use React Query for fetching.
- [ ] Implement error boundaries and loading skeletons.
- [ ] Develop unit tests for component rendering.
- [ ] Run integration tests with seeded database.
- [ ] Monitor performance in dev and optimize queries if needed.

## Issue 3: Consolidate or Remove Redundant SQL Fix Scripts

### Description
The root directory contains multiple overlapping "fix" scripts (e.g., `fix_all_user_id_consistency.sql`, `fix_rls_policies.sql`, `fix_teacher_rls.sql`, `fix_user_likes_table.sql`), many of which address similar issues like UUID consistency or RLS policies across migrations. These are likely artifacts from debugging and could conflict if run accidentally.

### Optimal Solution Ideas
- Merge fixes into the canonical migration files under `server/migrations/` (e.g., append to `010_fix_user_id_consistency.sql`).
- Use Drizzle ORM (per `drizzle.config.ts`) to manage schemas programmatically, reducing manual SQL files.
- Version-control migrations with timestamps and add a `migrations.md` doc for application order.

### Required Changes in Other Parts
- Update `server/migrate.ts` to reference only the consolidated migrations.
- Remove references to old scripts in any setup docs (e.g., `env-setup.md` or `README.md`).
- Ensure API files (e.g., `api/teacher.ts`) align with the final schema post-merge.

### Suggested Tests
- Schema tests: Use Jest to run migrations in a test DB and assert table structures (e.g., via `pg` queries).
- Migration integration tests: In `tests/api/setup.ts`, apply migrations and test data consistency (e.g., insert users and check UUIDs).
- Regression tests: Script to run all migrations sequentially and verify no errors or conflicts.

### Actionable TODO Steps
- [ ] List all fix scripts and map their contents to migration files.
- [ ] Merge non-redundant fixes into latest migration files.
- [ ] Delete obsolete scripts from the repository.
- [ ] Update migration runner and docs.
- [ ] Write schema validation tests.
- [ ] Run full migration sequence in a test environment.
- [ ] Commit and push changes.

## Issue 4: Fix Skipped Database Queries Due to Table Structure Issues

### Description
In `api/user-dashboard.ts` (lines ~170-180), queries for `user_likes` and `scenario_progress` are explicitly skipped with comments citing "table structure issues," leading to incomplete dashboard stats (e.g., `total_likes_given: 0`). This conflicts with the schema in `README.md` and could stem from inconsistencies in Supabase setup.

### Optimal Solution Ideas
- Fix schema by ensuring `user_likes` and `user_progress` tables exist with correct fields (e.g., add via migration: `CREATE TABLE user_likes (user_id UUID, perspective_id INTEGER, liked_at TIMESTAMP)`).
- Implement queries using Supabase client, joining tables for aggregated counts.
- Add fallback logic (e.g., return 0 if tables are missing, but log warnings) for graceful degradation.

### Required Changes in Other Parts
- Create a new migration in `server/migrations/` to align tables with schema.
- Update `client/src/pages/Dashboard.tsx` to display accurate stats from the fixed API.
- Adjust related APIs (e.g., `api/user-progress.ts`) if they reference these tables.

### Suggested Tests
- Unit tests: In `tests/api/user-dashboard.test.ts`, mock Supabase and test query execution with sample likes/progress data.
- Integration tests: Seed test data, call the endpoint, and assert response includes non-zero values.
- Error handling tests: Simulate table absence and check for graceful failures.

### Actionable TODO Steps
- [ ] Diagnose exact "table structure issues" by comparing schema to Supabase instance.
- [ ] Create migration to fix/add tables (e.g., add missing columns/indexes).
- [ ] Implement skipped queries in `api/user-dashboard.ts`.
- [ ] Add error handling and logging.
- [ ] Develop unit tests for the endpoint.
- [ ] Test with real database inserts.
- [ ] Update frontend consumers and verify UI. 