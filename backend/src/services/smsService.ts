import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export class SMSService {
    /**
     * Send a verification code to a phone number
     * @param phoneNumber - Format: +1234567890
     */
    static async sendVerificationCode(phoneNumber: string): Promise<boolean> {
        if (!accountSid || !authToken || !verifyServiceSid) {
            console.warn('Twilio credentials not configured. Mocking SMS send.');
            return true;
        }

        try {
            await client.verify.v2.services(verifyServiceSid)
                .verifications
                .create({ to: phoneNumber, channel: 'sms' });
            return true;
        } catch (error) {
            console.error('Error sending SMS:', error);
            return false;
        }
    }

    /**
     * Verify a code sent to a phone number
     */
    static async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
        if (!accountSid || !authToken || !verifyServiceSid) {
            console.warn('Twilio credentials not configured. Mocking SMS verify.');
            return code === '123456'; // Default mock code
        }

        try {
            const verificationResult = await client.verify.v2.services(verifyServiceSid)
                .verificationChecks
                .create({ to: phoneNumber, code: code });

            return verificationResult.status === 'approved';
        } catch (error) {
            console.error('Error verifying SMS code:', error);
            return false;
        }
    }
}
