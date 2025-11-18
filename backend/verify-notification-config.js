require('dotenv').config();

/**
 * Quick verification script for notification configuration
 * Run this to check if all environment variables are properly set
 */

console.log('\n🔍 Notification Configuration Verification\n');
console.log('='.repeat(60));

// Email Configuration
console.log('\n📧 EMAIL CONFIGURATION:');
console.log('   HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
console.log('   PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
console.log('   USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('   PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (' + process.env.EMAIL_PASSWORD.length + ' chars)' : '❌ NOT SET');
console.log('   FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('   FROM_NAME:', process.env.EMAIL_FROM_NAME || '❌ NOT SET');

// SMS Configuration
console.log('\n📱 SMS CONFIGURATION:');
console.log('   ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ SET (' + process.env.TWILIO_ACCOUNT_SID.substring(0, 10) + '...)' : '❌ NOT SET');
console.log('   AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ SET (' + process.env.TWILIO_AUTH_TOKEN.substring(0, 10) + '...)' : '❌ NOT SET');
console.log('   PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || '❌ NOT SET');

// Fallback Configuration
console.log('\n🔄 FALLBACK CONFIGURATION:');
console.log('   EMAIL:', process.env.FALLBACK_EMAIL || '❌ NOT SET');
console.log('   PHONE:', process.env.FALLBACK_PHONE || '❌ NOT SET');

// Admin Emails
console.log('\n👤 ADMIN EMAILS:');
console.log('   ADMIN_EMAIL_1:', process.env.ADMIN_EMAIL_1 || '❌ NOT SET');
console.log('   ADMIN_EMAIL_2:', process.env.ADMIN_EMAIL_2 || '❌ NOT SET');

console.log('\n' + '='.repeat(60));

// Validation
let hasErrors = false;
const errors = [];

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  errors.push('❌ Email credentials incomplete');
  hasErrors = true;
}

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  errors.push('❌ Twilio credentials incomplete');
  hasErrors = true;
}

// Check phone number format
if (process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER.includes(' ')) {
  errors.push('❌ TWILIO_PHONE_NUMBER contains spaces - should be in E.164 format (e.g., +12055189697)');
  hasErrors = true;
}

// Check email password length (Gmail App Password should be 16 chars)
if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.length !== 16) {
  errors.push('⚠️  EMAIL_PASSWORD is not 16 characters - Gmail App Passwords should be exactly 16 characters');
}

console.log('\n📋 VALIDATION RESULTS:\n');

if (hasErrors) {
  console.log('❌ Configuration has errors:\n');
  errors.forEach(error => console.log('   ' + error));
  console.log('\n💡 Fix these issues before running the application');
} else {
  console.log('✅ All required configuration is present!');
  console.log('\n💡 Next steps:');
  console.log('   1. Run test script: node test-email-sms.js');
  console.log('   2. Start the server: npm start');
  console.log('   3. Test with real booking/signup');
}

console.log('\n' + '='.repeat(60) + '\n');

process.exit(hasErrors ? 1 : 0);
