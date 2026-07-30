# How to Run SQL Queries in Supabase

## Quick Answer

**If you run all queries at once**: Only the **last query** will show results in a table below the editor. Earlier queries won't show anything visible.

**Better approach**: Run queries **one at a time** to see each result clearly.

---

## Step-by-Step Guide

### 1. Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### 2. Run ONE Query at a Time

**Start with the most important query:**

#### Option A: Use the Individual Query Files (EASIEST)

I've created individual files for the most important queries:

- **`QUERY-1-completion-rates-only.sql`** - Start here! Shows completion rates
- **`QUERY-6-comprehensive-summary.sql`** - Shows completion rates + time spent together
- **`QUERY-2-time-spent-only.sql`** - Shows time spent details

**How to use:**
1. Open `QUERY-1-completion-rates-only.sql` in your editor
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
5. **You'll see a table with results below!**

#### Option B: Copy from the Full File

If using `extract-pilot-metrics.sql`:
1. Open the file
2. Copy **only ONE query** (from the `SELECT` to the `;`)
3. Paste into Supabase SQL Editor
4. Run it
5. Check results
6. Move to the next query

---

## What You'll See

### When a Query Works:

You'll see a **table** below the SQL editor with:
- **Column headers** (class_name, completion_rate_pct, etc.)
- **Rows of data** (one row per result)
- **Scrollable** if there are many rows
- **Export button** (usually ⬇️ icon) to download as CSV

**Example table you might see:**
```
class_name | assignment_title     | total_students | students_submitted | completion_rate_pct
-----------|----------------------|----------------|-------------------|-------------------
Ethics 101 | AI Essay Scenario    | 25             | 21                | 84.00
Ethics 101 | Facial Recognition   | 25             | 23                | 92.00
```

### If You Have No Data:

You'll see:
- **Empty table** (0 rows)
- **Column headers** but no data rows
- This means you haven't run a pilot yet, or no data exists

### If There's an Error:

You'll see:
- **Red error message** in red text
- Common errors:
  - "relation does not exist" = tables don't exist (run migrations first)
  - "syntax error" = check the SQL syntax
  - "permission denied" = check your database permissions

---

## Recommended Workflow

### Step 1: Check if You Have Data

Run **QUERY-1-completion-rates-only.sql** first:

```sql
SELECT 
  c.name AS class_name,
  a.title AS assignment_title,
  COUNT(DISTINCT ce.student_id) AS total_students,
  COUNT(DISTINCT asub.student_id) AS students_submitted,
  ROUND(
    COUNT(DISTINCT asub.student_id)::numeric / 
    NULLIF(COUNT(DISTINCT ce.student_id), 0) * 100, 
    2
  ) AS completion_rate_pct
FROM assignments a
JOIN classes c ON a.class_id = c.id
LEFT JOIN class_enrollments ce ON c.id = ce.class_id AND ce.status = 'active'
LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id 
  AND asub.status IN ('submitted', 'graded')
GROUP BY c.id, c.name, a.id, a.title
ORDER BY completion_rate_pct DESC;
```

**What to look for:**
- If you see rows with data → Great! You have pilot data
- If you see 0 rows → No data yet (need to run a pilot)

### Step 2: Export the Results

If you got data:
1. Click the **Export/Download** button (usually ⬇️ or CSV icon)
2. Save as CSV
3. Open in Excel/Google Sheets
4. Copy the numbers into your grant submission

### Step 3: Get Time Spent Data

Run **QUERY-6-comprehensive-summary.sql** to get completion rates AND time spent together.

---

## ⚠️ Important: Don't Run All Queries at Once!

**Bad:** Copying the entire `extract-pilot-metrics.sql` file and running it
- Only the last query will show results
- You won't know which results belong to which query
- Confusing and hard to use

**Good:** Running one query at a time
- Clear results for each query
- Easy to understand what each query shows
- Can export each result separately

---

## Exporting Results

### To CSV:
1. After running a query, look for a download/export button
2. Usually in the top-right of the results table
3. Click it → Downloads as CSV file
4. Open in Excel/Google Sheets

### To Copy:
1. Select the table data
2. Right-click → Copy
3. Paste into your grant document

---

## Quick Test Query

Want to check if your database has the tables? Run this first:

```sql
-- Quick test: Check if tables exist
SELECT 
  'classes' AS table_name, COUNT(*) AS row_count FROM classes
UNION ALL
SELECT 'assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'assignment_submissions', COUNT(*) FROM assignment_submissions
UNION ALL
SELECT 'student_engagement', COUNT(*) FROM student_engagement;
```

This will show you if the tables exist and how many rows they have.

---

## Summary

1. **Open Supabase SQL Editor**
2. **Copy ONE query** (start with QUERY-1-completion-rates-only.sql)
3. **Paste and Run** (Click "Run" button)
4. **See results in a table** below the editor
5. **Export if needed** (download as CSV)
6. **Run next query** if you need more data

**Most important:** Run queries **one at a time**, not all at once!
