/**
 * Seed User Requested Data
 * Uses direct PG connection to populate specific user accounts and mock data.
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

// --- DATA DEFINITIONS (From User Request) ---

const CLIENTS = [
    { name: 'John Mwansa', email: 'john.mwansa@email.com', phone: '0977123456', nrc: 'CLI001', password: 'client123' },
    { name: 'Sarah Banda', email: 'sarah.banda@email.com', phone: '0977123457', nrc: 'CLI002', password: 'client123' },
    { name: 'Peter Phiri', email: 'peter.phiri@email.com', phone: '0977123458', nrc: 'CLI003', password: 'client123' },
    { name: 'Mary Tembo', email: 'mary.tembo@email.com', phone: '0977123459', nrc: 'CLI004', password: 'client123' },
    { name: 'David Ngoma', email: 'david.ngoma@email.com', phone: '0977123460', nrc: 'CLI005', password: 'client123' }
];

const CARWASHES = [
    { name: 'Sparkle Auto Wash', email: 'sparkle@carwash.com', phone: '0211234567', nrc: 'CW001', location: 'Cairo Road, Lusaka', password: 'carwash123', bays: 3 },
    { name: 'Crystal Clean Car Wash', email: 'crystal@carwash.com', phone: '0211234568', nrc: 'CW002', location: 'Great East Road, Lusaka', password: 'carwash123', bays: 4 },
    { name: 'Shine Bright Car Care', email: 'shine@carwash.com', phone: '0211234569', nrc: 'CW003', location: 'Makeni Road, Lusaka', password: 'carwash123', bays: 2 },
    { name: 'Premium Wash Center', email: 'premium@carwash.com', phone: '0211234570', nrc: 'CW004', location: 'Woodlands, Lusaka', password: 'carwash123', bays: 5 },
    { name: 'Quick Wash Express', email: 'quick@carwash.com', phone: '0211234571', nrc: 'CW005', location: 'Kabulonga, Lusaka', password: 'carwash123', bays: 2 },
    { name: 'Elite Car Spa', email: 'elite@carwash.com', phone: '0211234572', nrc: 'CW006', location: 'Roma, Lusaka', password: 'carwash123', bays: 3 },
    { name: 'Auto Shine Pro', email: 'autoshine@carwash.com', phone: '0211234573', nrc: 'CW007', location: 'Northmead, Lusaka', password: 'carwash123', bays: 4 },
    { name: 'Mega Wash Hub', email: 'mega@carwash.com', phone: '0211234574', nrc: 'CW008', location: 'Chilenje, Lusaka', password: 'carwash123', bays: 6 },
    { name: 'Spotless Auto Care', email: 'spotless@carwash.com', phone: '0211234575', nrc: 'CW009', location: 'Libala, Lusaka', password: 'carwash123', bays: 3 },
    { name: 'Ultra Clean Services', email: 'ultra@carwash.com', phone: '0211234576', nrc: 'CW010', location: 'Chainda, Lusaka', password: 'carwash123', bays: 2 }
];

const DRIVERS = [
    { name: 'James Mulenga', email: 'james.mulenga@driver.com', phone: '0978123456', nrc: 'DRV001', password: 'driver123', license: 'DL001', type: 'Class B' },
    { name: 'Michael Chanda', email: 'michael.chanda@driver.com', phone: '0978123457', nrc: 'DRV002', password: 'driver123', license: 'DL002', type: 'Class B' },
    { name: 'Robert Mwanza', email: 'robert.mwanza@driver.com', phone: '0978123458', nrc: 'DRV003', password: 'driver123', license: 'DL003', type: 'Class C' },
    { name: 'Thomas Banda', email: 'thomas.banda@driver.com', phone: '0978123459', nrc: 'DRV004', password: 'driver123', license: 'DL004', type: 'Class B' },
    { name: 'Andrew Phiri', email: 'andrew.phiri@driver.com', phone: '0978123460', nrc: 'DRV005', password: 'driver123', license: 'DL005', type: 'Class B' },
    { name: 'Daniel Tembo', email: 'daniel.tembo@driver.com', phone: '0978123461', nrc: 'DRV006', password: 'driver123', license: 'DL006', type: 'Class C' },
    { name: 'Mark Ngoma', email: 'mark.ngoma@driver.com', phone: '0978123462', nrc: 'DRV007', password: 'driver123', license: 'DL007', type: 'Class B' },
    { name: 'Paul Mwila', email: 'paul.mwila@driver.com', phone: '0978123463', nrc: 'DRV008', password: 'driver123', license: 'DL008', type: 'Class B' },
    { name: 'Steven Lungu', email: 'steven.lungu@driver.com', phone: '0978123464', nrc: 'DRV009', password: 'driver123', license: 'DL009', type: 'Class C' },
    { name: 'Brian Mbewe', email: 'brian.mbewe@driver.com', phone: '0978123465', nrc: 'DRV010', password: 'driver123', license: 'DL010', type: 'Class B' }
];

const VEHICLES = [
    { make: 'Toyota', model: 'Corolla', color: 'White', plate_prefix: 'ABC' },
    { make: 'Honda', model: 'Civic', color: 'Silver', plate_prefix: 'XYZ' },
    { make: 'Ford', model: 'Ranger', color: 'Blue', plate_prefix: 'BAA' },
    { make: 'Mazda', model: 'Demio', color: 'Red', plate_prefix: 'CAT' },
    { make: 'Nissan', model: 'X-Trail', color: 'Black', plate_prefix: 'DOG' }
];

// Valid services based on database constraints
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

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function runSeed() {
    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        // --- CLEANUP ---
        console.log('\n🧹 Cleaning up requested users...');
        const allEmails = [
            ...CLIENTS.map(u => u.email),
            ...DRIVERS.map(u => u.email),
            ...CARWASHES.map(u => u.email)
        ];
        // Also cleanup NRCs
        const allNrcs = [
            ...CLIENTS.map(u => u.nrc),
            ...DRIVERS.map(u => u.nrc),
            ...CARWASHES.map(u => u.nrc)
        ];

        await client.query(`
        DELETE FROM users 
        WHERE email = ANY($1) 
           OR nrc = ANY($2)
    `, [allEmails, allNrcs]);
        console.log(`✅ Removed ${allEmails.length} accounts to ensure clean state.`);


        // 1. Seed Clients
        console.log('\n--- Seeding Clients ---');
        for (const c of CLIENTS) {
            const hash = await hashPassword(c.password);
            const res = await client.query(`
        INSERT INTO users (name, email, password, phone, nrc, role, is_active)
        VALUES ($1, $2, $3, $4, $5, 'client', true)
        RETURNING id;
      `, [c.name, c.email, hash, c.phone, c.nrc]);

            const userId = res.rows[0].id;

            // Add Vehicles
            const numVehicles = randInt(1, 2);
            for (let i = 0; i < numVehicles; i++) {
                const v = VEHICLES[randInt(0, VEHICLES.length - 1)];
                const plate = `${v.plate_prefix} ${randInt(100, 9999)}`;
                await client.query(`
          INSERT INTO vehicles (client_id, make, model, color, plate_no)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, v.make, v.model, v.color, plate]);
            }
        }
        console.log(`✅ Added ${CLIENTS.length} Clients with vehicles.`);

        // 2. Seed Drivers
        console.log('\n--- Seeding Drivers ---');
        for (const d of DRIVERS) {
            const hash = await hashPassword(d.password);
            // Removed broken columns: driver_rating, completed_jobs, approval_status
            await client.query(`
        INSERT INTO users (
            name, email, password, phone, nrc, role, is_active,
            license_no, license_type, availability
        )
        VALUES ($1, $2, $3, $4, $5, 'driver', true, $6, $7, true)
      `, [d.name, d.email, hash, d.phone, d.nrc, d.license, d.type]);
        }
        console.log(`✅ Added ${DRIVERS.length} Drivers.`);

        // 3. Seed Car Washes
        console.log('\n--- Seeding Car Washes ---');
        for (const w of CARWASHES) {
            const hash = await hashPassword(w.password);
            // Removed broken column: approval_status
            const res = await client.query(`
        INSERT INTO users (
            name, email, password, phone, nrc, role, is_active,
            car_wash_name, location, washing_bays
        )
        VALUES ($1, $2, $3, $4, $5, 'carwash', true, $6, $7, $8)
        RETURNING id;
      `, [w.name, w.email, hash, w.phone, w.nrc, w.name, w.location, w.bays]);

            const washId = res.rows[0].id;

            // Add Services
            for (const s of SERVICES) {
                await client.query(`
            INSERT INTO services (car_wash_id, name, description, price, is_active)
            VALUES ($1, $2, $3, $4, true)
        `, [washId, s.name, s.description, s.price]);
            }
        }
        console.log(`✅ Added ${CARWASHES.length} Car Washes with services.`);

        console.log('\n✨ CREDENTIAL SEEDING COMPLETE ✨');

    } catch (e) {
        console.error('❌ SEED ERROR:', e);
    } finally {
        await client.end();
    }
}

runSeed();
