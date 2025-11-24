import { supabaseAdmin, TEST_CONFIG, trackUser, waitForDb } from '../setup';

export interface TestUser {
  id: string;
  email: string;
  token: string;
  role: 'teacher' | 'student';
  dbUserId?: number; // ID from users table
}

/**
 * Creates a real authenticated teacher user in Supabase
 */
export async function createTestTeacher(index: number = 0): Promise<TestUser> {
  const email = `${TEST_CONFIG.TEST_EMAIL_PREFIX}teacher-${index}-${Date.now()}@test.com`;
  
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: TEST_CONFIG.TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: 'teacher'
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    const userId = authData.user.id;
    trackUser(userId);

    // Wait for auth user to be fully created
    await waitForDb(200);

    // 2. Create user profile in users table with auth_user_id mapping
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        role: 'teacher',
        first_name: `Teacher`,
        last_name: `Test${index}`,
        username: `teacher_test_${index}_${Date.now()}`,
        auth_user_id: userId, // Link to Supabase Auth UUID
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('User creation error:', userError);
      throw new Error(`Failed to create user profile: ${userError?.message}`);
    }

    // 3. Sign in to get access token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: TEST_CONFIG.TEST_PASSWORD,
    });

    if (sessionError || !sessionData.session) {
      throw new Error(`Failed to create session: ${sessionError?.message}`);
    }

    return {
      id: userId,
      email,
      token: sessionData.session.access_token,
      role: 'teacher',
      dbUserId: userData.id
    };
  } catch (error) {
    console.error('Error creating test teacher:', error);
    throw error;
  }
}

/**
 * Creates a real authenticated student user in Supabase
 */
export async function createTestStudent(index: number): Promise<TestUser> {
  const email = `${TEST_CONFIG.TEST_EMAIL_PREFIX}student-${index}-${Date.now()}@test.com`;
  
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: TEST_CONFIG.TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: 'student'
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    const userId = authData.user.id;
    trackUser(userId);

    // Wait for auth user to be fully created
    await waitForDb(200);

    // 2. Create user profile in users table with auth_user_id mapping
    // Note: Students use 'user' role (not 'student' - that's not in the enum)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        role: 'user',
        first_name: `Student`,
        last_name: `Test${index}`,
        username: `student_test_${index}_${Date.now()}`,
        auth_user_id: userId, // Link to Supabase Auth UUID
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('User creation error:', userError);
      throw new Error(`Failed to create user profile: ${userError?.message}`);
    }

    // 3. Sign in to get access token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: TEST_CONFIG.TEST_PASSWORD,
    });

    if (sessionError || !sessionData.session) {
      throw new Error(`Failed to create session: ${sessionError?.message}`);
    }

    return {
      id: userId,
      email,
      token: sessionData.session.access_token,
      role: 'student',
      dbUserId: userData.id
    };
  } catch (error) {
    console.error('Error creating test student:', error);
    throw error;
  }
}

/**
 * Creates multiple test students concurrently
 */
export async function createTestStudents(count: number): Promise<TestUser[]> {
  console.log(`Creating ${count} test students...`);
  
  const studentPromises = Array.from({ length: count }, (_, i) => 
    createTestStudent(i)
  );
  
  const results = await Promise.allSettled(studentPromises);
  
  const successfulStudents: TestUser[] = [];
  const failures: any[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulStudents.push(result.value);
    } else {
      failures.push({ index, reason: result.reason });
    }
  });
  
  if (failures.length > 0) {
    console.error(`Failed to create ${failures.length} students:`, failures);
  }
  
  console.log(`Successfully created ${successfulStudents.length} students`);
  return successfulStudents;
}

/**
 * Refreshes an access token for a user
 */
export async function refreshUserToken(email: string): Promise<string> {
  const { data: sessionData, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password: TEST_CONFIG.TEST_PASSWORD,
  });

  if (error || !sessionData.session) {
    throw new Error(`Failed to refresh token: ${error?.message}`);
  }

  return sessionData.session.access_token;
}

/**
 * Verifies that a user can authenticate successfully
 */
export async function verifyUserAuth(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    return !error && !!data.user;
  } catch {
    return false;
  }
}

