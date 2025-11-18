const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const emailService = require('./services/email.service');
const smsService = require('./services/sms.service');

/**
 * Comprehensive test for all notification scenarios
 */
async function testAllNotifications() {
  console.log('\n🧪 COMPREHENSIVE NOTIFICATION TEST\n');
  console.log('Testing: Booking Confirmation, Cancellation, and Registration\n');
  console.log('='.repeat(70) + '\n');
  
  // Initialize services
  console.log('📧 Initializing Email Service...');
  emailService.initializeEmailService();
  
  console.log('📱 Initializing SMS Service...');
  smsService.initializeSMSService();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test user data
  const testUser = {
    name: 'Abhilash Chandra',
    email: 'abhilashchandra26@gmail.com',
    phone: '+916282204781',
  };
  
  console.log('\n📋 Test Configuration:');
  console.log('   Name:', testUser.name);
  console.log('   Email:', testUser.email);
  console.log('   Phone:', testUser.phone);
  console.log('\n' + '='.repeat(70) + '\n');
  
  let results = {
    bookingEmail: false,
    bookingSMS: false,
    cancellationEmail: false,
    cancellationSMS: false,
    registrationEmail: false,
    registrationSMS: false,
  };
  
  // ========== TEST 1: BOOKING CONFIRMATION ==========
  console.log('📦 TEST 1: BOOKING CONFIRMATION NOTIFICATIONS\n');
  
  const bookingData = {
    _id: 'TEST_BOOKING_123',
    user: testUser,
    totalAmount: 750,
    bookingDate: new Date(),
    seats: [
      { row: 'A', seat: '5', price: 250 },
      { row: 'A', seat: '6', price: 250 },
      { row: 'A', seat: '7', price: 250 },
    ],
    showtime: {
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      screen: 'Screen 1',
      movie: {
        title: 'Inception',
        poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        duration: 148,
        language: 'English',
        rating: 'PG-13',
      },
      theater: {
        name: 'PVR Cinemas',
        location: {
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
        },
      },
    },
  };
  
  // Test Booking Email
  console.log('📧 Sending Booking Confirmation Email...');
  try {
    const emailResult = await emailService.sendBookingConfirmation(bookingData, testUser);
    if (emailResult.success) {
      console.log('✅ Booking email sent successfully!');
      console.log('   Message ID:', emailResult.messageId);
      results.bookingEmail = true;
    } else {
      console.error('❌ Booking email failed:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Booking email error:', error.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Booking SMS
  console.log('\n📱 Sending Booking Confirmation SMS...');
  try {
    const smsResult = await smsService.sendBookingConfirmationSMS(bookingData, testUser);
    if (smsResult.success) {
      console.log('✅ Booking SMS sent successfully!');
      console.log('   SID:', smsResult.sid);
      results.bookingSMS = true;
    } else {
      console.error('❌ Booking SMS failed:', smsResult.error);
    }
  } catch (error) {
    console.error('❌ Booking SMS error:', error.message);
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // ========== TEST 2: CANCELLATION NOTIFICATION ==========
  console.log('🚫 TEST 2: CANCELLATION NOTIFICATIONS\n');
  
  const cancellationData = {
    _id: 'TEST_BOOKING_123',
    user: testUser,
    totalAmount: 750,
    refundAmount: 675, // 90% refund
    bookingDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    cancellationDate: new Date(),
    cancellationReason: 'User requested cancellation',
    seats: bookingData.seats,
    showtime: bookingData.showtime,
  };
  
  // Test Cancellation Email
  console.log('📧 Sending Cancellation Email...');
  try {
    const emailResult = await emailService.sendCancellationEmail(cancellationData, testUser);
    if (emailResult.success) {
      console.log('✅ Cancellation email sent successfully!');
      console.log('   Message ID:', emailResult.messageId);
      results.cancellationEmail = true;
    } else {
      console.error('❌ Cancellation email failed:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Cancellation email error:', error.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Cancellation SMS
  console.log('\n📱 Sending Cancellation SMS...');
  try {
    const smsResult = await smsService.sendCancellationSMS(cancellationData, testUser);
    if (smsResult.success) {
      console.log('✅ Cancellation SMS sent successfully!');
      console.log('   SID:', smsResult.sid);
      results.cancellationSMS = true;
    } else {
      console.error('❌ Cancellation SMS failed:', smsResult.error);
    }
  } catch (error) {
    console.error('❌ Cancellation SMS error:', error.message);
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // ========== TEST 3: REGISTRATION WELCOME ==========
  console.log('👋 TEST 3: REGISTRATION WELCOME NOTIFICATIONS\n');
  
  const registrationData = {
    name: testUser.name,
    email: testUser.email,
    phone: testUser.phone,
    registrationDate: new Date(),
  };
  
  // Test Registration Email
  console.log('📧 Sending Welcome Email...');
  try {
    const emailResult = await emailService.sendWelcomeEmail(registrationData);
    if (emailResult.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('   Message ID:', emailResult.messageId);
      results.registrationEmail = true;
    } else {
      console.error('❌ Welcome email failed:', emailResult.error);
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test Registration SMS
  console.log('\n📱 Sending Welcome SMS...');
  try {
    const smsMessage = `Welcome to CineGo, ${testUser.name}! Your account has been created successfully. Start booking your favorite movies now! - CineGo Team`;
    const smsResult = await smsService.sendSMS(testUser.phone, smsMessage);
    if (smsResult.success) {
      console.log('✅ Welcome SMS sent successfully!');
      console.log('   SID:', smsResult.sid);
      results.registrationSMS = true;
    } else {
      console.error('❌ Welcome SMS failed:', smsResult.error);
    }
  } catch (error) {
    console.error('❌ Welcome SMS error:', error.message);
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // ========== SUMMARY ==========
  console.log('📊 TEST SUMMARY\n');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;
  
  console.log('Results:');
  console.log('   ✅ Booking Confirmation Email:', results.bookingEmail ? 'PASSED' : 'FAILED');
  console.log('   ✅ Booking Confirmation SMS:', results.bookingSMS ? 'PASSED' : 'FAILED');
  console.log('   ✅ Cancellation Email:', results.cancellationEmail ? 'PASSED' : 'FAILED');
  console.log('   ✅ Cancellation SMS:', results.cancellationSMS ? 'PASSED' : 'FAILED');
  console.log('   ✅ Registration Email:', results.registrationEmail ? 'PASSED' : 'FAILED');
  console.log('   ✅ Registration SMS:', results.registrationSMS ? 'PASSED' : 'FAILED');
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)\n`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! All notification services are working correctly.\n');
  } else if (passedTests > 0) {
    console.log(`⚠️  PARTIAL SUCCESS: ${failedTests} test(s) failed. Check the errors above.\n`);
  } else {
    console.log('❌ ALL TESTS FAILED! Please check your configuration.\n');
  }
  
  console.log('📝 Next Steps:');
  console.log('   1. Check your email inbox:', testUser.email);
  console.log('   2. Check your phone for SMS:', testUser.phone);
  console.log('   3. Check spam/junk folder if emails are missing');
  console.log('   4. Verify Twilio console for SMS delivery status');
  
  console.log('\n💡 Configuration Check:');
  console.log('   Email Host:', process.env.EMAIL_HOST || 'NOT SET');
  console.log('   Email User:', process.env.EMAIL_USER || 'NOT SET');
  console.log('   Email Password:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');
  console.log('   Twilio SID:', process.env.TWILIO_ACCOUNT_SID ? '***SET***' : 'NOT SET');
  console.log('   Twilio Token:', process.env.TWILIO_AUTH_TOKEN ? '***SET***' : 'NOT SET');
  console.log('   Twilio Phone:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');
  
  console.log('\n');
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
console.log('Starting notification tests...\n');
testAllNotifications().catch(error => {
  console.error('\n❌ Test suite failed with error:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});
