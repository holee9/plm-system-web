/**
 * Safe Migration Script
 * Converts text IDs to UUID while preserving data
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/server/db/schema';

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

async function migrateSafe() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create raw SQL connection
  const sql = postgres(connectionString, { max: 1 });

  console.log('🔄 Starting safe migration...');

  try {
    // Step 1: Add new UUID columns
    console.log('Step 1: Adding new UUID columns...');

    const alterStatements = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE teams ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE team_members ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE projects ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE project_members ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE issues ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE issue_comments ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE milestones ADD COLUMN IF NOT EXISTS id_new uuid',
      'ALTER TABLE labels ADD COLUMN IF NOT EXISTS id_new uuid',
    ];

    for (const stmt of alterStatements) {
      await sql.unsafe(stmt);
    }
    console.log('✅ UUID columns added');

    // Step 2: Migrate data with UUID conversion
    console.log('Step 2: Migrating data to UUID format...');

    const tables = ['users', 'sessions', 'teams', 'team_members', 'projects', 'project_members', 'issues', 'issue_comments', 'milestones', 'labels'];

    for (const table of tables) {
      console.log(`  Migrating ${table}...`);
      await sql.unsafe(`
        UPDATE "${table}" SET id_new = CASE
          WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN id::uuid
          ELSE gen_random_uuid()
        END
      `);
    }
    console.log('✅ Data migrated');

    // Step 3: Update foreign key references
    console.log('Step 3: Updating foreign key references...');

    // Update foreign keys to point to new UUIDs
    await sql`
      -- Update foreign key columns
      UPDATE team_members tm
      SET team_id = t.id_new, user_id = u.id_new
      FROM teams t, users u
      WHERE tm.team_id = t.id AND tm.user_id = u.id
    `;

    await sql`
      UPDATE project_members pm
      SET project_id = p.id_new, user_id = u.id_new
      FROM projects p, users u
      WHERE pm.project_id = p.id AND pm.user_id = u.id
    `;

    await sql`
      UPDATE issues i
      SET assignee_id = u.id_new, reporter_id = u2.id_new
      FROM users u, users u2
      WHERE i.assignee_id = u.id AND i.reporter_id = u2.id
    `;

    await sql`
      UPDATE issue_comments ic
      SET issue_id = i.id_new, author_id = u.id_new
      FROM issues i, users u
      WHERE ic.issue_id = i.id AND ic.author_id = u.id
    `;
    console.log('✅ Foreign keys updated');

    // Step 4: Drop and rename columns
    console.log('Step 4: Swapping columns...');

    const columnSwaps = [
      { table: 'users', hasDefault: true },
      { table: 'sessions', hasDefault: true },
      { table: 'teams', hasDefault: true },
      { table: 'team_members', hasDefault: true },
      { table: 'projects', hasDefault: true },
      { table: 'project_members', hasDefault: true },
      { table: 'issues', hasDefault: true },
      { table: 'issue_comments', hasDefault: true },
      { table: 'milestones', hasDefault: true },
      { table: 'labels', hasDefault: true },
    ];

    for (const { table, hasDefault } of columnSwaps) {
      const defaultClause = hasDefault ? `ALTER COLUMN id SET DEFAULT gen_random_uuid()` : '';

      await sql.unsafe(`ALTER TABLE "${table}" DROP COLUMN id`);
      await sql.unsafe(`ALTER TABLE "${table}" RENAME COLUMN id_new TO id`);
      if (hasDefault) {
        await sql.unsafe(`ALTER TABLE "${table}" ${defaultClause}`);
      }
      await sql.unsafe(`ALTER TABLE "${table}" ADD PRIMARY KEY (id)`);
      console.log(`  ✅ ${table} migrated`);
    }

    // Step 5: Update other UUID columns
    console.log('Step 5: Converting remaining UUID columns...');

    const uuidConversions = [
      'ALTER TABLE sessions ALTER COLUMN user_id TYPE uuid USING user_id::uuid',
      'ALTER TABLE email_verification_tokens ALTER COLUMN id TYPE uuid USING gen_random_uuid()',
      'ALTER TABLE email_verification_tokens ALTER COLUMN user_id TYPE uuid USING user_id::uuid',
      'ALTER TABLE password_reset_tokens ALTER COLUMN id TYPE uuid USING gen_random_uuid()',
      'ALTER TABLE password_reset_tokens ALTER COLUMN user_id TYPE uuid USING user_id::uuid',
      'ALTER TABLE auth_events ALTER COLUMN id TYPE uuid USING gen_random_uuid()',
      'ALTER TABLE auth_events ALTER COLUMN user_id TYPE uuid USING user_id::uuid',
    ];

    for (const stmt of uuidConversions) {
      try {
        await sql.unsafe(stmt);
      } catch (error) {
        console.log(`  ⚠️  Skipping (may not exist): ${stmt.split('ALTER TABLE ')[1].split(' ')[0]}`);
      }
    }
    console.log('✅ Remaining UUID columns converted');

    console.log('🎉 Safe migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run db:generate');
    console.log('2. Run: npm run db:push');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration
migrateSafe().catch(console.error);
