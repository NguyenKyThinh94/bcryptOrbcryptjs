const bcrypt = require("bcryptjs")

function hash() {
  const start = new Date()
  const hashRounds = 10
  bcrypt.hash("hash 10 rounds!", hashRounds, () => {
    console.log(`Hashing time: ${new Date() - start} ms`)
    setTimeout(hash)
  });
}
hash()