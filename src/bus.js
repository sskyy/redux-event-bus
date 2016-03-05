import {NamedYieldable, Listener} from './types'
import {decorate} from './helpers'
const slice = Array.prototype.slice;



export default class Bus {
  constructor() {
    this.listeners = []
    //save status
    this.status = {}
    this.statusListeners = []
    //TODO task control
  }
  callHandler(handler, ...args){
    // wrap handler in a generator
    // so handler can be named.
    return this.co(function*(){
      yield handler(...args)
    })

  }
  co(gen, ...args) {
    var ctx = this;
    var args = slice.call(arguments, 1)

    return new Promise(function(resolve, reject) {
      if (typeof gen === 'function') gen = gen.apply(ctx, args);
      if (!gen || typeof gen.next !== 'function') return resolve(gen);

      onFulfilled();

      function onFulfilled(res) {
        let ret;
        try {
          ret = gen.next(res);
        } catch (e) {
          return reject(e);
        }
        next(ret);
      }


      function onRejected(err) {
        let ret;
        try {
          ret = gen.throw(err);
        } catch (e) {
          return reject(e);
        }
        next(ret);
      }

      function next(ret) {
        const isValueNameYieldable = isNamedYieldable(ret.value)
        const yieldableName = isValueNameYieldable ? ret.value.name : null
        const retValue = isValueNameYieldable ? ret.value.yieldable : ret.value
        if (ret.done) return resolve(retValue);

        ctx.changeStatus(yieldableName, 'pending')
        const value = toPromise.call(ctx, retValue, ctx.co);
        if (value && isPromise(value)){
          return value.then(
              isValueNameYieldable ?
                  decorate(ctx.changeStatus.bind(ctx,yieldableName, 'resolved'), onFulfilled):
                  onFulfilled,
              isValueNameYieldable ?
                  decorate(ctx.changeStatus.bind(ctx,yieldableName, 'rejected'), onRejected):
              onRejected
          );
        }

        return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
            + 'but the following object was passed: "' + String(ret.value) + '"'));
      }
    });
  }
  changeStatus(statusName, status){
    this.status[statusName] = status
    this.statusListeners.forEach(handler=>{
      handler(this.status)
    })
  }
  onStatusChange(listener){
    this.statusListeners.push(listener)
  }
  emit(event, ...args) {
    this.listeners.forEach(listener=> {
      if (typeof listener.listenTo === 'function') {
        if (listener.listenTo(event)) {
          this.callHandler(listener.handler, ...args)
        }
      } else if (listener.listenTo === event) {
        this.callHandler(listener.handler, ...args)
      }
    })
  }
  listen(listener) {
    this.listeners.push(listener)
  }
}



//////////////////////////////
//  utils
//////////////////////////////

function toPromise(obj, promiseCall) {
  if (! obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return promiseCall.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}


function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}


function objectToPromise(obj) {
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i ++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

function isPromise(obj) {
  return 'function' == typeof obj.then;
}


function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}


function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (! constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}


function isObject(val) {
  return Object == val.constructor;
}

function isNamedYieldable(ins){
  return ins instanceof  NamedYieldable
}

