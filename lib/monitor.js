'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = monitor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _helpers = require('./helpers');

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _storeShape = require('./storeShape');

var _storeShape2 = _interopRequireDefault(_storeShape);

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function monitor(mapStateToProps) {
  return function (WrappedComponent) {
    var MonitorComponent = (function (_Component) {
      _inherits(MonitorComponent, _Component);

      _createClass(MonitorComponent, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate() {
          return this.haveOwnPropsChanged || this.hasStatusChanged;
        }
      }]);

      function MonitorComponent(props, context) {
        _classCallCheck(this, MonitorComponent);

        _get(Object.getPrototypeOf(MonitorComponent.prototype), 'constructor', this).call(this, props, context);
        if (context.store.liftedStore === undefined) {
          throw new Error('Did you forget to use enhancer to create store?');
        }
        this.bus = context.store.liftedStore.bus;
        this.state = { taskState: mapStateToProps(this.bus.state) };
      }

      _createClass(MonitorComponent, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          this.unsubscrib = this.bus.onStatusChange(this.handleStatusChange.bind(this));
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          this.unsubscrib();
        }
      }, {
        key: 'handleStatusChange',
        value: function handleStatusChange(status) {
          var newMappedStatus = mapStateToProps(status);
          if (!(0, _helpers.shallowEqual)(newMappedStatus, this.state.taskState)) {
            this.hasStatusChanged = true;
            this.setState({ taskState: newMappedStatus });
          }
        }
      }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {
          this.haveOwnPropsChanged = true;
        }
      }, {
        key: 'render',
        value: function render() {
          this.haveOwnPropsChanged = false;
          this.hasStatusChanged = false;
          return (0, _react.createElement)(WrappedComponent, _extends({}, this.state.taskState, this.props));
        }
      }]);

      return MonitorComponent;
    })(_react.Component);

    MonitorComponent.displayName = 'Monitor(' + getDisplayName(WrappedComponent) + ')';
    MonitorComponent.WrappedComponent = WrappedComponent;
    MonitorComponent.contextTypes = {
      store: _storeShape2['default']
    };
    MonitorComponent.propTypes = {
      store: _storeShape2['default']
    };

    return (0, _hoistNonReactStatics2['default'])(MonitorComponent, WrappedComponent);
  };
}

module.exports = exports['default'];