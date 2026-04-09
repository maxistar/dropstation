#!/usr/bin/env node
import crypto from 'node:crypto'

const password = process.argv[2]

if (!password) {
  console.error('Usage: node dropstation/scripts/hash-password.mjs <password>')
  process.exit(1)
}

const salt = crypto.randomBytes(16)
crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, hash) => {
  if (error) {
    console.error(error)
    process.exit(1)
  }

  console.log(`scrypt$16384$8$1$${salt.toString('base64url')}$${hash.toString('base64url')}`)
})
