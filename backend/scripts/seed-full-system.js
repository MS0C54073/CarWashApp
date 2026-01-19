/**
 * Seed Full System Data Script
 * Bypasses RLS by using direct PG connection
 */

require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("❌ DATABASE_URL missing in .env");
    process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

// --- DATA DEFINITIONS ---

const CLIENTS = [
    { name: 'John Client', email: 'john@client.com', phone: '0970000001', nrc: 'CLI001', password: 'password123' },
    { name: 'Alice Smith', email: 'alice@client.com', phone: '0970000002', nrc: 'CLI002', password: 'password123' },
    { name: 'Bob Jones', email: 'bob@client.com', phone: '0970000003', nrc: 'CLI003', password: 'password123' }
];

const DRIVERS = [
    { name: 'Mike Driver', email: 'mike@driver.com', phone: '0970000101', nrc: 'DRV001', password: 'password123', license: 'DL001', type: 'Class C' },
    { name: 'Steve Wheel', email: 'steve@driver.com', phone: '0970000102', nrc: 'DRV002', password: 'password123', license: 'DL002', type: 'Class C' },
    { name: 'Jane Racer', email: 'jane@driver.com', phone: '0970000103', nrc: 'DRV003', password: 'password123', license: 'DL003', type: 'Class C' }
];

const CARWASHES = [
    { name: 'Sparkle Wash', email: 'sparkle@carwash.com', phone: '0970000201', nrc: 'CW001', location: 'Cairo Road, Lusaka', password: 'password123', bays: 3 },
    { name: 'Crystal Clean', email: 'crystal@carwash.com', phone: '0970000202', nrc: 'CW002', location: 'Manda Hill, Lusaka', password: 'password123', bays: 5 },
    { name: 'Speedy Shine', email: 'speedy@carwash.com', phone: '0970000203', nrc: 'CW003', location: 'Kabulonga, Lusaka', password: 'password123', bays: 2 }
];

const VEHICLES = [
    { make: 'Toyota', model: 'Corolla', color: 'White', plate_prefix: 'ABC' },
    { make: 'Honda', model: 'Civic', color: 'Silver', plate_prefix: 'XYZ' },
    { make: 'Ford', model: 'Ranger', color: 'Blue', plate_prefix: 'BAA' },
    { make: 'Mazda', model: 'Demio', color: 'Red', plate_prefix: 'CAT' },
    { make: 'Nissan', model: 'X-Trail', color: 'Black', plate_prefix: 'DOG' }
];

const SERVICES = [
    { name: 'Full Basic Wash', price: 50, description: 'Exterior wash and rinse' },
    { name: 'Wax and Polishing', price: 100, description: 'Inside and out thorough cleaning' },
    { name: 'Exterior Wash', price: 250, description: 'Wash, wax, polish, and engine clean' },
    { name: 'Engine Wash', price: 80, description: 'Deep engine cleaning' },
    { name: 'Interior Wash', price: 150, description: 'Deep shampoo of seats and carpets' }
];

// --- HELPERS ---

async function hashPassword(plain) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
}

// Generate random int min-max inclusive
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runSeed() {
    try {
        await client.connect();
        console.log('🔌 Connected to database (Direct PG)...');

        // --- CLEANUP ---
        console.log('\n🧹 Cleaning up old test data...');

        // Collect all Emails and NRCs from seed data
        const allEmails = [
            ...CLIENTS.map(u => u.email),
            ...DRIVERS.map(u => u.email),
            ...CARWASHES.map(u => u.email)
        ];

        const allNrcs = [
            ...CLIENTS.map(u => u.nrc),
            ...DRIVERS.map(u => u.nrc),
            ...CARWASHES.map(u => u.nrc)
        ];

        // Delete users with these emails or NRCs
        // NOTE: using ANY($1) array syntax for cleaner query
        await client.query(`
        DELETE FROM users
        WHERE email = ANY($1)
           OR nrc = ANY($2)
    `, [allEmails, allNrcs]);

        console.log(`✅ Removed potential duplicate users (${allEmails.length} accounts checked).`);

        // 1. Ensure Admin Exists (Already fixed, but let's be safe)
        // Skipped to avoid overwriting the specific fix we just did, or we can just upsert safely.

        // 2. Seed Clients
        console.log('\n--- Seeding Clients ---');
        const clientIds = [];
        for (const c of CLIENTS) {
            const hash = await hashPassword(c.password);
            const res = await client.query(`
        INSERT INTO users (name, email, password, phone, nrc, role, is_active)
        VALUES ($1, $2, $3, $4, $5, 'client', true)
        RETURNING id, name, email;
      `, [c.name, c.email, hash, c.phone, c.nrc]);

            const userId = res.rows[0].id;
            clientIds.push(userId);
            console.log(`✅ Client: ${c.name} (${c.email})`);

            // Add Vehicles
            const numVehicles = randInt(1, 3);
            for (let i = 0; i < numVehicles; i++) {
                const v = VEHICLES[randInt(0, VEHICLES.length - 1)];
                const plate = `${v.plate_prefix} ${randInt(100, 9999)}`;

                await client.query(`
          INSERT INTO vehicles (client_id, make, model, color, plate_no)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING;
        `, [userId, v.make, v.model, v.color, plate]);
            }
            console.log(`   + Added ${numVehicles} vehicles`);
        }

        // 3. Seed Drivers
        console.log('\n--- Seeding Drivers ---');
        const driverIds = [];
        for (const d of DRIVERS) {
            const hash = await hashPassword(d.password);
            // Determine columns based on schema
            // users table has license_no, license_type, etc.
            const res = await client.query(`
        INSERT INTO users (
            name, email, password, phone, nrc, role, is_active,
            license_no, license_type, availability
        )
        VALUES ($1, $2, $3, $4, $5, 'driver', true, $6, $7, true)
        RETURNING id, name, email;
      `, [d.name, d.email, hash, d.phone, d.nrc, d.license, d.type]);

            driverIds.push(res.rows[0].id);
            console.log(`✅ Driver: ${d.name} (${d.email})`);
        }

        // 4. Seed Car Washes & Services
        console.log('\n--- Seeding Car Washes ---');
        const washIds = [];
        for (const w of CARWASHES) {
            const hash = await hashPassword(w.password);
            const res = await client.query(`
        INSERT INTO users (
            name, email, password, phone, nrc, role, is_active,
            car_wash_name, location, washing_bays
        )
        VALUES ($1, $2, $3, $4, $5, 'carwash', true, $6, $7, $8)
        RETURNING id, name, email, car_wash_name;
      `, [w.name, w.email, hash, w.phone, w.nrc, w.name, w.location, w.bays]);

            const washId = res.rows[0].id;
            washIds.push(washId);
            console.log(`✅ Car Wash: ${w.name}`);

            // Add Services
            for (const s of SERVICES) {
                await client.query(`
            INSERT INTO services (car_wash_id, name, description, price, is_active)
            VALUES ($1, $2, $3, $4, true)
            ON CONFLICT DO NOTHING; -- Service names not unique globally, but good to be safe if constraints exist
        `, [washId, s.name, s.description, s.price]);
            }
            console.log(`   + Added ${SERVICES.length} services`);
        }

        // 5. Create some dummy bookings
        console.log('\n--- Creating Mock Bookings (History) ---');
        // We need a client, a vehicle, a car wash, a service, and maybe a driver
        // Fetch a vehicle for first client
        const vRes = await client.query('SELECT id FROM vehicles WHERE client_id = $1 LIMIT 1', [clientIds[0]]);
        const vehicleId = vRes.rows[0]?.id;

        // Fetch a service for first car wash
        const sRes = await client.query('SELECT id, price FROM services WHERE car_wash_id = $1 LIMIT 1', [washIds[0]]);
        const service = sRes.rows[0];

        if (vehicleId && service) {
            // Completed Booking
            await client.query(`
            INSERT INTO bookings (
                client_id, car_wash_id, vehicle_id, service_id, driver_id,
                status, payment_status, total_amount, booking_type,
                pickup_location, notes
            ) VALUES (
                $1, $2, $3, $4, $5,
                'completed', 'paid', $6, 'pickup_delivery',
                '123 Test St, Lusaka', 'History booking'
            )
        `, [clientIds[0], washIds[0], vehicleId, service.id, driverIds[0], service.price]);
            console.log('✅ Created 1 completed booking for history');

            // Pending Booking (No driver yet)
            await client.query(`
            INSERT INTO bookings (
                client_id, car_wash_id, vehicle_id, service_id,
                status, payment_status, total_amount, booking_type,
                 pickup_location, notes
            ) VALUES (
                $1, $2, $3, $4,
                'pending', 'pending', $5, 'pickup_delivery',
                '456 Sample Rd, Lusaka', 'Fresh pending booking'
            )
        `, [clientIds[0], washIds[0], vehicleId, service.id, service.price]);
            console.log('✅ Created 1 pending booking for testing');
        }

        console.log('\n✨ SEEDING COMPLETE ✨');

        // Write Credentials File
        const credsFile = `
# System Test Credentials

All accounts use password: **password123**
(Admin uses **123456**)

## 👑 Admin
- **Email**: admin@sucar.com
- **Pass**: 123456

## 📱 Clients
${CLIENTS.map(c => `- ${c.name}: ${c.email}`).join('\n')}

## 🚗 Drivers
${DRIVERS.map(d => `- ${d.name}: ${d.email} (License: ${d.license})`).join('\n')}

## 🧼 Car Washes
${CARWASHES.map(w => `- ${w.name}: ${w.email} (${w.location})`).join('\n')}
`;

        const rootDir = path.resolve(__dirname, '../../');
        fs.writeFileSync(path.join(rootDir, 'TEST_CREDENTIALS.md'), credsFile);
        console.log(`\n📄 Credentials saved to TEST_CREDENTIALS.md`);

    } catch (e) {
        console.error('❌ SEED ERROR:', e);
    } finally {
        await client.end();
    }
}

runSeed();
