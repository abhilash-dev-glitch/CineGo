require('dotenv').config();
const emailService = require('./services/email.service');
const smsService = require('./services/sms.service');

/**
 * Comprehensive test script for email and SMS notifications
 */
async function testNotifications() {
  console.log('\n🧪 Starting Notification Services Test...\n');
  
  // Initialize services
  console.log('📧 Initializing Email Service...');
  emailService.initializeEmailService();
  
  console.log('📱 Initializing SMS Service...');
  smsService.initializeSMSService();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test data
  const testUser = {
    name: 'Test User',
    email: 'abhilashchandra26@gmail.com', // Your admin email
    phone: '+916282204781', // Your verified phone
  };
  
  const testBooking = {
    _id: 'TEST123456',
    totalAmount: 500,
    seats: [
      { row: 'A', seat: '1' },
      { row: 'A', seat: '2' },
    ],
    createdAt: new Date(),
    showtime: {
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      movie: {
        title: 'Test Movie',
        poster: 'https://via.placeholder.com/300x450',
        genre: 'Action',
        duration: 120,
        language: 'English',
        description: 'This is a test movie for notification testing',
      },
      theater: {
        name: 'Test Cinema',
      },
    },
  };
  
  console.log('\n📋 Test Configuration:');
  console.log('   User:', testUser.name);
  console.log('   Email:', testUser.email);
  console.log('   Phone:', testUser.phone);
  console.log('   Movie:', testBooking.showtime.movie.title);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 1: Email Service
  console.log('📧 TEST 1: Sending Booking Confirmation Email...');
  try {
    const emailResult = await emailService.sendBookingConfirmation(testBooking, testUser);
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log('   Message ID:', emailResult.messageId);
    } else {
      console.error('❌ Email failed:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Wait a bit before SMS
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: SMS Service
  console.log('📱 TEST 2: Sending Booking Confirmation SMS...');
  try {
    const smsResult = await smsService.sendBookingConfirmationSMS(testBooking, testUser);
    
    if (smsResult.success) {
      console.log('✅ SMS sent successfully!');
      console.log('   SID:', smsResult.sid);
      console.log('   To:', smsResult.to);
    } else {
      console.error('❌ SMS failed:', smsResult.error);
    }
  } catch (error) {
    console.error('❌ SMS error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Simple Email Test
  console.log('📧 TEST 3: Sending Simple Test Email...');
  try {
    const mailer = require('./utils/mailer');
    const simpleEmailResult = await mailer.send({
      to: testUser.email,
      subject: '🎬 CineGo Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e50914;">CineGo Email Test</h2>
          <p>Hello ${testUser.name},</p>
          <p>This is a test email from CineGo notification system.</p>
          <p>If you received this email, your email configuration is working correctly! ✅</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: CineGo Notification System
          </p>
        </div>
      `,
    });
    
    if (simpleEmailResult.success) {
      console.log('✅ Simple email sent successfully!');
      console.log('   Message ID:', simpleEmailResult.messageId);
    } else {
      console.error('❌ Simple email failed:', simpleEmailResult.error);
    }
  } catch (error) {
    console.error('❌ Simple email error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 4: Simple SMS Test
  console.log('📱 TEST 4: Sending Simple Test SMS...');
  try {
    const simpleSmsResult = await smsService.sendSMS(
      testUser.phone,
      `CineGo Test: This is a test SMS from CineGo notification system. Sent at ${new Date().toLocaleTimeString()}`
    );
    
    if (simpleSmsResult.success) {
      console.log('✅ Simple SMS sent successfully!');
      console.log('   SID:', simpleSmsResult.sid);
      console.log('   To:', simpleSmsResult.to);
    } else {
      console.error('❌ Simple SMS failed:', simpleSmsResult.error);
    }
  } catch (error) {
    console.error('❌ Simple SMS error:', error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('🏁 Test Complete!\n');
  console.log('📝 Summary:');
  console.log('   - Check your email inbox:', testUser.email);
  console.log('   - Check your phone for SMS:', testUser.phone);
  console.log('   - If you didn\'t receive notifications, check the error messages above');
  console.log('\n💡 Troubleshooting Tips:');
  console.log('   Email Issues:');
  console.log('   - Verify EMAIL_PASSWORD is a valid Gmail App Password (16 chars, no spaces)');
  console.log('   - Check spam/junk folder');
  console.log('   - Ensure 2FA is enabled on Gmail and App Password is generated');
  console.log('\n   SMS Issues:');
  console.log('   - Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct');
  console.log('   - Ensure TWILIO_PHONE_NUMBER is in E.164 format (+12055189697)');
  console.log('   - Verify your phone number (+916282204781) is verified in Twilio console');
  console.log('   - Check Twilio dashboard for any error logs');
  console.log('\n');
  
  process.exit(0);
}

// Run tests
testNotifications().catch(error => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});
