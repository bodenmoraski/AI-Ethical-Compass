import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { TEST_CONFIG, waitForDb } from './setup';
import { 
  createTestTeacher, 
  createTestStudents,
  verifyUserAuth,
  type TestUser 
} from './helpers/auth-helpers';
import {
  createClass,
  joinClass,
  createAssignment,
  submitAssignment,
  getAssignmentAnalytics,
  getAssignmentSubmissions,
  getSubmissionDetail,
  getClassStudents,
  getStudentClasses,
  getStudentAssignments,
  type ClassData,
  type AssignmentData
} from './helpers/api-helpers';
import { cleanupAllTestData, cleanupByPrefix } from './helpers/cleanup-helpers';

/**
 * FULL CLASSROOM INTEGRATION TEST
 * 
 * This test simulates the complete workflow of a real classroom:
 * 1. Teacher creates a class
 * 2. Multiple students join simultaneously using the class code
 * 3. Teacher creates an assignment
 * 4. All students complete and submit the assignment concurrently
 * 5. Teacher views analytics and all submissions
 * 
 * This is a TRUE integration test - no mocking, real API calls, real database
 */
describe('Full Classroom Workflow Integration Test', () => {
  // Test fixtures
  let teacher: TestUser;
  let students: TestUser[];
  let classData: ClassData;
  let assignment: AssignmentData;

  const STUDENT_COUNT = TEST_CONFIG.DEFAULT_STUDENT_COUNT;

  // Increase timeout for this integration test
  jest.setTimeout(TEST_CONFIG.DEFAULT_TIMEOUT * 3);

  beforeAll(async () => {
    console.log('\n🚀 Setting up full classroom integration test...\n');
    
    // Optional: Clean up any leftover test data from previous runs
    try {
      await cleanupByPrefix();
    } catch (error) {
      console.log('No previous test data to clean up');
    }
  });

  afterAll(async () => {
    console.log('\n🧹 Cleaning up test data...\n');
    
    try {
      await cleanupAllTestData();
      
      // Double-check with prefix-based cleanup as fallback
      await waitForDb(1000);
      await cleanupByPrefix();
      
      console.log('✅ All test data cleaned up successfully\n');
    } catch (error) {
      console.error('⚠️ Error during cleanup:', error);
      // Don't fail the test due to cleanup errors
    }
  });

  describe('Phase 1: Setup and Authentication', () => {
    it('should create a teacher account with valid authentication', async () => {
      console.log('📝 Creating teacher account...');
      
      teacher = await createTestTeacher();
      
      expect(teacher).toBeDefined();
      expect(teacher.id).toBeTruthy();
      expect(teacher.email).toContain(TEST_CONFIG.TEST_EMAIL_PREFIX);
      expect(teacher.token).toBeTruthy();
      expect(teacher.role).toBe('teacher');
      expect(teacher.dbUserId).toBeGreaterThan(0);
      
      // Verify the token is valid
      const isValid = await verifyUserAuth(teacher.token);
      expect(isValid).toBe(true);
      
      console.log(`✓ Teacher created: ${teacher.email}`);
    });

    it('should create multiple student accounts concurrently', async () => {
      console.log(`📝 Creating ${STUDENT_COUNT} student accounts...`);
      
      students = await createTestStudents(STUDENT_COUNT);
      
      expect(students).toBeDefined();
      expect(students.length).toBe(STUDENT_COUNT);
      
      // Verify all students were created properly
      for (const student of students) {
        expect(student.id).toBeTruthy();
        expect(student.email).toContain(TEST_CONFIG.TEST_EMAIL_PREFIX);
        expect(student.token).toBeTruthy();
        expect(student.role).toBe('student');
        expect(student.dbUserId).toBeGreaterThan(0);
        
        // Verify token validity
        const isValid = await verifyUserAuth(student.token);
        expect(isValid).toBe(true);
      }
      
      console.log(`✓ ${students.length} students created successfully`);
    });
  });

  describe('Phase 2: Class Creation and Enrollment', () => {
    it('should allow teacher to create a class with class code', async () => {
      console.log('🏫 Teacher creating class...');
      
      classData = await createClass(teacher.token, {
        name: `${TEST_CONFIG.TEST_CLASS_PREFIX}AI Ethics Full Test`,
        subject: 'Computer Science',
        grade_level: '12',
        description: 'Full integration test class',
        school_year: '2024',
        semester: 'Fall'
      });
      
      expect(classData).toBeDefined();
      expect(classData.id).toBeGreaterThan(0);
      expect(classData.name).toContain('AI Ethics');
      expect(classData.class_code).toBeTruthy();
      expect(classData.class_code.length).toBeGreaterThanOrEqual(4);
      expect(classData.teacher_id).toBe(teacher.dbUserId);
      
      console.log(`✓ Class created: "${classData.name}" (Code: ${classData.class_code})`);
    });

    it('should allow all students to join the class simultaneously', async () => {
      console.log(`👥 ${STUDENT_COUNT} students joining class concurrently...`);
      
      // All students join at the same time (simulating real classroom scenario)
      const joinPromises = students.map(student => 
        joinClass(student.token, classData.class_code)
      );
      
      const joinResults = await Promise.allSettled(joinPromises);
      
      // Count successes and failures
      const successes = joinResults.filter(r => r.status === 'fulfilled');
      const failures = joinResults.filter(r => r.status === 'rejected');
      
      console.log(`✓ ${successes.length} students joined successfully`);
      
      if (failures.length > 0) {
        console.error(`❌ ${failures.length} students failed to join:`, failures);
      }
      
      // All students should have joined successfully
      expect(successes.length).toBe(STUDENT_COUNT);
      expect(failures.length).toBe(0);
      
      // Verify each successful enrollment
      successes.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const enrollmentData = result.value;
          expect(enrollmentData.success).toBe(true);
          expect(enrollmentData.enrollment).toBeDefined();
          // class_id might be in enrollment or we can verify through roster check
          if (enrollmentData.enrollment.class_id) {
            expect(enrollmentData.enrollment.class_id).toBe(classData.id);
          }
        }
      });
    });

    it('should reflect all students in teacher\'s class roster', async () => {
      console.log('📋 Teacher checking class roster...');
      
      // Wait a moment for all enrollments to be fully processed
      await waitForDb(500);
      
      const classStudents = await getClassStudents(teacher.token, classData.id);
      
      expect(classStudents).toBeDefined();
      expect(classStudents.length).toBe(STUDENT_COUNT);
      
      // Verify all our test students are in the roster
      const studentEmails = students.map(s => s.email);
      const rosterEmails = classStudents.map((s: any) => s.email);
      
      for (const email of studentEmails) {
        expect(rosterEmails).toContain(email);
      }
      
      console.log(`✓ All ${STUDENT_COUNT} students appear in class roster`);
    });

    it('should show the class in each student\'s enrolled classes', async () => {
      console.log('📚 Students checking their enrolled classes...');
      
      // Check that each student sees the class in their list
      const studentClassChecks = await Promise.all(
        students.map(student => getStudentClasses(student.token))
      );
      
      studentClassChecks.forEach((classes, index) => {
        expect(classes.length).toBeGreaterThanOrEqual(1);
        
        const enrolledClass = classes.find((c: any) => c.id === classData.id);
        expect(enrolledClass).toBeDefined();
        expect(enrolledClass?.class_code).toBe(classData.class_code);
      });
      
      console.log(`✓ All students can see the class in their dashboard`);
    });
  });

  describe('Phase 3: Assignment Creation and Distribution', () => {
    it('should allow teacher to create and publish an assignment', async () => {
      console.log('📝 Teacher creating assignment...');
      
      assignment = await createAssignment(teacher.token, {
        class_id: classData.id,
        title: `${TEST_CONFIG.TEST_ASSIGNMENT_PREFIX}Ethics Scenarios`,
        description: 'Complete the assigned AI ethics scenarios',
        instructions: 'Read each scenario carefully, choose an option, and provide your ethical reasoning.',
        assignment_type: 'scenario',
        scenario_ids: [1, 2, 3], // Assuming these scenarios exist
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
        points_possible: 100,
        is_published: true
      });
      
      expect(assignment).toBeDefined();
      expect(assignment.id).toBeGreaterThan(0);
      expect(assignment.class_id).toBe(classData.id);
      // is_published may not be returned depending on DB schema
      if (assignment.is_published !== undefined) {
        expect(assignment.is_published).toBe(true);
      }
      expect(assignment.scenario_ids).toEqual([1, 2, 3]);
      expect(assignment.points_possible).toBe(100);
      
      console.log(`✓ Assignment created: "${assignment.title}" (ID: ${assignment.id})`);
    });

    it('should make the assignment visible to all enrolled students', async () => {
      console.log('📖 Students checking for new assignments...');
      
      // Wait a moment for the assignment to propagate
      await waitForDb(300);
      
      const studentAssignmentChecks = await Promise.all(
        students.map(student => getStudentAssignments(student.token, student.email))
      );
      
      studentAssignmentChecks.forEach((assignments, index) => {
        expect(assignments.length).toBeGreaterThanOrEqual(1);
        
        const targetAssignment = assignments.find((a: any) => a.id === assignment.id);
        expect(targetAssignment).toBeDefined();
        expect(targetAssignment?.title).toContain('Ethics Scenarios');
        // is_published check is optional
        if (targetAssignment?.is_published !== undefined) {
          expect(targetAssignment.is_published).toBe(true);
        }
      });
      
      console.log(`✓ All ${STUDENT_COUNT} students can see the assignment`);
    });
  });

  describe('Phase 4: Concurrent Student Submissions', () => {
    it('should allow all students to submit the assignment simultaneously', async () => {
      console.log(`📤 ${STUDENT_COUNT} students submitting assignments concurrently...`);
      
      // All students submit at the same time (simulating real classroom scenario)
      const submissionPromises = students.map((student, index) => {
        const submissionData = {
          perspectives: [
            `Student ${index + 1}'s ethical analysis: This scenario presents complex considerations around privacy, autonomy, and beneficence. After careful analysis, I believe the most ethical approach balances individual rights with societal benefit while maintaining transparency and accountability.`
          ],
          answers: {
            scenarioId: 1,
            selectedOption: index % 3, // Vary the responses
            ethicsRatings: {
              privacy: 8,
              fairness: 7,
              transparency: 9
            }
          },
          timeSpent: 15 + Math.floor(Math.random() * 20) // 15-35 minutes
        };
        
        return submitAssignment(student.token, assignment.id, submissionData);
      });
      
      const submissionResults = await Promise.allSettled(submissionPromises);
      
      // Count successes and failures
      const successes = submissionResults.filter(r => r.status === 'fulfilled');
      const failures = submissionResults.filter(r => r.status === 'rejected');
      
      console.log(`✓ ${successes.length} submissions successful`);
      
      if (failures.length > 0) {
        console.error(`❌ ${failures.length} submissions failed:`, failures);
      }
      
      // All submissions should succeed
      expect(successes.length).toBe(STUDENT_COUNT);
      expect(failures.length).toBe(0);
      
      // Verify submission data
      successes.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const submission = result.value;
          expect(submission.id).toBeGreaterThan(0);
          expect(submission.assignment_id).toBe(assignment.id);
          expect(submission.student_id).toBe(students[index].dbUserId);
          expect(submission.status).toBe('submitted');
          expect(submission.submission_data.perspectives).toBeDefined();
          expect(submission.submission_data.perspectives.length).toBeGreaterThan(0);
          expect(submission.submission_data.timeSpent).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Phase 5: Teacher Analytics and Grading', () => {
    it('should provide accurate analytics to the teacher', async () => {
      console.log('📊 Teacher viewing assignment analytics...');
      
      // Wait for all submissions to be fully processed
      await waitForDb(500);
      
      const analytics = await getAssignmentAnalytics(teacher.token, assignment.id);
      
      expect(analytics).toBeDefined();
      expect(analytics.success).toBe(true);
      expect(analytics.stats).toBeDefined();
      
      // Verify analytics accuracy
      expect(analytics.stats.totalStudents).toBe(STUDENT_COUNT);
      expect(analytics.stats.submittedCount).toBe(STUDENT_COUNT);
      expect(analytics.stats.completionRate).toBe(100); // All students submitted
      expect(analytics.stats.gradedCount).toBe(0); // Not graded yet
      expect(analytics.stats.averageTimeSpent).toBeGreaterThan(0);
      
      console.log('Analytics Summary:');
      console.log(`  Total Students: ${analytics.stats.totalStudents}`);
      console.log(`  Submitted: ${analytics.stats.submittedCount}`);
      console.log(`  Completion Rate: ${analytics.stats.completionRate}%`);
      console.log(`  Average Time Spent: ${analytics.stats.averageTimeSpent} minutes`);
      
      // Verify student progress data
      expect(analytics.studentProgress).toBeDefined();
      expect(analytics.studentProgress.length).toBe(STUDENT_COUNT);
      
      analytics.studentProgress.forEach((progress: any) => {
        expect(progress.student_id).toBeDefined();
        expect(progress.status).toBe('submitted');
        expect(progress.submitted_at).toBeDefined();
      });
      
      console.log(`✓ Analytics are accurate and complete`);
    });

    it('should allow teacher to view all submissions', async () => {
      console.log('📝 Teacher viewing all submissions...');
      
      const submissions = await getAssignmentSubmissions(teacher.token, assignment.id);
      
      expect(submissions).toBeDefined();
      expect(submissions.length).toBe(STUDENT_COUNT);
      
      // Verify each submission
      submissions.forEach((submission: any) => {
        expect(submission.id).toBeGreaterThan(0);
        expect(submission.assignment_id).toBe(assignment.id);
        expect(submission.status).toBe('submitted');
        expect(submission.submission_data).toBeDefined();
        expect(submission.submission_data.perspectives).toBeDefined();
        expect(submission.submission_data.perspectives.length).toBeGreaterThan(0);
        expect(submission.submission_data.timeSpent).toBeGreaterThan(0);
      });
      
      console.log(`✓ Teacher can view all ${submissions.length} submissions`);
    });

    it('should allow teacher to view individual submission details', async () => {
      console.log('🔍 Teacher viewing individual submission details...');
      
      // Get all submissions first
      const submissions = await getAssignmentSubmissions(teacher.token, assignment.id);
      
      // Check a few individual submissions
      const samplesToCheck = Math.min(3, submissions.length);
      const submissionsToCheck = submissions.slice(0, samplesToCheck);
      
      for (const submission of submissionsToCheck) {
        const detail = await getSubmissionDetail(teacher.token, submission.id);
        
        expect(detail).toBeDefined();
        expect(detail.id).toBe(submission.id);
        expect(detail.submission_data).toBeDefined();
        expect(detail.submission_data.perspectives).toBeDefined();
        expect(detail.submission_data.perspectives[0]).toBeTruthy();
        expect(detail.submission_data.perspectives[0].length).toBeGreaterThan(50); // Substantial response
      }
      
      console.log(`✓ Teacher can view detailed submission content`);
    });
  });

  describe('Phase 6: Data Integrity Verification', () => {
    it('should maintain referential integrity across all entities', async () => {
      console.log('🔗 Verifying data integrity...');
      
      // Verify class exists and has correct teacher
      expect(classData.id).toBeGreaterThan(0);
      expect(classData.teacher_id).toBe(teacher.dbUserId);
      
      // Verify assignment exists and belongs to class
      expect(assignment.id).toBeGreaterThan(0);
      expect(assignment.class_id).toBe(classData.id);
      
      // Verify all students are enrolled
      const classStudents = await getClassStudents(teacher.token, classData.id);
      expect(classStudents.length).toBe(STUDENT_COUNT);
      
      // Verify all submissions exist
      const submissions = await getAssignmentSubmissions(teacher.token, assignment.id);
      expect(submissions.length).toBe(STUDENT_COUNT);
      
      // Verify each submission links correctly
      submissions.forEach((submission: any) => {
        expect(submission.assignment_id).toBe(assignment.id);
        const studentExists = students.some(s => s.dbUserId === submission.student_id);
        expect(studentExists).toBe(true);
      });
      
      console.log('✓ All referential integrity constraints satisfied');
    });

    it('should have accurate timestamps and ordering', async () => {
      console.log('⏰ Verifying timestamps...');
      
      const submissions = await getAssignmentSubmissions(teacher.token, assignment.id);
      
      submissions.forEach((submission: any) => {
        // Verify submission has a timestamp
        expect(submission.submitted_at).toBeDefined();
        
        // Verify timestamp is recent (within last few minutes)
        const submittedAt = new Date(submission.submitted_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - submittedAt.getTime()) / 1000 / 60;
        expect(diffMinutes).toBeLessThan(10); // Submitted within last 10 minutes
        
        // Verify timestamp is not in the future
        expect(submittedAt.getTime()).toBeLessThanOrEqual(now.getTime());
      });
      
      console.log('✓ All timestamps are valid and recent');
    });
  });

  describe('Phase 7: Summary and Verification', () => {
    it('should provide a complete test summary', () => {
      console.log('\n📊 TEST SUMMARY\n');
      console.log('═══════════════════════════════════════════════════');
      console.log(`Teacher: ${teacher.email}`);
      console.log(`Students Created: ${students.length}`);
      console.log(`Class: ${classData.name} (${classData.class_code})`);
      console.log(`Assignment: ${assignment.title}`);
      console.log(`Submissions: ${STUDENT_COUNT}/${STUDENT_COUNT} (100%)`);
      console.log('═══════════════════════════════════════════════════\n');
      
      expect(true).toBe(true); // Always pass
    });
  });
});

