const readline = require('readline');
const { generateSalt, hashPassword } = require('../src/auth');

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const output = rl._writeToOutput;
    rl._writeToOutput = (str) => {
      if (str.trim() && str !== question) {
        output.call(rl, '*');
      } else {
        output.call(rl, str);
      }
    };
    rl.question(question, (answer) => {
      rl._writeToOutput = output;
      rl.output.write('\n');
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const password = await promptHidden('Choose an admin password: ');
  const confirm = await promptHidden('Confirm password: ');

  if (!password || password.length < 8) {
    console.error('\nPassword must be at least 8 characters.');
    process.exitCode = 1;
    return;
  }
  if (password !== confirm) {
    console.error('\nPasswords did not match.');
    process.exitCode = 1;
    return;
  }

  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  console.log('\nAdd these to your .env (never commit real values):\n');
  console.log(`ADMIN_PASSWORD_SALT=${salt}`);
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
}

main();
