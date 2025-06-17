# AI Ethical Compass - Deployment Ready

## Overview
A React + TypeScript application for exploring AI ethics through interactive scenarios. Now fully refactored for Vercel deployment with Supabase backend.

## Environment Setup

### Required Environment Variables
Set these in your Vercel project settings:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Database (for reference - used via Supabase)
DATABASE_URL=postgresql://your-connection-string
```

### Database Schema
Ensure your Supabase database has these tables:

```sql
-- Scenarios table
CREATE TABLE scenarios (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  difficulty_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perspectives table
CREATE TABLE perspectives (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER REFERENCES scenarios(id),
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  moderation_status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  scenario_id INTEGER REFERENCES scenarios(id),
  completed BOOLEAN DEFAULT false,
  perspective_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Deployment
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Verification Steps
After deployment, test these endpoints:

1. **Health Check**: `GET /api/health`
2. **Scenarios**: `GET /api/scenarios`
3. **Submit Perspective**: `POST /api/perspectives`
4. **Get Perspectives**: `GET /api/scenarios-perspectives?scenarioId=1`

## Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Vercel

## Key Features

- ✅ Serverless-optimized API endpoints
- ✅ Supabase integration for reliability
- ✅ Client-side routing support
- ✅ CORS configured for cross-origin requests
- ✅ TypeScript throughout
- ✅ Modern React patterns with hooks and context

## Troubleshooting

### Common Issues

1. **500 Errors**: Check environment variables in Vercel dashboard
2. **404 on Refresh**: Handled by vercel.json rewrites
3. **CORS Issues**: All API endpoints include CORS headers
4. **Database Connection**: Verify Supabase credentials and table structure

### Debug Endpoints

- `/api/health` - Check environment and system status
- Browser console - Client-side Supabase connection logs
- Vercel function logs - Server-side debugging

## Version History

- **v2.0.0**: Supabase migration, serverless optimization
- **v1.0.0**: Initial Express.js implementation 