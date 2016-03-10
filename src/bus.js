import { NamedYieldable } from './types'
import { DEFAULT_GROUP_NAME } from './util'
import { decorate, result } from './helpers'
import assign from 'object-assign'
const slice = Array.prototype.slice

export const PENDING_STATE = 'pending'
export const FULFILLED_STATE = 'fulfilled'
export const REJECTED_STATE = 'rejected'
export const CANCELED_STATE = 'canceled'

export class CancelException extends Error {}
export class TaskNameConflict extends Error {}

export default class Bus {
  constructor() {
    this.listeners = []
    //save status
    this.state = {
      [DEFAULT_GROUP_NAME] : {}
    }
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
      cancel : (name)=>{
        //TODO check is it cancelable
        this.cancelHandlers[DEFAULT_GROUP_NAME][name](new CancelException(`${name} canceled.`))

        const nameContext = {
          name,
          group : DEFAULT_GROUP_NAME
        }

        this.changeTaskState(nameContext,CANCELED_STATE)
      },
      cancelGroupTask:(group, name)=>{
        this.cancelHandlers[group][name](new CancelException(`${name} canceled.`))
        const nameContext = { name,group }
        this.changeTaskState(nameContext,CANCELED_STATE)
      },
      getTaskState: (name)=>{
        return this.state[DEFAULT_GROUP_NAME][name]
      },
      getGroupTaskState:(group, name)=>{
        return this.state[group][name]
      },
      getTask:()=>{
        return this.state[DEFAULT_GROUP_NAME]
      },
      getTaskGroup:(group)=>{
        const groups = assign({}, this.state)
        delete groups[DEFAULT_GROUP_NAME]
        return group ? groups[group] : groups
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
          yieldable : handler.yieldable( computedArgs, ...args),
          group : handler.group
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
    return this.co(null, this.wrapHandler(handler), args)
  }
  // learned from co.js, thanks to tj.
  co(genNameContext, gen, args ) {

    return new Promise( (resolve, reject) => {

      if (typeof gen === 'function') gen = gen.call(null, ...args)
      if (!gen || typeof gen.next !== 'function') return resolve(gen)

      const onFulfilled = (res)=>{
        let ret
        try {
          ret = gen.next(res)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }

      const  onRejected = (err)=> {
        let ret
        try {
          ret = gen.throw(err)
        } catch (e) {
          return reject(e)
        }
        next(ret)
      }

      const next = (ret) => {
        const isValueNameYieldable = isNamedYieldable(ret.value)
        const nameContext = {
          name: isValueNameYieldable ? result(ret.value.name) : null,
          group: isValueNameYieldable ? ret.value.group : null
        }
        const retValue = isValueNameYieldable ? ret.value.yieldable : ret.value

        // condition 1:  done
        if (ret.done) {
          if( isValueNameYieldable ) this.changeTaskState(nameContext, FULFILLED_STATE)
          return resolve(retValue)
        }

        // condition 2: promise
        if( isValueNameYieldable ) this.checkPendingConflict(nameContext)

        const promiseHandler =  isValueNameYieldable ? this.co.bind(this, nameContext) : this.co.bind(this, null)
        const promise = toPromise.call(this, retValue, promiseHandler, args)

        // condition 2.1: promise error
        if( !promise || !isPromise(promise)) {
          return onRejected(new TypeError(
            `You may only yield a function, promise, generator, array, or object, but the following object was passed: "${String(ret.value)}"`
          ))
        }

        // condition 2.2: promise
        if( isValueNameYieldable ) this.changeTaskState(nameContext, PENDING_STATE)
        let finalPromise = isValueNameYieldable ? this.toCancelablePromise(promise, nameContext) : promise
        return finalPromise.then(
          genNameContext ? this.toCancelable(genNameContext,onFulfilled) : onFulfilled,
          genNameContext ? this.toCancelable(genNameContext,onRejected) : onRejected)
      }

      // start
      onFulfilled()
    })
  }
  checkPendingConflict( nameContext ) {
    if( (this.state[nameContext.group] !== undefined) && (this.state[nameContext.group][nameContext] === PENDING_STATE ) ) {
      const message = nameContext.group === DEFAULT_GROUP_NAME ?
          `task ${nameContext.name} is already running, if your task can be parallel, use 'nameGroup' to name your task`:
          `task ${nameContext.name} of group ${nameContext.group} is already running.`

      throw new TaskNameConflict(message)
    }
  }
  toCancelablePromise( promise, nameContext ) {
    // TODO move changeTaskState out
    return new Promise((wrappedResolve, wrappedReject)=> {
      //save the reject method as cancel
      if( this.cancelHandlers[nameContext.group] === undefined ) this.cancelHandlers[nameContext.group] = {}
      this.cancelHandlers[nameContext.group][nameContext.name] = wrappedReject

      promise
        .then(this.toCancelable(nameContext,decorate(
          this.changeTaskState.bind(this, nameContext, FULFILLED_STATE),
          wrappedResolve
        )))
        .catch(this.toCancelable(nameContext,decorate(
          this.changeTaskState.bind(this, nameContext, REJECTED_STATE),
          wrappedReject
        )))
    })
  }
  toCancelable( nameContext, originCallback) {
    return (res)=>{

      if((this.state[nameContext.group] !== undefined) && (this.state[nameContext.group][nameContext.name] === CANCELED_STATE)) {
        return false
      }else {
        return originCallback(res)
      }
    }
  }
  changeTaskState(nameContext, state) {
    if( this.state[nameContext.group] === undefined ) {
      this.state[nameContext.group] = {}
    }
    this.state[nameContext.group][nameContext.name] = state
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
  if (isGeneratorFunction(obj) || isGenerator(obj)) return promiseCall( obj, args)
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
