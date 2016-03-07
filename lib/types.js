'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var Type = function Type(data) {
  _classCallCheck(this, Type);

  (0, _objectAssign2['default'])(this, data);
};

exports.Type = Type;

var NamedYieldable = (function (_Type) {
  _inherits(NamedYieldable, _Type);

  function NamedYieldable() {
    _classCallCheck(this, NamedYieldable);

    _get(Object.getPrototypeOf(NamedYieldable.prototype), 'constructor', this).apply(this, arguments);
  }

  return NamedYieldable;
})(Type);

exports.NamedYieldable = NamedYieldable;

var Listener = (function (_Type2) {
  _inherits(Listener, _Type2);

  function Listener() {
    _classCallCheck(this, Listener);

    _get(Object.getPrototypeOf(Listener.prototype), 'constructor', this).apply(this, arguments);
  }

  return Listener;
})(Type);

exports.Listener = Listener;