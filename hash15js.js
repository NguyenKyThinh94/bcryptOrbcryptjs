const bcrypt = require("bcryptjs")

function hash() {
  const start = new Date()
  const hashRounds = 15
  bcrypt.hash("hash 15 rounds!", hashRounds, () => {
    console.log(`Hashing time: ${new Date() - start} ms`)
    setTimeout(hash)
  });
}
hash()