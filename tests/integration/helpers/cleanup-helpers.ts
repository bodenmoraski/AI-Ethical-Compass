import { supabaseAdmin, testState, resetTestState, waitForDb } from '../setup';

/**
 * Comprehensive cleanup of all test data
 * Deletes in reverse order of foreign key dependencies
 */
export async function cleanupAllTestData(): Promise<void> {
  console.log('🧹 Starting test data cleanup...');
  
  try {
    // 1. Delete assignment submissions
    if (testState.createdSubmissions.length > 0) {
      console.log(`Cleaning up ${testState.createdSubmissions.length} submissions...`);
      const { error: submissionsError } = await supabaseAdmin
        .from('assignment_submissions')
        .delete()
        .in('id', testState.createdSubmissions);
      
      if (submissionsError) {
        console.error('Error deleting submissions:', submissionsError);
      } else {
        console.log('✓ Submissions deleted');
      }
    }

    await waitForDb(100);

    // 2. Delete assignments
    if (testState.createdAssignments.length > 0) {
      console.log(`Cleaning up ${testState.createdAssignments.length} assignments...`);
      const { error: assignmentsError } = await supabaseAdmin
        .from('assignments')
        .delete()
        .in('id', testState.createdAssignments);
      
      if (assignmentsError) {
        console.error('Error deleting assignments:', assignmentsError);
      } else {
        console.log('✓ Assignments deleted');
      }
    }

    await waitForDb(100);

    // 3. Delete class enrollments
    if (testState.createdEnrollments.length > 0) {
      console.log(`Cleaning up ${testState.createdEnrollments.length} enrollments...`);
      const { error: enrollmentsError } = await supabaseAdmin
        .from('class_enrollments')
        .delete()
        .in('id', testState.createdEnrollments);
      
      if (enrollmentsError) {
        console.error('Error deleting enrollments:', enrollmentsError);
      } else {
        console.log('✓ Enrollments deleted');
      }
    }

    await waitForDb(100);

    // 4. Delete classes
    if (testState.createdClasses.length > 0) {
      console.log(`Cleaning up ${testState.createdClasses.length} classes...`);
      const { error: classesError } = await supabaseAdmin
        .from('classes')
        .delete()
        .in('id', testState.createdClasses);
      
      if (classesError) {
        console.error('Error deleting classes:', classesError);
      } else {
        console.log('✓ Classes deleted');
      }
    }

    await waitForDb(100);

    // 5. Delete user profiles from users table
    // Note: testState.createdUsers contains Supabase Auth UUIDs, not INTEGER IDs
    // We need to look up users by email (from the test prefix pattern)
    if (testState.createdUsers.length > 0) {
      console.log(`Cleaning up ${testState.createdUsers.length} user profiles...`);
      
      // Get auth users to find their emails
      for (const authUserId of testState.createdUsers) {
        try {
          // Get the auth user to find their email
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(authUserId);
          
          if (authUser?.user?.email) {
            // Delete from users table by email
            const { error: userError } = await supabaseAdmin
              .from('users')
              .delete()
              .eq('email', authUser.user.email);
            
            if (userError && !userError.message.includes('not found')) {
              console.error(`Error deleting user profile for ${authUser.user.email}:`, userError);
            }
          }
        } catch (error) {
          // Fallback: try deleting by auth_user_id if that column exists
          const { error: fallbackError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('auth_user_id', authUserId);
          
          if (fallbackError && !fallbackError.message.includes('not found')) {
            console.error(`Error deleting user profile by auth_user_id ${authUserId}:`, fallbackError);
          }
        }
      }
      console.log('✓ User profiles deleted');
    }

    await waitForDb(100);

    // 6. Delete auth users
    if (testState.createdUsers.length > 0) {
      console.log(`Cleaning up ${testState.createdUsers.length} auth users...`);
      for (const userId of testState.createdUsers) {
        try {
          const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
          if (error && !error.message.includes('not found')) {
            console.error(`Error deleting auth user ${userId}:`, error);
          }
        } catch (error) {
          console.error(`Exception deleting auth user ${userId}:`, error);
        }
      }
      console.log('✓ Auth users deleted');
    }

    // Reset the test state
    resetTestState();
    console.log('✅ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Cleanup all test data by prefix (fallback method)
 * Useful if tracking wasn't working properly
 */
export async function cleanupByPrefix(): Promise<void> {
  console.log('🧹 Starting prefix-based cleanup...');
  
  try {
    // Delete submissions for test assignments
    const { data: testAssignments } = await supabaseAdmin
      .from('assignments')
      .select('id')
      .like('title', 'TEST-INT-%');
    
    if (testAssignments && testAssignments.length > 0) {
      const assignmentIds = testAssignments.map(a => a.id);
      await supabaseAdmin
        .from('assignment_submissions')
        .delete()
        .in('assignment_id', assignmentIds);
      console.log('✓ Test submissions deleted');
    }

    await waitForDb(100);

    // Delete test assignments
    await supabaseAdmin
      .from('assignments')
      .delete()
      .like('title', 'TEST-INT-%');
    console.log('✓ Test assignments deleted');

    await waitForDb(100);

    // Delete test class enrollments
    const { data: testClasses } = await supabaseAdmin
      .from('classes')
      .select('id')
      .like('class_code', 'TEST-INT-%');
    
    if (testClasses && testClasses.length > 0) {
      const classIds = testClasses.map(c => c.id);
      await supabaseAdmin
        .from('class_enrollments')
        .delete()
        .in('class_id', classIds);
      console.log('✓ Test enrollments deleted');
    }

    await waitForDb(100);

    // Delete test classes
    await supabaseAdmin
      .from('classes')
      .delete()
      .like('class_code', 'TEST-INT-%');
    console.log('✓ Test classes deleted');

    await waitForDb(100);

    // Delete test user profiles
    const { data: testUsers } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .like('email', 'test-integration-%');
    
    if (testUsers && testUsers.length > 0) {
      const userIds = testUsers.map(u => u.id);
      await supabaseAdmin
        .from('users')
        .delete()
        .in('id', userIds);
      console.log('✓ Test user profiles deleted');

      // Delete auth users
      for (const user of testUsers) {
        try {
          const { data: authUser } = await supabaseAdmin.auth.admin
            .listUsers();
          const authUserToDelete = authUser.users.find(u => u.email === user.email);
          if (authUserToDelete) {
            await supabaseAdmin.auth.admin.deleteUser(authUserToDelete.id);
          }
        } catch (error) {
          console.error(`Error deleting auth user ${user.email}:`, error);
        }
      }
      console.log('✓ Test auth users deleted');
    }

    console.log('✅ Prefix-based cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during prefix-based cleanup:', error);
    throw error;
  }
}

/**
 * Cleanup specific entities
 */
export async function cleanupSubmissions(submissionIds: number[]): Promise<void> {
  if (submissionIds.length === 0) return;
  
  const { error } = await supabaseAdmin
    .from('assignment_submissions')
    .delete()
    .in('id', submissionIds);
  
  if (error) {
    throw new Error(`Failed to cleanup submissions: ${error.message}`);
  }
}

export async function cleanupAssignments(assignmentIds: number[]): Promise<void> {
  if (assignmentIds.length === 0) return;
  
  const { error } = await supabaseAdmin
    .from('assignments')
    .delete()
    .in('id', assignmentIds);
  
  if (error) {
    throw new Error(`Failed to cleanup assignments: ${error.message}`);
  }
}

export async function cleanupClasses(classIds: number[]): Promise<void> {
  if (classIds.length === 0) return;
  
  const { error } = await supabaseAdmin
    .from('classes')
    .delete()
    .in('id', classIds);
  
  if (error) {
    throw new Error(`Failed to cleanup classes: ${error.message}`);
  }
}

export async function cleanupUsers(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  
  // userIds are Supabase Auth UUIDs, not database INTEGER IDs
  // We need to look up users by their auth user ID or email
  for (const authUserId of userIds) {
    try {
      // Get the auth user to find their email
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(authUserId);
      
      if (authUser?.user?.email) {
        // Delete from users table by email
        const { error: dbError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('email', authUser.user.email);
        
        if (dbError && !dbError.message.includes('not found')) {
          console.error(`Error deleting user profile for ${authUser.user.email}:`, dbError);
        }
      }
      
      // Delete from auth
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
    } catch (error) {
      console.error(`Error cleaning up user ${authUserId}:`, error);
    }
  }
}

/**
 * Verify cleanup was successful
 */
export async function verifyCleanup(): Promise<{
  success: boolean;
  remainingData: {
    submissions: number;
    assignments: number;
    enrollments: number;
    classes: number;
    users: number;
  };
}> {
  // Count remaining test data
  const { data: submissions } = await supabaseAdmin
    .from('assignment_submissions')
    .select('id', { count: 'exact', head: true });

  const { data: assignments } = await supabaseAdmin
    .from('assignments')
    .select('id')
    .like('title', 'TEST-INT-%');

  const { data: classes } = await supabaseAdmin
    .from('classes')
    .select('id')
    .like('class_code', 'TEST-INT-%');

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id')
    .like('email', 'test-integration-%');

  const { data: enrollments } = await supabaseAdmin
    .from('class_enrollments')
    .select('id');

  const remainingData = {
    submissions: 0, // Can't easily count without tracking
    assignments: assignments?.length || 0,
    enrollments: 0, // Would need class IDs to filter
    classes: classes?.length || 0,
    users: users?.length || 0,
  };

  const success = Object.values(remainingData).every(count => count === 0);

  if (!success) {
    console.warn('⚠️ Cleanup verification found remaining test data:', remainingData);
  }

  return { success, remainingData };
}

