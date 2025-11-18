const { getTargetEmail, isVerifiedEmail, isMockEmail } = require('./utils/notificationHelper');

console.log('\n🧪 Testing Email Redirect Logic\n');
console.log('='.repeat(60) + '\n');

const testEmails = [
  'abhilashchandra26@gmail.com',  // Verified - should NOT redirect
  'cinego305@gmail.com',           // Verified - should NOT redirect
  'ganesh@gmail.com',              // Demo Gmail - should redirect
  'test@gmail.com',                // Test Gmail - should redirect
  'john@gmail.com',                // Random Gmail - should redirect
  'user@yahoo.com',                // Random Yahoo - should redirect
  'demo@example.com',              // Demo email - should redirect
];

testEmails.forEach(email => {
  const isVerified = isVerifiedEmail(email);
  const isMock = isMockEmail(email);
  const target = getTargetEmail(email, false);
  const redirected = Array.isArray(target);
  
  console.log(`📧 ${email}`);
  console.log(`   Verified: ${isVerified ? '✅ Yes' : '❌ No'}`);
  console.log(`   Mock/Demo: ${isMock ? '✅ Yes' : '❌ No'}`);
  console.log(`   Target: ${redirected ? target.join(', ') : target}`);
  console.log(`   Redirected: ${redirected ? '✅ Yes → Admin emails' : '❌ No → Original email'}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('\n✅ Test complete!\n');
console.log('Expected behavior:');
console.log('- Verified emails (abhilashchandra26@gmail.com, cinego305@gmail.com) → NOT redirected');
console.log('- All other emails (ganesh@gmail.com, etc.) → Redirected to admin emails');
console.log('\n');
