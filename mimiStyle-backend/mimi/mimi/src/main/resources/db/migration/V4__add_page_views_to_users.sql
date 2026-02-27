-- Add page_views column to users table
ALTER TABLE users ADD COLUMN page_views INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN users.page_views IS 'Number of page views by this user';
