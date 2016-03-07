'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.listen = listen;
exports.name = name;
exports.fromReduxAction = fromReduxAction;

var _types = require('./types');

function listen(eventName, handler) {
  return new _types.Listener({
    listenTo: eventName,
    handler: handler
  });
}

function name(yieldable, name) {
  return new _types.NamedYieldable({
    yieldable: yieldable,
    name: name
  });
}

function fromReduxAction(ReduxActionType) {
  return function (action) {
    return action.type === ReduxActionType;
  };
}