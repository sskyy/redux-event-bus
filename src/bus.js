import { NamedYieldable } from './types'
import { decorate } from './helpers'
import assign from 'object-assign'
const slice = Array.prototype.slice

export const PENDING_STATE = 'pending'
export const FULFILLED_STATE = 'resolved'
export const REJECTED_STATE = 'rejected'
export const CANCELED_STATE = 'canceled'

export class CancelException extends Error {}

export default class Bus {
  constructor() {
    this.listeners = []
    //save status
    this.state = {}
    this.cancelHandlers = {}
    this.taskStateListeners = []
    this.defaultContext = {}
    //TODO task control, cancel
  }
  setDefaultContext( args ) {
    this.defaultContext = args
  }
  computeContext() {
    return {
      ...this.defaultContext,
      cancel : (taskName)=>{
        //TODO check is it cancelable
        this.cancelHandlers[taskName](new CancelException(`${taskName} canceled.`))
        this.changeTaskState(taskName,CANCELED_STATE)
      },
      getTaskState : ()=>{
        return assign({}, this.state)
      }
    }
  }
  wrapHandler( handler ) {
    const computedArgs = this.computeContext()

    return function*(...args) {
      // the listener can only be a generator or a named generator
      if( isNamedYieldable(handler) ) {
        // bind default args
        const toYield = new NamedYieldable({
          name : handler.name,
          yieldable : handler.yieldable( computedArgs, ...args)
        })

        yield toYield
      } else {
        yield handler( computedArgs, ...args)
      }
    }
  }
  callHandler(handler, ...args) {
    // wrap handler in a generator
    // so handler can be named.
    return this.co(this.wrapHandler(handler), ...args)
  }
  // learned from co.js, thanks to tj.
  co(gen, ...args) {
    const ctx = this

    return new Promise(function (resolve, reject) {

      if (typeof gen === 'function') gen = gen.call(null, ...args)
      if (!gen || typeof gen.next !== 'function') return resolve(gen)

      onFulfilled()

      function onFulfilled(res) {
        let ret
        try {
          ret = gen.next(res)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }


      function onRejected(err) {
        let ret
        try {
          ret = gen.throw(err)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }

      function next(ret) {
        const isValueNameYieldable = isNamedYieldable(ret.value)
        const yieldableName = isValueNameYieldable ? ret.value.name : null
        const retValue = isValueNameYieldable ? ret.value.yieldable : ret.value
        // condition 1:  done
        if (ret.done) {
          if( isValueNameYieldable ) ctx.changeTaskState(yieldableName, FULFILLED_STATE)
          return resolve(retValue)
        }

        // condition 2: error
        const promise = toPromise.call(ctx, retValue, ctx.co, args)

        if( !promise || !isPromise(promise)) {
          return onRejected(new TypeError(
            `You may only yield a function, promise, generator, array, or object, but the following object was passed: "${String(ret.value)}"`
          ))
        }

        // condition 3: promise
        ctx.changeTaskState(yieldableName, PENDING_STATE)
        let finalPromise
        if( !isValueNameYieldable ) {
          // condition 3.1 : without name
          finalPromise = promise
        }else {
          // condition 3.2 : with name
          // wrap the namedPromise to a new Promise
          finalPromise =  new Promise((wrappedResolve, wrappedReject)=> {
            //save the reject method as cancel
            ctx.cancelHandlers[yieldableName] = wrappedReject

            promise
              .then(ctx.toCancelable(yieldableName,decorate(
                ctx.changeTaskState.bind(ctx, yieldableName, FULFILLED_STATE),
                wrappedResolve
              )))
              .catch(ctx.toCancelable(yieldableName,decorate(
                ctx.changeTaskState.bind(ctx, yieldableName, REJECTED_STATE),
                wrappedReject
              )))
          })
        }

        return finalPromise.then(onFulfilled,onRejected)
      }
    })
  }
  toCancelable( taskName, originCallback) {
    return (res)=>{
      return (this.state[taskName] !== CANCELED_STATE) && originCallback(res)
    }
  }
  changeTaskState(taskName, status) {
    this.state[taskName] = status
    // TODO sync by default, async by option
    this.taskStateListeners.forEach(handler=>{
      handler(this.state)
    })
  }
  onStateChange(listener) {
    this.taskStateListeners.push(listener)
  }
  emit(event, ...args) {
    return Promise.all(this.listeners.map(listener=> {
      const matched = (typeof listener.listenTo === 'function') ? listener.listenTo(event) : (listener.listenTo === event)
      if(matched) {
        return this.callHandler(listener.handler, ...args)
      } else {
        return Promise.resolve(true)
      }
    }))
  }
  listen(listener) {
    this.listeners.push(listener)
  }
}

//////////////////////////////
//  utils
//////////////////////////////

function toPromise(obj, promiseCall, args) {
  if (! obj) return obj
  if (isPromise(obj)) return obj
  if (isGeneratorFunction(obj) || isGenerator(obj)) return promiseCall.call(this, obj, ...args)
  if ('function' == typeof obj) return thunkToPromise.call(this, obj)
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj)
  if (isObject(obj)) return objectToPromise.call(this, obj)
  return obj
}

function thunkToPromise(fn) {
  var ctx = this
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err)
      if (arguments.length > 2) res = slice.call(arguments, 1)
      resolve(res)
    })
  })
}


function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this))
}


function objectToPromise(obj) {
  var results = new obj.constructor()
  var keys = Object.keys(obj)
  var promises = []
  for (var i = 0; i < keys.length; i ++) {
    var key = keys[i]
    var promise = toPromise.call(this, obj[key])
    if (promise && isPromise(promise)) defer(promise, key)
    else results[key] = obj[key]
  }
  return Promise.all(promises).then(function () {
    return results
  })

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined
    promises.push(promise.then(function (res) {
      results[key] = res
    }))
  }
}

function isPromise(obj) {
  return 'function' == typeof obj.then
}


function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw
}


function isGeneratorFunction(obj) {
  var constructor = obj.constructor
  if (! constructor) return false
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true
  return isGenerator(constructor.prototype)
}


function isObject(val) {
  return Object == val.constructor
}

function isNamedYieldable(ins) {
  return ins instanceof  NamedYieldable
}
