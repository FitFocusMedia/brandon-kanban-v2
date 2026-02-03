-- Kanban V2 Supabase Schema
-- Generated: 2026-02-03
-- Purpose: Migrate Brandon's Kanban from local JSON to Supabase

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    company TEXT DEFAULT '',
    rate NUMERIC DEFAULT 0,
    rate_type TEXT DEFAULT 'project',
    status TEXT DEFAULT 'active',
    notes TEXT DEFAULT '',
    tags JSONB DEFAULT '[]'::jsonb,
    contacts JSONB DEFAULT '[]'::jsonb,
    locations JSONB DEFAULT '[]'::jsonb,
    total_revenue NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    value NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'AUD',
    deadline TIMESTAMPTZ,
    location_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    assignee TEXT DEFAULT 'Brandon',
    estimated_minutes INTEGER,
    deadline TIMESTAMPTZ,
    subtasks JSONB DEFAULT '[]'::jsonb,
    tags TEXT DEFAULT '',
    client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    calendar_event_id TEXT,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    time_tracked INTEGER DEFAULT 0,
    time_sessions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- ============================================
-- ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type);

-- ============================================
-- PROGRESS LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS progress_logs (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    status TEXT NOT NULL,
    comment TEXT DEFAULT '',
    actual_minutes INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_logs_task_id ON progress_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_timestamp ON progress_logs(timestamp DESC);

-- ============================================
-- SCHEDULE TABLE (Calendar blocks)
-- ============================================
CREATE TABLE IF NOT EXISTS schedule (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_task_id ON schedule(task_id);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedule(start_time, end_time);

-- ============================================
-- REVENUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS revenue (
    id TEXT PRIMARY KEY,
    client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    project_name TEXT,
    amount NUMERIC NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT DEFAULT '',
    type TEXT DEFAULT 'project'
);

CREATE INDEX IF NOT EXISTS idx_revenue_client_id ON revenue(client_id);
CREATE INDEX IF NOT EXISTS idx_revenue_month_year ON revenue(year, month);

-- ============================================
-- ANALYTICS TABLE (Cached aggregations)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY DEFAULT 'singleton',
    total_tasks_completed INTEGER DEFAULT 0,
    average_completion_time INTEGER DEFAULT 0,
    on_time_completion_rate INTEGER DEFAULT 0,
    productivity_by_hour JSONB DEFAULT '{}'::jsonb,
    priority_distribution JSONB DEFAULT '{"low": 0, "medium": 0, "high": 0, "urgent": 0}'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insert singleton row for analytics
INSERT INTO analytics (id) VALUES ('singleton') ON CONFLICT DO NOTHING;

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY DEFAULT 'singleton',
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    unlocked JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Insert singleton row for achievements
INSERT INTO achievements (id) VALUES ('singleton') ON CONFLICT DO NOTHING;

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write access (since this is a personal dashboard)
-- In production, you might want to add authentication

CREATE POLICY "Allow all access to clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to progress_logs" ON progress_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to schedule" ON schedule FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to revenue" ON revenue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to analytics" ON analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to achievements" ON achievements FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTIONS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to relevant tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
