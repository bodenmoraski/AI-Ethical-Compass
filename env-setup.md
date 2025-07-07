# Environment Setup Guide

## Step 1: Create .env.local file

Create a `.env.local` file in your project root with these variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"

# Client-side Supabase Configuration (Required for auth)
VITE_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
VITE_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"

# App URL Configuration (Required for email confirmations)
# This ensures email confirmation links redirect to the correct domain
VITE_APP_URL="https://ai-ethical-compass-build.vercel.app"

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
   - Project URL → VITE_SUPABASE_URL (for client-side) and DATABASE_URL (for server-side)
   - Project API keys → VITE_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
4. Navigate to Settings > Database
5. Copy Connection string (URI) → DATABASE_URL

## Step 3: Replace placeholders

Replace the placeholders in your .env.local:
- `[PROJECT_REF]` with your actual project reference
- `[PASSWORD]` with your database password
- `[YOUR_ANON_KEY]` and `[YOUR_SERVICE_ROLE_KEY]` with actual keys

## Step 4: Configure App URL (Important!)

The `VITE_APP_URL` variable ensures that email confirmation links redirect to the correct domain:

- **Production**: Set to your live domain (e.g., `https://ai-ethical-compass-build.vercel.app`)
- **Staging**: Set to your staging domain (e.g., `https://staging-ai-ethical-compass.vercel.app`)
- **Development**: Can be left as production URL or set to `http://localhost:5173`

⚠️ **Important**: If you don't set this, email confirmation links may redirect to localhost even in production! 