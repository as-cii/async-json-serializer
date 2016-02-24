const IMMEDIATE_DEADLINE = {timeRemaining: () => 0}

export default class AsyncJsonSerializer {
  constructor (nextCallback) {
    this.nextCallback = nextCallback
  }

  stringify (object, deadline = IMMEDIATE_DEADLINE) {
    let performStringification = (deadline) => {
      switch (Object.prototype.toString.apply(object)) {
        case '[object Array]':
          return this.stringifyArray(object, deadline)
        case '[object Object]':
          return this.stringifyObject(object, deadline)
        case '[object Number]':
          return Promise.resolve(object)
        case '[object String]':
          return Promise.resolve(`"${object}"`)
        case '[object Null]':
          return Promise.resolve('null')
        case '[object Undefined]':
          return Promise.resolve(null)
      }
    }

    if (deadline.timeRemaining() <= 0) {
      return this.nextCallback().then(performStringification)
    } else {
      return performStringification(deadline)
    }
  }

  stringifyObject (object, deadline) {
    let keys = Object.keys(object)
    let processKey = (string, index) => {
      if (index === keys.length) {
        return Promise.resolve('{' + string.slice(1) + '}')
      }

      let key = keys[index]
      return this.stringify(object[key], deadline).then((stringifiedValue) => {
        if (stringifiedValue == null) {
          return processKey(string, index + 1)
        } else {
          return processKey(string + `, "${key.toString()}": ${stringifiedValue}`, index + 1)
        }
      })
    }

    return processKey('', 0)
  }

  stringifyArray (array, deadline) {
    let processValue = (string, index) => {
      if (index === array.length) {
        return Promise.resolve('[' + string.slice(0, -1) + ']')
      }

      let value = array[index]
      return this.stringify(value, deadline).then((stringifiedValue) => {
        if (stringifiedValue == null) {
          return processValue(string, index + 1)
        } else {
          return processValue(string + `${stringifiedValue},`, index + 1)
        }
      })
    }

    return processValue('', 0)
  }
}
