const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54323/postgres'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Create logs table
        console.log('Creating logs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(100) NOT NULL,
                resource VARCHAR(100),
                resource_id VARCHAR(100),
                details JSONB,
                ip_address VARCHAR(45),
                severity VARCHAR(20) DEFAULT 'info',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
            CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
            CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
        `);

        console.log('Database migration v4 (logs) completed successfully');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await client.end();
    }
}

run();
