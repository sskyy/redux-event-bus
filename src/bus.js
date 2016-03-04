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
    const genFn = function* wrap() {
      yield handler
    }
    return this.co(genFn, ...args)
  }
  co(genFn, ...args) {
    const ctx = this;

    return new Promise(function (resolve, reject) {
      const gen = genFn.apply(ctx, args);

      onFulfilled();

      function onFulfilled(res) {
        var ret;
        try {
          ret = gen.next(res);
        } catch (e) {
          return reject(e);
        }
        next(ret);
        return null;
      }

      function onRejected(err) {
        var ret;
        try {
          ret = gen.throw(err);
        } catch (e) {
          return reject(e);
        }
        next(ret);
      }

      function next(ret) {

        if (ret.done) return resolve(ret.value);

        const isNamedYieldableValue = isNamedYieldable(ret.value)
        const yieldableName = ret.value.name

        var value = toPromise.call(ctx, isNamedYieldableValue? ret.value.yieldable : ret.value, ctx.co);
        debugger
        if ( !value || !isPromise(value)){
          return onRejected(new TypeError(`You may only yield a function, promise, generator, array, or object, but the following object was passed: ${String(ret.value)}`));
        }

        if( isNamedYieldableValue ) ctx.changeStatus(yieldableName, 'pending')

        return value.then(
          decorate(ctx.changeStatus.bind(ctx,yieldableName,'resolved'),onFulfilled),
          decorate(ctx.changeStatus.bind(ctx,yieldableName,'rejected'),onRejected)
        );
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