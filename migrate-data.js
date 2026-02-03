#!/usr/bin/env node
/**
 * Kanban V2 Data Migration Script
 * Migrates all data from JSON files (V1) to Supabase (V2)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Paths to V1 data
const V1_DATA_DIR = '../kanban/data';

async function loadJSONFile(filename) {
  try {
    const filepath = path.join(__dirname, V1_DATA_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`⚠️  Could not load ${filename}:`, error.message);
    return null;
  }
}

async function migrateClients() {
  console.log('\n📋 Migrating clients...');
  
  const clients = await loadJSONFile('clients.json');
  if (!clients || clients.length === 0) {
    console.log('  ℹ️  No clients to migrate');
    return;
  }

  console.log(`  Found ${clients.length} clients`);

  // Extract projects from clients for separate table
  const allProjects = [];
  
  const clientsData = clients.map(client => {
    // Save projects separately
    if (client.projects && client.projects.length > 0) {
      client.projects.forEach(project => {
        allProjects.push({
          id: project.id,
          client_id: client.id,
          name: project.name,
          description: project.description || '',
          status: project.status || 'active',
          value: project.value || 0,
          currency: project.currency || 'AUD',
          deadline: project.deadline || null,
          location_id: project.locationId || null,
          created_at: project.createdAt || new Date().toISOString(),
          updated_at: project.updatedAt || new Date().toISOString()
        });
      });
    }

    return {
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      rate: client.rate || 0,
      rate_type: client.rateType || 'project',
      status: client.status || 'active',
      notes: client.notes || '',
      tags: client.tags || [],
      contacts: client.contacts || [],
      locations: client.locations || [],
      total_revenue: client.totalRevenue || 0,
      created_at: client.createdAt || new Date().toISOString(),
      updated_at: client.updatedAt || new Date().toISOString()
    };
  });

  // Insert clients
  const { data, error } = await supabase
    .from('clients')
    .upsert(clientsData, { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating clients:', error.message);
  } else {
    console.log(`  ✅ Migrated ${clientsData.length} clients`);
  }

  // Insert projects
  if (allProjects.length > 0) {
    console.log(`\n📂 Migrating ${allProjects.length} projects...`);
    
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .upsert(allProjects, { onConflict: 'id' });

    if (projError) {
      console.error('  ❌ Error migrating projects:', projError.message);
    } else {
      console.log(`  ✅ Migrated ${allProjects.length} projects`);
    }
  }
}

async function migrateTasks() {
  console.log('\n✅ Migrating tasks...');
  
  const tasks = await loadJSONFile('tasks.json');
  if (!tasks || tasks.length === 0) {
    console.log('  ℹ️  No tasks to migrate');
    return;
  }

  console.log(`  Found ${tasks.length} tasks`);

  const tasksData = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    assignee: task.assignee || 'Brandon',
    estimated_minutes: task.estimatedMinutes || null,
    deadline: task.deadline || null,
    subtasks: task.subtasks || [],
    tags: task.tags || '',
    client_id: task.clientId || null,
    project_id: task.projectId || null,
    calendar_event_id: task.calendarEventId || null,
    scheduled_start: task.scheduledStart || null,
    scheduled_end: task.scheduledEnd || null,
    time_tracked: task.time_tracked || 0,
    time_sessions: task.time_sessions || [],
    created_at: task.createdAt || new Date().toISOString(),
    updated_at: task.updatedAt || new Date().toISOString(),
    completed_at: task.completedAt || null
  }));

  const { data, error } = await supabase
    .from('tasks')
    .upsert(tasksData, { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating tasks:', error.message);
  } else {
    console.log(`  ✅ Migrated ${tasksData.length} tasks`);
  }
}

async function migrateActivityLog() {
  console.log('\n📜 Migrating activity log...');
  
  const activities = await loadJSONFile('activity.json');
  if (!activities || activities.length === 0) {
    console.log('  ℹ️  No activity logs to migrate');
    return;
  }

  console.log(`  Found ${activities.length} activity logs`);

  const activityData = activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    description: activity.description,
    metadata: activity.metadata || {},
    timestamp: activity.timestamp
  }));

  // Batch insert in chunks of 1000
  const chunkSize = 1000;
  for (let i = 0; i < activityData.length; i += chunkSize) {
    const chunk = activityData.slice(i, i + chunkSize);
    
    const { error } = await supabase
      .from('activity_log')
      .upsert(chunk, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Error migrating activity chunk ${i / chunkSize + 1}:`, error.message);
    } else {
      console.log(`  ✅ Migrated chunk ${i / chunkSize + 1} (${chunk.length} records)`);
    }
  }
}

async function migrateProgressLogs() {
  console.log('\n📊 Migrating progress logs...');
  
  const logs = await loadJSONFile('progress-logs.json');
  if (!logs || logs.length === 0) {
    console.log('  ℹ️  No progress logs to migrate');
    return;
  }

  console.log(`  Found ${logs.length} progress logs`);

  const logsData = logs.map(log => ({
    id: log.id,
    task_id: log.taskId,
    task_title: log.taskTitle,
    status: log.status,
    comment: log.comment || '',
    actual_minutes: log.actualMinutes || null,
    timestamp: log.timestamp
  }));

  const { error } = await supabase
    .from('progress_logs')
    .upsert(logsData, { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating progress logs:', error.message);
  } else {
    console.log(`  ✅ Migrated ${logsData.length} progress logs`);
  }
}

async function migrateSchedule() {
  console.log('\n📅 Migrating schedule...');
  
  const schedule = await loadJSONFile('schedule.json');
  if (!schedule || schedule.length === 0) {
    console.log('  ℹ️  No schedule entries to migrate');
    return;
  }

  console.log(`  Found ${schedule.length} schedule entries`);

  const scheduleData = schedule.map(entry => ({
    id: entry.id || `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    task_id: entry.taskId,
    task_title: entry.taskTitle,
    start_time: entry.start,
    end_time: entry.end,
    created_at: entry.createdAt || new Date().toISOString()
  }));

  const { error } = await supabase
    .from('schedule')
    .upsert(scheduleData, { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating schedule:', error.message);
  } else {
    console.log(`  ✅ Migrated ${scheduleData.length} schedule entries`);
  }
}

async function migrateRevenue() {
  console.log('\n💰 Migrating revenue...');
  
  const revenueData = await loadJSONFile('revenue.json');
  if (!revenueData || !revenueData.entries || revenueData.entries.length === 0) {
    console.log('  ℹ️  No revenue entries to migrate');
    return;
  }

  console.log(`  Found ${revenueData.entries.length} revenue entries`);

  const revenue = revenueData.entries.map(entry => ({
    id: entry.id,
    client_id: entry.clientId || null,
    client_name: entry.clientName,
    project_id: entry.projectId || null,
    project_name: entry.projectName || null,
    amount: entry.amount,
    month: entry.month,
    year: entry.year,
    date: entry.date,
    notes: entry.notes || '',
    type: entry.type || 'project'
  }));

  const { error } = await supabase
    .from('revenue')
    .upsert(revenue, { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating revenue:', error.message);
  } else {
    console.log(`  ✅ Migrated ${revenue.length} revenue entries`);
  }
}

async function migrateAnalytics() {
  console.log('\n📈 Migrating analytics...');
  
  const analytics = await loadJSONFile('analytics.json');
  if (!analytics) {
    console.log('  ℹ️  No analytics to migrate');
    return;
  }

  const analyticsData = {
    id: 'singleton',
    total_tasks_completed: analytics.totalTasksCompleted || 0,
    average_completion_time: analytics.averageCompletionTime || 0,
    on_time_completion_rate: analytics.onTimeCompletionRate || 0,
    productivity_by_hour: analytics.productivityByHour || {},
    priority_distribution: analytics.priorityDistribution || { low: 0, medium: 0, high: 0, urgent: 0 },
    last_updated: analytics.lastUpdated || new Date().toISOString()
  };

  const { error } = await supabase
    .from('analytics')
    .upsert([analyticsData], { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating analytics:', error.message);
  } else {
    console.log('  ✅ Migrated analytics data');
  }
}

async function migrateAchievements() {
  console.log('\n🏆 Migrating achievements...');
  
  const achievements = await loadJSONFile('achievements.json');
  if (!achievements) {
    console.log('  ℹ️  No achievements to migrate');
    return;
  }

  const achievementsData = {
    id: 'singleton',
    total_points: achievements.totalPoints || 0,
    level: achievements.level || 1,
    unlocked: achievements.unlocked || [],
    last_updated: new Date().toISOString()
  };

  const { error } = await supabase
    .from('achievements')
    .upsert([achievementsData], { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error migrating achievements:', error.message);
  } else {
    console.log('  ✅ Migrated achievements data');
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  const tables = [
    { name: 'clients', key: 'name' },
    { name: 'projects', key: 'name' },
    { name: 'tasks', key: 'title' },
    { name: 'activity_log', key: 'type' },
    { name: 'progress_logs', key: 'task_title' },
    { name: 'schedule', key: 'task_title' },
    { name: 'revenue', key: 'client_name' },
    { name: 'analytics', key: 'id' },
    { name: 'achievements', key: 'id' }
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ❌ ${table.name}: ERROR - ${error.message}`);
    } else {
      console.log(`  ✅ ${table.name}: ${count} rows`);
    }
  }
}

async function main() {
  console.log('🚀 Kanban V2 Data Migration');
  console.log('==================================');
  console.log(`📦 Source: ${path.resolve(__dirname, V1_DATA_DIR)}`);
  console.log(`🎯 Target: ${supabaseUrl}`);
  console.log('==================================\n');

  try {
    await migrateClients();
    await migrateTasks();
    await migrateActivityLog();
    await migrateProgressLogs();
    await migrateSchedule();
    await migrateRevenue();
    await migrateAnalytics();
    await migrateAchievements();
    
    await verifyMigration();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Check Supabase dashboard to verify data');
    console.log('2. Open public/index.html in browser to test locally');
    console.log('3. Deploy to GitHub Pages: npm run deploy');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
