-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS perspectives;
DROP TABLE IF EXISTS scenarios;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

-- Create scenarios table
CREATE TABLE scenarios (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  options JSONB NOT NULL,
  ethical_considerations JSONB NOT NULL,
  sdg_tags JSONB NOT NULL,
  resources JSONB NOT NULL,
  "order" INTEGER NOT NULL
);

-- Create perspectives table
CREATE TABLE perspectives (
  id SERIAL PRIMARY KEY,
  scenario_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  parent_id INTEGER
);

-- Create user_progress table
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  scenario_id INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP
); 