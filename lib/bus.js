'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _types = require('./types');

var _helpers = require('./helpers');

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var slice = Array.prototype.slice;

var PENDING_STATE = 'pending';
exports.PENDING_STATE = PENDING_STATE;
var FULFILLED_STATE = 'resolved';
exports.FULFILLED_STATE = FULFILLED_STATE;
var REJECTED_STATE = 'rejected';
exports.REJECTED_STATE = REJECTED_STATE;
var CANCELED_STATE = 'canceled';
exports.CANCELED_STATE = CANCELED_STATE;
var CANCELED_ERROR = 'task canceled';

exports.CANCELED_ERROR = CANCELED_ERROR;

var Bus = (function () {
  function Bus() {
    _classCallCheck(this, Bus);

    this.listeners = [];
    //save status
    this.state = {};
    this.cancelHandlers = {};
    this.taskStateListeners = [];
    this.defaultContext = {};
    //TODO task control, cancel
  }

  //////////////////////////////
  //  utils
  //////////////////////////////

  _createClass(Bus, [{
    key: 'setDefaultContext',
    value: function setDefaultContext(args) {
      this.defaultContext = args;
    }
  }, {
    key: 'computeContext',
    value: function computeContext() {
      var _this = this;

      return _extends({}, this.defaultContext, {
        cancel: function cancel(taskName) {
          //TODO check is it cancelable
          _this.cancelHandlers[taskName](CANCELED_ERROR);
          _this.changeTaskState(taskName, CANCELED_STATE);
        },
        getTaskState: function getTaskState() {
          return (0, _objectAssign2['default'])({}, _this.state);
        }
      });
    }
  }, {
    key: 'wrapHandler',
    value: function wrapHandler(handler) {
      return regeneratorRuntime.mark(function callee$2$0() {
        var args$3$0 = arguments;
        return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              context$3$0.next = 2;
              return handler.apply(undefined, args$3$0);

            case 2:
            case 'end':
              return context$3$0.stop();
          }
        }, callee$2$0, this);
      });
    }
  }, {
    key: 'callHandler',
    value: function callHandler(handler) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // wrap handler in a generator
      // so handler can be named.
      return this.co.apply(this, [this.wrapHandler(handler)].concat(args));
    }

    // learned from co.js, thanks to tj.
  }, {
    key: 'co',
    value: function co(gen) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var ctx = this;
      var computedArgs = this.computeContext();

      return new Promise(function (resolve, reject) {
        var _gen;

        if (typeof gen === 'function') gen = (_gen = gen).call.apply(_gen, [ctx, computedArgs].concat(args));
        if (!gen || typeof gen.next !== 'function') return resolve(gen);

        onFulfilled();

        function onFulfilled(res) {
          var ret = undefined;
          try {
            ret = gen.next(res);
          } catch (e) {
            return reject(e);
          }
          next(ret);
        }

        function onRejected(err) {
          var ret = undefined;
          try {
            ret = gen['throw'](err);
          } catch (e) {
            return reject(e);
          }
          next(ret);
        }

        function next(ret) {
          var isValueNameYieldable = isNamedYieldable(ret.value);
          var yieldableName = isValueNameYieldable ? ret.value.name : null;
          var retValue = isValueNameYieldable ? ret.value.yieldable : ret.value;
          // condition 1:  done
          if (ret.done) {
            if (isValueNameYieldable) ctx.changeTaskState(yieldableName, FULFILLED_STATE);
            return resolve(retValue);
          }

          // condition 2: error
          var promise = toPromise.call(ctx, retValue, ctx.co, args);

          if (!promise || !isPromise(promise)) {
            return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, but the following object was passed: "' + String(ret.value) + '"'));
          }

          // condition 3: promise

          if (promise && isPromise(promise)) {

            if (isValueNameYieldable) {
              // condition 3.1 : with name
              ctx.changeTaskState(yieldableName, PENDING_STATE);
              return new Promise(function (resolve, reject) {
                //save the reject method as cancel
                ctx.cancelHandlers[yieldableName] = reject;

                var onFulfilledWithStateChange = (0, _helpers.decorate)(ctx.changeTaskState.bind(ctx, yieldableName, FULFILLED_STATE), onFulfilled);
                var onRejectedWithStateChange = (0, _helpers.decorate)(ctx.changeTaskState.bind(ctx, yieldableName, REJECTED_STATE), onRejected);

                return promise.then(ctx.toCancelable(yieldableName, onFulfilledWithStateChange)).then(ctx.toCancelable(yieldableName, resolve))['catch']((0, _helpers.decorate)(ctx.toCancelable(yieldableName, onRejectedWithStateChange), ctx.toCancelable(yieldableName, reject)));
              });
            } else {
              // condition 3.2 : without name
              return promise.then(onFulfilled, onRejected);
            }
          }
        }
      });
    }
  }, {
    key: 'toCancelable',
    value: function toCancelable(taskName, originCallback) {
      var _this2 = this;

      return function (res) {
        return _this2.state[taskName] !== CANCELED_STATE && originCallback(res);
      };
    }
  }, {
    key: 'changeTaskState',
    value: function changeTaskState(taskName, status) {
      var _this3 = this;

      this.state[taskName] = status;
      // TODO sync by default, async by option
      this.taskStateListeners.forEach(function (handler) {
        handler(_this3.state);
      });
    }
  }, {
    key: 'onStatusChange',
    value: function onStatusChange(listener) {
      this.taskStateListeners.push(listener);
    }
  }, {
    key: 'emit',
    value: function emit(event) {
      var _this4 = this;

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      this.listeners.forEach(function (listener) {
        if (typeof listener.listenTo === 'function') {
          if (listener.listenTo(event)) {
            _this4.callHandler.apply(_this4, [listener.handler].concat(args));
          }
        } else if (listener.listenTo === event) {
          _this4.callHandler.apply(_this4, [listener.handler].concat(args));
        }
      });
    }
  }, {
    key: 'listen',
    value: function listen(listener) {
      this.listeners.push(listener);
    }
  }]);

  return Bus;
})();

exports['default'] = Bus;
function toPromise(obj, promiseCall, args) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return promiseCall.call.apply(promiseCall, [this, obj].concat(_toConsumableArray(args)));
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
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);else results[key] = obj[key];
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
  return 'function' == typeof obj.next && 'function' == typeof obj['throw'];
}

function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

function isObject(val) {
  return Object == val.constructor;
}

function isNamedYieldable(ins) {
  return ins instanceof _types.NamedYieldable;
}