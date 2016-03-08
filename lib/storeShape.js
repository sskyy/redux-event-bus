'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _react = require('react');

exports['default'] = _react.PropTypes.shape({
  subscribe: _react.PropTypes.func.isRequired,
  dispatch: _react.PropTypes.func.isRequired,
  getState: _react.PropTypes.func.isRequired
});
module.exports = exports['default'];