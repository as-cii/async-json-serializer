'use strict'

const IMMEDIATE_DEADLINE = {timeRemaining: function () { return 0 }}

module.exports =
class AsyncJsonSerializer {
  constructor (nextCallback) {
    this.nextCallback = nextCallback
  }

  stringify (object, callback, deadlineObject) {
    let deadline = deadlineObject || IMMEDIATE_DEADLINE
    let performStringification = (deadline) => {
      switch (Object.prototype.toString.apply(object)) {
        case '[object Array]':
        this.stringifyArray(object, callback, deadline)
        break
        case '[object Object]':
        this.stringifyObject(object, callback, deadline)
        break
        case '[object Number]':
        callback(object)
        break
        case '[object String]':
        callback(`"${object}"`)
        break
        case '[object Boolean]':
        callback(`${object}`)
        break
        case '[object Null]':
        callback('null')
        break
        case '[object Undefined]':
        callback(null)
        break
        default:
        throw new Error('Unsupported object.')
      }
    }

    if (deadline.timeRemaining() <= 0) {
      this.nextCallback(performStringification)
    } else {
      performStringification(deadline)
    }
  }

  stringifyObject (object, callback, deadline) {
    let keys = Object.keys(object)
    let processKey = (string, index) => {
      if (index === keys.length) {
        callback('{' + string.slice(1) + '}')
        return
      }

      let key = keys[index]
      this.stringify(object[key], (stringifiedValue) => {
        if (stringifiedValue == null) {
          processKey(string, index + 1)
        } else {
          processKey(string + `, "${key.toString()}": ${stringifiedValue}`, index + 1)
        }
      }, deadline)
    }

    processKey('', 0)
  }

  stringifyArray (array, callback, deadline) {
    let processValue = (string, index) => {
      if (index === array.length) {
        callback('[' + string.slice(0, -1) + ']')
        return
      }

      let value = array[index]
      this.stringify(value, (stringifiedValue) => {
        if (stringifiedValue == null) {
          processValue(string, index + 1)
        } else {
          processValue(string + `${stringifiedValue},`, index + 1)
        }
      }, deadline)
    }

    processValue('', 0)
  }
}
