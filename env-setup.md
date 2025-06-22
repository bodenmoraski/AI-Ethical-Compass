# Environment Setup Guide

## Step 1: Create .env.local file

Create a `.env.local` file in your project root with these variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"

# Content Moderation (Optional - for later phases)
OPENAI_API_KEY=""
PERSPECTIVE_API_KEY=""

# Development
NODE_ENV="development"
```

## Step 2: Get your Supabase credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy:
   - Project URL → SUPABASE_URL
   - Project API keys → SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
4. Navigate to Settings > Database
5. Copy Connection string (URI) → DATABASE_URL

## Step 3: Replace placeholders

Replace the placeholders in your .env.local:
- `[PROJECT_REF]` with your actual project reference
- `[PASSWORD]` with your database password
- `[YOUR_ANON_KEY]` and `[YOUR_SERVICE_ROLE_KEY]` with actual keys 