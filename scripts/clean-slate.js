/**
 * Clean Slate Script
 * Drops all tables and recreates the database schema from scratch
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        // Remove quotes from value
        value = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        process.env[key] = value;
      }
    });
  } catch (error) {
    // Try .env instead
    try {
      const envPath = join(process.cwd(), '.env');
      const envContent = readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remove quotes from value
          value = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
          process.env[key] = value;
        }
      });
    } catch (e) {
      console.log('No .env file found, using system environment variables');
    }
  }
}

loadEnv();

async function cleanSlate() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create SQL connection
  const sql = postgres(connectionString, { max: 1 });

  console.log('🔄 Starting clean slate...');
  console.log('⚠️  WARNING: This will delete ALL data in the database!');
  console.log('');

  try {
    // Step 1: Drop all tables in the correct order (respecting foreign keys)
    console.log('Step 1: Dropping all tables...');

    const dropTables = [
      'issue_labels',
      'issue_attachments',
      'issue_comments',
      'parts_suppliers',
      'parts_manufacturers',
      'parts_suppliers',
      'bom_items',
      'revisions',
      'change_order_audit_trail',
      'change_order_approvers',
      'change_order_affected_parts',
      'change_orders',
      'notification_recipients',
      'notifications',
      'notification_preferences',
      'project_members',
      'milestones',
      'labels',
      'issues',
      'projects',
      'team_members',
      'teams',
      'dashboard_templates',
      'user_dashboards',
      'manufacturers',
      'suppliers',
      'parts',
      'documents',
      'email_verification_tokens',
      'password_reset_tokens',
      'auth_events',
      'sessions',
      'accounts',
      'verification_tokens',
      'user_roles',
      'roles',
      'users',
    ];

    // Drop all tables
    for (const table of dropTables) {
      try {
        await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`  ✅ Dropped ${table}`);
      } catch (error) {
        console.log(`  ⚠️  Skipped ${table} (may not exist)`);
      }
    }

    console.log('✅ All tables dropped');

    // Step 2: Drop all enums
    console.log('Step 2: Dropping all enums...');

    const dropEnums = [
      'approval_status',
      'change_order_priority',
      'change_order_status',
      'change_order_type',
      'notification_category',
      'notification_channel',
      'notification_frequency',
      'notification_type',
      'project_visibility',
    ];

    for (const enumName of dropEnums) {
      try {
        await sql.unsafe(`DROP TYPE IF EXISTS "${enumName}" CASCADE`);
        console.log(`  ✅ Dropped enum ${enumName}`);
      } catch (error) {
        console.log(`  ⚠️  Skipped enum ${enumName} (may not exist)`);
      }
    }

    console.log('✅ All enums dropped');

    console.log('');
    console.log('🎉 Clean slate completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Run: npm run db:push');

  } catch (error) {
    console.error('❌ Clean slate failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run clean slate
cleanSlate().catch(console.error);
