-- Migration 007: Teacher Dashboard and Classroom Management Features

-- Classes/Sections table
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  school_year TEXT DEFAULT EXTRACT(YEAR FROM NOW())::TEXT,
  semester TEXT DEFAULT 'Fall',
  subject TEXT,
  grade_level TEXT,
  class_code TEXT UNIQUE NOT NULL, -- for student enrollment
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class enrollments (many-to-many relationship between users and classes)
CREATE TABLE class_enrollments (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active', -- active, dropped, completed
  UNIQUE(class_id, student_id)
);

-- Groups within classes
CREATE TABLE class_groups (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 6,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships
CREATE TABLE group_memberships (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES class_groups(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

-- Assignments
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  assignment_type TEXT DEFAULT 'scenario', -- scenario, custom, discussion
  scenario_ids INTEGER[], -- Array of scenario IDs if assignment_type is 'scenario'
  due_date TIMESTAMP WITH TIME ZONE,
  points_possible INTEGER DEFAULT 100,
  rubric JSONB, -- Rubric criteria and scoring
  is_published BOOLEAN DEFAULT false,
  allow_late_submissions BOOLEAN DEFAULT true,
  late_penalty_per_day INTEGER DEFAULT 0, -- Percentage penalty per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL, -- Contains answers, perspectives, etc.
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_late BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted', -- submitted, graded, returned
  auto_score INTEGER, -- Automatically calculated score
  manual_score INTEGER, -- Teacher-assigned score
  final_score INTEGER, -- Final score after adjustments
  feedback TEXT, -- Teacher feedback
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by INTEGER REFERENCES users(id),
  UNIQUE(assignment_id, student_id)
);

-- Detailed student engagement tracking
CREATE TABLE student_engagement (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  scenario_id INTEGER REFERENCES scenarios(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  actions_taken JSONB, -- Array of user actions with timestamps
  perspectives_submitted INTEGER DEFAULT 0,
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  engagement_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion threads for assignments
CREATE TABLE discussion_threads (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  initial_post TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion posts
CREATE TABLE discussion_posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_post_id INTEGER REFERENCES discussion_posts(id), -- For threaded replies
  is_teacher_post BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved', -- pending, approved, flagged, removed
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gradebook entries (for flexible grading)
CREATE TABLE gradebook_entries (
  id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'assignment', -- assignment, participation, quiz, project
  points_earned DECIMAL(5,2),
  points_possible DECIMAL(5,2),
  letter_grade TEXT,
  is_excused BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Parent/Guardian relationships
CREATE TABLE parent_relationships (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'parent', -- parent, guardian, family
  is_primary_contact BOOLEAN DEFAULT false,
  can_view_grades BOOLEAN DEFAULT true,
  can_receive_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Notifications system
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- assignment_due, grade_posted, discussion_reply, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data (assignment_id, class_id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation queue
CREATE TABLE moderation_queue (
  id SERIAL PRIMARY KEY,
  content_type TEXT NOT NULL, -- discussion_post, perspective, assignment_submission
  content_id INTEGER NOT NULL,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  flagged_by INTEGER REFERENCES users(id),
  flagged_reason TEXT,
  content_text TEXT,
  ai_analysis JSONB, -- AI moderation results
  status TEXT DEFAULT 'pending', -- pending, reviewed, approved, rejected
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment templates
CREATE TABLE assignment_templates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Contains the assignment structure
  category TEXT DEFAULT 'ethics', -- ethics, critical_thinking, discussion
  is_public BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update users table to include teacher-specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS office_hours TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_communication TEXT DEFAULT 'email';

-- Create indexes for performance
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_student_engagement_student ON student_engagement(student_id);
CREATE INDEX idx_student_engagement_class ON student_engagement(class_id);
CREATE INDEX idx_discussion_posts_thread ON discussion_posts(thread_id);
CREATE INDEX idx_gradebook_entries_class ON gradebook_entries(class_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);

-- Enable RLS for all new tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gradebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Classes: Teachers can manage their own classes, students can view their enrolled classes
CREATE POLICY "Teachers can manage their own classes" ON classes
  FOR ALL USING (teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Students can view their enrolled classes" ON classes
  FOR SELECT USING (id IN (
    SELECT class_id FROM class_enrollments 
    WHERE student_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

-- Class enrollments: Teachers can manage enrollments for their classes
CREATE POLICY "Teachers can manage class enrollments" ON class_enrollments
  FOR ALL USING (class_id IN (
    SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Students can view their own enrollments" ON class_enrollments
  FOR SELECT USING (student_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email'));

-- Assignments: Teachers can manage assignments for their classes
CREATE POLICY "Teachers can manage assignments" ON assignments
  FOR ALL USING (class_id IN (
    SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

CREATE POLICY "Students can view published assignments" ON assignments
  FOR SELECT USING (is_published = true AND class_id IN (
    SELECT class_id FROM class_enrollments 
    WHERE student_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
  ));

-- Assignment submissions: Students can manage their own submissions, teachers can view all
CREATE POLICY "Students can manage their own submissions" ON assignment_submissions
  FOR ALL USING (student_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email'));

CREATE POLICY "Teachers can view all submissions for their assignments" ON assignment_submissions
  FOR SELECT USING (assignment_id IN (
    SELECT id FROM assignments WHERE class_id IN (
      SELECT id FROM classes WHERE teacher_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
    )
  ));

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can only see their own notifications" ON notifications
  FOR ALL USING (recipient_id = (SELECT id FROM users WHERE email = auth.jwt() ->> 'email'));

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gradebook_entries_updated_at BEFORE UPDATE ON gradebook_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 