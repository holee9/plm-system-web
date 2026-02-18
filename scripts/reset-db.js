/**
 * Complete Database Reset
 * Drops everything and recreates from scratch
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import postgres from 'postgres';

function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=').trim();
        value = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
        process.env[key] = value;
      }
    });
  } catch (error) {
    try {
      const envPath = join(process.cwd(), '.env');
      const envContent = readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          value = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
          process.env[key] = value;
        }
      });
    } catch (e) {
      console.log('Using system environment variables');
    }
  }
}

loadEnv();

async function completeReset() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = postgres(connectionString, { max: 1 });

  console.log('🔄 Complete Database Reset...');
  console.log('');

  try {
    // Get database name from connection string
    const dbNameMatch = connectionString.match(/\/([^?/]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'plm_system';

    console.log(`Database: ${dbName}`);
    console.log('');

    // Drop everything in public schema
    console.log('Step 1: Dropping all tables...');
    await sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
        END LOOP;
      END $$;
    `;
    console.log('✅ All tables dropped');

    console.log('Step 2: Dropping all types...');
    await sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type WHERE typcategory = 'E' AND typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
        END LOOP;
      END $$;
    `;
    console.log('✅ All types dropped');

    console.log('Step 3: Dropping all enums...');
    await sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e') LOOP
          EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
        END LOOP;
      END $$;
    `;
    console.log('✅ All enums dropped');

    console.log('');
    console.log('🎉 Database completely reset!');
    console.log('');
    console.log('Next: npm run db:push');

  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

completeReset().catch(console.error);
