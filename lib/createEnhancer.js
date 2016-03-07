'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports['default'] = createEnhancer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _helpers = require('./helpers');

var _bus = require('./bus');

var _bus2 = _interopRequireDefault(_bus);

var ActionTypes = {
    PERFORM_ACTION: 'BUS_PERFORM_ACTION',
    CHANGE_STATUS: 'BUS_CHANGE_STATUS',
    REDUX_INIT: '@@redux/INIT'
};

exports.ActionTypes = ActionTypes;
function performAction(action) {
    if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }
    return { type: ActionTypes.PERFORM_ACTION, action: action, timestamp: Date.now() };
}

function liftAction(action) {
    return performAction(action);
}

function liftReducerWithBus(reducer, initialCommittedState) {
    var initialLiftedState = {
        status: {},
        computedState: initialCommittedState
    };
    return function (liftedState, liftedAction) {
        if (liftedState === undefined) liftedState = initialLiftedState;
        var status = liftedState.status;
        var computedState = liftedState.computedState;

        switch (liftedAction.type) {
            case ActionTypes.CHANGE_STATUS:
                status = liftedAction.payload;
                break;
            case ActionTypes.REDUX_INIT:
                computedState = reducer(computedState, { type: ActionTypes.REDUX_INIT });
                break;
        }

        return {
            status: status,
            computedState: liftedAction.action ? reducer(computedState, liftedAction.action) : computedState
        };
    };
}

function unliftState(liftedState) {
    return liftedState.computedState;
}

function unliftStore(liftedStore, liftReducer, bus) {
    return _extends({}, liftedStore, {

        liftedStore: liftedStore,

        dispatch: function dispatch(action) {
            console.log('dispatching', action);
            liftedStore.dispatch(liftAction(action));
            bus.emit(action);
            return action;
        },

        getState: function getState() {
            return unliftState(liftedStore.getState());
        },

        replaceReducer: function replaceReducer(nextReducer) {
            liftedStore.replaceReducer(liftReducer(nextReducer));
        }
    });
}

function createEnhancer(listeners) {

    return function (createStore) {
        return function (reducer, initialState, enhancer) {
            var bus = new _bus2['default']();

            function liftReducer(r, bus) {
                return liftReducerWithBus(r, initialState, bus);
            }
            //once we createStore, it will use internal dispatch init action
            var liftedStore = createStore(liftReducer(reducer, bus), enhancer);
            var store = unliftStore(liftedStore, liftReducer, bus);
            bus.setDefaultContext({
                dispatch: store.dispatch,
                getState: store.getState
            });

            liftedStore.bus = bus;

            //flat listeners
            //so we can create multiple listeners which shares a closure
            console.log(listeners);
            (0, _helpers.flat)(listeners).forEach(function (listener) {
                bus.listen(listener);
            });

            bus.onStatusChange(function (status) {
                return liftedStore.dispatch({ type: ActionTypes.CHANGE_STATUS, payload: status });
            });

            return store;
        };
    };
}