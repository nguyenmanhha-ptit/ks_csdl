const mysql = require('mysql2/promise');

async function testPasswords() {
  const passwords = ['', 'root', '123456', 'password', '12345678', 'admin'];
  for (let pwd of passwords) {
    try {
      console.log('Testing password:', pwd === '' ? '(empty)' : pwd);
      const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: pwd });
      console.log('SUCCESS with password:', pwd);
      await conn.end();
      process.exit(0);
    } catch (e) {
      // ignore
    }
  }
  console.log('FAILED ALL');
}

testPasswords();
