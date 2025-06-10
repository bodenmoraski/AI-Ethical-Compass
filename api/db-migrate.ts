import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== DB MIGRATE API CALLED ===');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('Starting database migration...');
      
      // Dynamic imports to avoid module resolution issues
      const postgres = (await import('postgres')).default;
      console.log('postgres imported successfully');
      
      const connectionString = process.env.DATABASE_URL!;
      if (!connectionString) {
        throw new Error('DATABASE_URL not found');
      }
      
      const client = postgres(connectionString, { prepare: false });
      console.log('Database client created');
      
      // Test database connection first
      console.log('Testing database connection...');
      const connectionTest = await client`SELECT NOW() as current_time`;
      console.log('Database connection successful:', connectionTest[0]);
      
      // Create tables manually
      console.log('Creating tables...');
      
      // Create users table
      await client`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE,
          name TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      // Create scenarios table
      await client`
        CREATE TABLE IF NOT EXISTS scenarios (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          context TEXT NOT NULL,
          dilemma TEXT NOT NULL,
          stakeholders JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      // Create perspectives table
      await client`
        CREATE TABLE IF NOT EXISTS perspectives (
          id SERIAL PRIMARY KEY,
          scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
          user_id INTEGER REFERENCES users(id),
          author_name TEXT NOT NULL,
          content TEXT NOT NULL,
          likes INTEGER DEFAULT 0,
          moderation_status TEXT DEFAULT 'pending',
          moderation_score INTEGER DEFAULT 0,
          moderation_flags JSONB,
          moderated_by INTEGER REFERENCES users(id),
          moderated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      // Create replies table
      await client`
        CREATE TABLE IF NOT EXISTS replies (
          id SERIAL PRIMARY KEY,
          perspective_id INTEGER NOT NULL REFERENCES perspectives(id),
          user_id INTEGER REFERENCES users(id),
          author_name TEXT NOT NULL,
          content TEXT NOT NULL,
          likes INTEGER DEFAULT 0,
          moderation_status TEXT DEFAULT 'pending',
          moderation_score INTEGER DEFAULT 0,
          moderation_flags JSONB,
          moderated_by INTEGER REFERENCES users(id),
          moderated_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      // Create user_progress table
      await client`
        CREATE TABLE IF NOT EXISTS user_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          scenario_id INTEGER NOT NULL REFERENCES scenarios(id),
          completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('Tables created successfully');
      
      // Insert seed data
      console.log('Inserting seed data...');
      
      // Check if scenarios already exist
      const existingScenarios = await client`SELECT id FROM scenarios LIMIT 1`;
      
      if (existingScenarios.length === 0) {
        // Insert seed scenarios
        await client`
          INSERT INTO scenarios (id, title, description, context, dilemma, stakeholders) VALUES
          (1, 'AI-Powered Student Assessment System', 'A school district is considering implementing an AI system to assess student essays and provide grades.', 'Lincoln Elementary School District is facing budget cuts and teacher shortages. They''ve been approached by EduTech Solutions, a company offering an AI-powered essay grading system that promises to reduce teacher workload while maintaining consistent grading standards.', 'Should the school implement this AI system, knowing it could help overworked teachers but might miss nuances in student creativity and critical thinking?', '[{"name": "Teachers", "concern": "Job security and maintaining human judgment in education"}, {"name": "Students", "concern": "Fair and meaningful assessment of their work"}, {"name": "Parents", "concern": "Quality of their children''s education"}, {"name": "School Administration", "concern": "Budget constraints and efficiency"}, {"name": "Technology Company", "concern": "Successful implementation of their product"}]'),
          (2, 'Facial Recognition in Public Spaces', 'A city government wants to install facial recognition cameras in public areas to improve safety.', 'The city of Riverside has experienced an increase in petty crime and vandalism in public parks and downtown areas. The mayor is proposing a comprehensive surveillance system using facial recognition technology to identify suspects and deter criminal activity.', 'How can the city balance public safety with privacy rights and the risk of algorithmic bias?', '[{"name": "Local Residents", "concern": "Personal safety vs. privacy"}, {"name": "Civil Rights Groups", "concern": "Protection of civil liberties and prevention of discrimination"}, {"name": "Law Enforcement", "concern": "Effective crime prevention and investigation tools"}, {"name": "City Council", "concern": "Public safety, budget, and constituent approval"}, {"name": "Technology Vendors", "concern": "Successful deployment and system reliability"}]')
        `;
        
        // Insert seed perspectives
        await client`
          INSERT INTO perspectives (scenario_id, author_name, content, moderation_status) VALUES
          (1, 'Teacher23', 'As a 5th-grade teacher with 15 years of experience, I''m deeply concerned about AI grading systems. While I understand the appeal of reducing our workload, there''s so much more to assessing student writing than just grammar and structure. I can tell which students are struggling at home, which ones are developing their unique voice, and which ones need encouragement to take creative risks. An AI might miss the breakthrough moment when a shy student finally opens up in their writing, or fail to recognize when a student with learning differences has made significant progress. We need to preserve the human element in education, not replace it with algorithms.', 'approved'),
          (1, 'ESL_Advocate', 'I work with English Language Learners, and I''m worried about algorithmic bias in AI grading systems. These students often have brilliant ideas but may struggle with conventional English grammar or sentence structure. A human teacher can recognize the cognitive complexity behind their writing and provide appropriate feedback. AI systems are typically trained on ''standard'' English writing, which could systematically disadvantage students from diverse linguistic backgrounds. We risk creating a two-tiered system where some students are fairly assessed while others are penalized for cultural and linguistic differences that actually represent strengths in our globalized world.', 'approved')
        `;
        
        console.log('Seed data inserted successfully');
      } else {
        console.log('Seed data already exists, skipping insertion');
      }
      
      // Verify the data
      const scenarioCount = await client`SELECT COUNT(*) as count FROM scenarios`;
      const perspectiveCount = await client`SELECT COUNT(*) as count FROM perspectives`;
      
      await client.end();
      console.log('Database connection closed');
      
      res.status(200).json({
        message: 'Database migration completed successfully',
        tables: {
          scenarios: parseInt(scenarioCount[0].count),
          perspectives: parseInt(perspectiveCount[0].count)
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({
        message: 'Database migration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 