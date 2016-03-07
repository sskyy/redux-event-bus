"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.forEach = forEach;
exports.compose = compose;
exports.mapValues = mapValues;
exports.intersection = intersection;
exports.zip = zip;
exports.decorate = decorate;
exports.shallowEqual = shallowEqual;
exports.flat = flat;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function forEach(obj, fn) {
  return Object.keys(obj).forEach(function (key) {
    return fn(obj[key], key);
  });
}

function compose(fnA, fnB) {
  return function () {
    fnA && fnA.apply(undefined, arguments);
    fnB && fnB.apply(undefined, arguments);
  };
}

function mapValues(obj, handler) {
  var result = {};
  Object.keys(obj).forEach(function (key) {
    result[key] = handler(obj[key], key);
  });
  return result;
}

function intersection() {
  for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
    arrays[_key] = arguments[_key];
  }

  var result = [];
  arrays[0].forEach(function (item) {
    if (arrays[1].indexOf(item) !== -1) {
      result.push(item);
    }
  });
  if (arrays.length > 2) {
    result = intersection.apply(undefined, [result].concat(_toConsumableArray(arrays.slice(2))));
  }
  return result;
}

function zip(keys, values) {
  var result = {};
  keys.forEach(function (key, index) {
    result[key] = values[index];
  });
  return result;
}

function decorate(fnA, fnB) {
  return function () {
    for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      arg[_key2] = arguments[_key2];
    }

    fnA.call.apply(fnA, [this].concat(arg));
    return fnB.call.apply(fnB, [this].concat(arg));
  };
}

function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  var hasOwn = Object.prototype.hasOwnProperty;
  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}

function flat(arr) {
  return arr.reduce(function (a, b) {
    return a.concat(b);
  }, []);
}