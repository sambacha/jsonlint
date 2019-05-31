const EventEmitter = require('events')

class Guard extends EventEmitter {
  constructor (description) {
    super()
    this.description = description
    this.tests = []
  }

  add (description, callback) {
    this.tests.push({ description, callback })
    return this
  }

  start () {
    for (let test of this.tests) {
      try {
        this.emit('before:test', { target: test })
        test.callback()
      } catch (error) {
        console.log(formatTestMessage(error))
      }
    }
  }
}

function formatTestMessage (error) {
  return error.message
    .split(/\r?\n/)
    .map(line => `    ${line}`)
    .join('\n')
}

function createGuard (description) {
  console.log(`${description}:`)
  return new Guard(description)
    .on('before:test', ({ target }) => {
      const { description } = target
      console.log(`\n  ${description}:`)
    })
}

module.exports = createGuard
