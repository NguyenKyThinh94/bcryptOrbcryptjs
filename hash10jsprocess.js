const bcrypt = require("bcryptjs")

function otherProcess(iteration) {
  const start = new Date()
  setTimeout(() => {
    const lag = new Date() - start
    console.log(`Process ${iteration} took\t${lag} ms`)
    otherProcess(iteration + 1)
  })
}
otherProcess(1)

function hash() {
  const start = new Date()
  const hashRounds = 10
  bcrypt.hash("hash 10 rounds!", hashRounds, () => {
    console.log(`Hashing time: ${new Date() - start} ms`)
    setTimeout(hash)
  });
}
hash()