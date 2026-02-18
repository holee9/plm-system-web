/**
 * Fix user_roles table
 * Drops and recreates user_roles with correct UUID types
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

async function fixUserRoles() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = postgres(connectionString, { max: 1 });

  console.log('🔄 Fixing user_roles table...');

  try {
    // Drop user_roles table
    console.log('Dropping user_roles table...');
    await sql.unsafe('DROP TABLE IF EXISTS user_roles CASCADE');

    // Recreate user_roles with UUID types
    console.log('Recreating user_roles with UUID types...');
    await sql.unsafe(`
      CREATE TABLE user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        user_id uuid NOT NULL,
        role_id integer NOT NULL,
        assigned_at timestamp DEFAULT now() NOT NULL,
        assigned_by uuid,
        CONSTRAINT user_roles_user_id_users_id_fk
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT user_roles_role_id_roles_id_fk
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        CONSTRAINT user_roles_assigned_by_users_id_fk
          FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ user_roles table fixed!');
    console.log('');
    console.log('Now run: npm run db:push');

  } catch (error) {
    console.error('❌ Failed to fix user_roles:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixUserRoles().catch(console.error);
