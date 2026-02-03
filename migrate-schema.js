#!/usr/bin/env node
/**
 * Kanban V2 Schema Migration Script
 * Creates all necessary tables in Supabase
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  
  // Test by trying to query a system table
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .limit(1);
  
  if (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Manual migration required:');
    console.log('1. Go to Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy and paste contents of schema.sql');
    console.log('4. Run the migration');
    return false;
  }
  
  console.log('✅ Connected to Supabase successfully!\n');
  return true;
}

async function checkTables() {
  console.log('📊 Checking existing tables...\n');
  
  const tables = [
    'clients',
    'projects', 
    'tasks',
    'activity_log',
    'progress_logs',
    'schedule',
    'revenue',
    'analytics',
    'achievements'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  ❌ ${table}: NOT FOUND`);
    } else {
      console.log(`  ✅ ${table}: EXISTS (${data.length} rows)`);
    }
  }
}

async function main() {
  const connected = await testConnection();
  
  if (!connected) {
    process.exit(1);
  }
  
  await checkTables();
  
  console.log('\n' + '='.repeat(60));
  console.log('MANUAL MIGRATION STEPS:');
  console.log('='.repeat(60));
  console.log('1. Visit: https://supabase.com/dashboard/project/gbtwdwsrtblsbcbiabkl/sql/new');
  console.log('2. Copy contents of schema.sql');
  console.log('3. Paste into SQL editor');
  console.log('4. Click "Run"');
  console.log('5. Run this script again to verify: node migrate-schema.js');
  console.log('='.repeat(60) + '\n');
}

main();
