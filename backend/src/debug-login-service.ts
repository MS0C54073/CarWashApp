import { DBService } from './services/db-service';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function debugLogin() {
    const email = 'admin@sucar.com';
    const password = '123456';

    console.log('--- DEBUG USER LOOKUP ---');
    try {
        const user = await DBService.findUserByEmail(email);
        console.log('User found:', user ? 'YES' : 'NO');

        if (user) {
            console.log('ID:', user.id);
            console.log('Role:', user.role);
            console.log('Email:', user.email);
            console.log('Password Hash in DB:', user.password);

            console.log('--- TEST PASSWORD COMPARE ---');
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`Comparing '${password}' with hash: ${isMatch}`);

            // Try generating a new hash and compare
            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(password, salt);
            console.log('New hash would be:', newHash);
            const selfCheck = await bcrypt.compare(password, newHash);
            console.log('Self check of new hash:', selfCheck);
        } else {
            console.log('Use not found via DBService. (Check RLS or connection)');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugLogin();
