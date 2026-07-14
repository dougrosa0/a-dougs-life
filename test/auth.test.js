const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateSalt, hashPassword, verifyPassword } = require('../src/auth');

test('verifyPassword accepts the correct password', () => {
  const salt = generateSalt();
  const hash = hashPassword('correct horse battery staple', salt);
  assert.equal(verifyPassword('correct horse battery staple', salt, hash), true);
});

test('verifyPassword rejects an incorrect password', () => {
  const salt = generateSalt();
  const hash = hashPassword('correct horse battery staple', salt);
  assert.equal(verifyPassword('wrong password', salt, hash), false);
});

test('verifyPassword rejects when salt or hash is missing', () => {
  assert.equal(verifyPassword('anything', undefined, undefined), false);
  assert.equal(verifyPassword('anything', 'somesalt', undefined), false);
});

test('generateSalt produces distinct salts', () => {
  assert.notEqual(generateSalt(), generateSalt());
});
