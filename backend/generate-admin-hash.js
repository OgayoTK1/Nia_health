const bcrypt = require('bcryptjs');

// Read admin password from environment for safety
const password = process.env.ADMIN_PASSWORD;
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

if (!password) {
  console.error('ADMIN_PASSWORD environment variable not set. Aborting.');
  process.exit(1);
}

(async () => {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(hash);
  } catch (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
})();
