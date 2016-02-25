'use strict'

let AsyncJsonSerializer = require('../src/async-json-serializer')
let Random = require('random-seed')

describe('AsyncJsonSerializer', function () {
  function synchronousCallback (callback) {
    let timeRemaining = 2000
    let deadline = {
      timeRemaining: function () {
        timeRemaining--
        return timeRemaining
      }
    }

    process.nextTick(function () { callback(deadline) })
  }

  describe('.prototype.stringify(object, callback)', function () {
    for (let i = 0; i < 100; i++) {
      it('invokes the passed callback with the JSON string representation of the object', function (done) {
        this.timeout(Infinity)

        let seed = Date.now()
        let random = new Random(seed)
        let serializer = new AsyncJsonSerializer(synchronousCallback)
        let object = createRandomNestedObject(random, {}, 10)
        let referenceJsonString = JSON.stringify(object)
        serializer.stringify(object, function (asyncJsonString) {
          assert.deepEqual(JSON.parse(asyncJsonString), JSON.parse(referenceJsonString))
          done()
        })
      })
    }

    function createRandomArray (random, upperBound) {
      let array = []
      for (let i = 0; i < random(10); i++) {
        array.push(createRandomNestedObject(random, {}, upperBound))
      }
      return array
    }

    function createRandomPrimitive (random) {
      let n = random(5)
      if (n === 0) {
        return 'abcdefghijk'
      } else if (n === 1) {
        return 42
      } else if (n === 2) {
        return null
      } else if (n === 3) {
        return undefined
      } else if (n === 4) {
        return Boolean(random(2))
      }
    }

    function createRandomNestedObject (random, object, upperBound) {
      while (upperBound-- >= 0) {
        let n = random(10)
        if (n <= 3) {
          object[random(1000000)] = createRandomPrimitive(random)
        } else if (n <= 5) {
          object[random(1000000)] = createRandomArray(random, upperBound)
        } else {
          object[random(1000000)] = createRandomNestedObject(random, {}, upperBound)
        }
      }

      return object
    }
  })
})
