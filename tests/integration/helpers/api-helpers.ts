import { TEST_CONFIG, trackClass, trackAssignment, trackEnrollment, trackSubmission } from '../setup';
// Using native fetch (Node 18+)

export interface ClassData {
  id: number;
  name: string;
  class_code: string;
  subject: string;
  grade_level: string;
  teacher_id: number;
  description?: string;
  school_year?: string;
  semester?: string;
}

export interface AssignmentData {
  id: number;
  title: string;
  class_id: number;
  assignment_type: string;
  scenario_ids?: number[];
  due_date?: string;
  points_possible: number;
  instructions?: string;
  is_published: boolean;
}

export interface SubmissionData {
  id: number;
  assignment_id: number;
  student_id: number;
  submission_data: {
    perspectives: string[];
    answers?: Record<string, any>;
    timeSpent: number;
  };
  submitted_at: string;
  status: string;
  is_late: boolean;
}

export interface AnalyticsData {
  success: boolean;
  stats: {
    totalStudents: number;
    submittedCount: number;
    gradedCount: number;
    overdueCount: number;
    averageScore: number;
    completionRate: number;
    averageTimeSpent: number;
  };
  studentProgress: Array<{
    student_id: number;
    student_name: string;
    status: string;
    submitted_at?: string;
    final_score?: number;
    time_spent?: number;
  }>;
}

/**
 * Makes an authenticated API request
 */
async function makeApiRequest(
  method: string,
  endpoint: string,
  token: string,
  body?: any
): Promise<Response> {
  const url = `${TEST_CONFIG.API_BASE_URL}${endpoint}`;
  
  const options: any = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return response;
}

/**
 * Teacher creates a new class
 */
export async function createClass(
  teacherToken: string,
  classData?: Partial<ClassData>
): Promise<ClassData> {
  const timestamp = Date.now();
  const payload = {
    name: classData?.name || `${TEST_CONFIG.TEST_CLASS_PREFIX}Ethics ${timestamp}`,
    subject: classData?.subject || 'Computer Science',
    grade_level: classData?.grade_level || '12',
    description: classData?.description || 'Test class for integration testing',
    school_year: classData?.school_year || '2024',
    semester: classData?.semester || 'Fall',
  };

  const response = await makeApiRequest(
    'POST',
    '/api/teacher?action=classes',
    teacherToken,
    payload
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create class: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.class) {
    throw new Error(`Class creation failed: ${JSON.stringify(result)}`);
  }

  trackClass(result.class.id);
  return result.class;
}

/**
 * Student joins a class using class code
 */
export async function joinClass(
  studentToken: string,
  classCode: string
): Promise<any> {
  const response = await makeApiRequest(
    'POST',
    '/api/student?action=join-class',
    studentToken,
    { class_code: classCode }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to join class: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (result.enrollment?.id) {
    trackEnrollment(result.enrollment.id);
  }
  
  return result;
}

/**
 * Student leaves a class
 */
export async function leaveClass(
  studentToken: string,
  classId: number
): Promise<any> {
  const response = await makeApiRequest(
    'DELETE',
    '/api/student',
    studentToken,
    { class_id: classId }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to leave class: ${response.status} ${errorText}`);
  }

  return await response.json();
}

/**
 * Teacher creates an assignment
 */
export async function createAssignment(
  teacherToken: string,
  assignmentData: {
    class_id: number;
    title?: string;
    description?: string;
    instructions?: string;
    assignment_type?: string;
    scenario_ids?: number[];
    due_date?: string | null;
    points_possible?: number;
    is_published?: boolean;
  }
): Promise<AssignmentData> {
  const timestamp = Date.now();
  const payload = {
    class_id: assignmentData.class_id,
    title: assignmentData.title || `${TEST_CONFIG.TEST_ASSIGNMENT_PREFIX}${timestamp}`,
    description: assignmentData.description || 'Test assignment for integration testing',
    instructions: assignmentData.instructions || 'Complete the assigned scenarios and provide your perspective',
    assignment_type: assignmentData.assignment_type || 'scenario',
    scenario_ids: assignmentData.scenario_ids || [1, 2],
    due_date: assignmentData.due_date !== undefined ? assignmentData.due_date : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: assignmentData.points_possible || 100,
    is_published: assignmentData.is_published !== undefined ? assignmentData.is_published : true,
  };

  const response = await makeApiRequest(
    'POST',
    '/api/teacher?action=assignments',
    teacherToken,
    payload
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create assignment: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.assignment) {
    throw new Error(`Assignment creation failed: ${JSON.stringify(result)}`);
  }

  trackAssignment(result.assignment.id);
  return result.assignment;
}

/**
 * Student submits an assignment
 */
export async function submitAssignment(
  studentToken: string,
  assignmentId: number,
  submissionData: {
    perspectives: string[];
    answers?: Record<string, any>;
    timeSpent: number;
  }
): Promise<SubmissionData> {
  const response = await makeApiRequest(
    'POST',
    '/api/user-dashboard?action=submit-assignment',
    studentToken,
    {
      assignmentId,
      submissionData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to submit assignment: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.submission) {
    throw new Error(`Assignment submission failed: ${JSON.stringify(result)}`);
  }

  trackSubmission(result.submission.id);
  return result.submission;
}

/**
 * Teacher gets assignment analytics
 */
export async function getAssignmentAnalytics(
  teacherToken: string,
  assignmentId: number
): Promise<AnalyticsData> {
  const response = await makeApiRequest(
    'GET',
    `/api/teacher?action=assignment-analytics&assignmentId=${assignmentId}`,
    teacherToken
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get analytics: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`Failed to retrieve analytics: ${JSON.stringify(result)}`);
  }

  return result;
}

/**
 * Teacher gets all submissions for an assignment
 */
export async function getAssignmentSubmissions(
  teacherToken: string,
  assignmentId: number
): Promise<SubmissionData[]> {
  const response = await makeApiRequest(
    'GET',
    `/api/teacher?action=assignment-submissions&assignmentId=${assignmentId}`,
    teacherToken
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get submissions: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.submissions || [];
}

/**
 * Teacher gets a specific submission detail
 */
export async function getSubmissionDetail(
  teacherToken: string,
  submissionId: number
): Promise<SubmissionData> {
  const response = await makeApiRequest(
    'GET',
    `/api/teacher?action=submission-detail&submissionId=${submissionId}`,
    teacherToken
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get submission detail: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.submission) {
    throw new Error(`Failed to retrieve submission detail: ${JSON.stringify(result)}`);
  }

  return result.submission;
}

/**
 * Teacher grades a submission
 */
export async function gradeSubmission(
  teacherToken: string,
  submissionId: number,
  score: number,
  feedback?: string
): Promise<SubmissionData> {
  const response = await makeApiRequest(
    'PUT',
    '/api/teacher?action=grade-submission',
    teacherToken,
    {
      submissionId,
      score,
      feedback,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to grade submission: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success || !result.submission) {
    throw new Error(`Failed to grade submission: ${JSON.stringify(result)}`);
  }

  return result.submission;
}

/**
 * Teacher gets students in a class
 */
export async function getClassStudents(
  teacherToken: string,
  classId: number
): Promise<any[]> {
  const response = await makeApiRequest(
    'GET',
    `/api/teacher?action=students&classId=${classId}`,
    teacherToken
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get students: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  // The API returns enrollments with nested users object
  // Transform to flat structure with user data
  const enrollments = result.students || [];
  return enrollments.map((e: any) => ({
    ...e,
    email: e.users?.email,
    name: e.users?.name,
    first_name: e.users?.first_name,
    last_name: e.users?.last_name,
    username: e.users?.username
  }));
}

/**
 * Student gets their enrolled classes
 */
export async function getStudentClasses(studentToken: string): Promise<ClassData[]> {
  const response = await makeApiRequest(
    'GET',
    '/api/student?action=classes',
    studentToken
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get student classes: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.success ? (result.classes || []) : [];
}

/**
 * Student gets their assignments
 */
export async function getStudentAssignments(
  studentToken: string,
  studentEmail: string,
  classId?: number
): Promise<AssignmentData[]> {
  const endpoint = classId 
    ? `/api/user-dashboard?action=assignments&userEmail=${encodeURIComponent(studentEmail)}&classId=${classId}`
    : `/api/user-dashboard?action=assignments&userEmail=${encodeURIComponent(studentEmail)}`;
    
  const response = await makeApiRequest('GET', endpoint, studentToken);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get assignments: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.assignments || [];
}

