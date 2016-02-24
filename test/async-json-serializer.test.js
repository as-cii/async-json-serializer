import AsyncJsonSerializer from '../src/async-json-serializer'
import Random from 'random-seed'

describe('AsyncJsonSerializer', function () {
  function synchronousCallback () {
    let timeRemaining = 3

    return new Promise(function (resolve) {
      let deadline = {timeRemaining: function () {
        timeRemaining--
        return timeRemaining
      }}

      resolve(deadline)
    })
  }

  describe('.prototype.stringify(object)', function () {
    it('returns a Promise that resolves to the JSON string representation of the object', async function () {
      this.timeout(Infinity)

      let serializer = new AsyncJsonSerializer(synchronousCallback)
      for (let i = 0; i < 100; i++) {
        let seed = Date.now()
        let random = new Random(seed)
        let object = createRandomNestedObject(random, {}, 5)
        let asyncJsonString = await serializer.stringify(object)
        let referenceJsonString = JSON.stringify(object)
        assert.deepEqual(JSON.parse(asyncJsonString), JSON.parse(referenceJsonString), `Failed with seed: ${seed}`)
      }
    })

    function createRandomArray (random, upperBound) {
      let array = []
      for (var i = 0; i < random(10); i++) {
        array.push(createRandomNestedObject(random, {}, upperBound))
      }
      return array
    }

    function createRandomPrimitive (random) {
      let n = random(4)
      if (n === 0) {
        return 'abcdefghijk'
      } else if (n === 1) {
        return 42
      } else if (n === 2) {
        return null
      } else {
        return undefined
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
