import assign from 'object-assign'
import Bus from './bus'
import {listen, name, monitor, fromReduxAction } from './util'
//import * as util from './util'

export const ActionTypes = {
  PERFORM_ACTION: 'BUS_PERFORM_ACTION',
  CHANGE_STATUS: 'BUS_CHANGE_STATUS',
  REDUX_INIT : '@@redux/INIT'
};

function  performAction(action) {
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      );
    }
    return { type: ActionTypes.PERFORM_ACTION, action, timestamp: Date.now() };
  }

function liftAction(action) {
  return performAction(action);
}


function liftReducerWithBus(reducer, initialCommittedState) {
  const initialLiftedState = {
    status: {},
    computedState : initialCommittedState
  };
  return (liftedState = initialLiftedState, liftedAction) => {
    let {status,computedState} = liftedState
    switch (liftedAction.type){
      case ActionTypes.CHANGE_STATUS :
        status = liftedAction.payload
        break
      case  ActionTypes.REDUX_INIT:
        computedState = reducer(computedState,{type:ActionTypes.REDUX_INIT})
        break
    }

    return {
      status,
      computedState : liftedAction.action?reducer(computedState,liftedAction.action):computedState
    }
  }
}

function unliftState(liftedState) {
  return liftedState.computedState
}

function unliftStore(liftedStore, liftReducer, bus) {
  return {
    ...liftedStore,

    liftedStore,

    dispatch(action) {
      console.log( 'dispatching',action)
      liftedStore.dispatch(liftAction(action));
      bus.emit(action)
      return action;
    },

    getState() {
      return  unliftState(liftedStore.getState());
    },

    replaceReducer(nextReducer) {
      liftedStore.replaceReducer(liftReducer(nextReducer));
    }
  };
}

//TODO 改成 enhancer 因为要把 bus 存到 store 上去
// 要不然 react 中没法获取
function createEnhancer( listeners ){

  return createStore=>(reducer, initialState, enhancer)=>{
    const bus = new Bus
    function liftReducer(r){
      return liftReducerWithBus(r, initialState, bus)
    }
    //once we createStore, it will use internal dispatch init action
    const liftedStore = createStore(liftReducer(reducer),  enhancer)
    window.store = liftedStore

    const store = unliftStore(liftedStore,liftReducer, bus)

    listeners.forEach(listener=> {
      listener.handler = listener.handler.bind(bus, {
        dispatch: store.dispatch,
        getState: store.getState
      })
      bus.listen(listener)
    })

    bus.onStatusChange(status=>liftedStore.dispatch({type:ActionTypes.CHANGE_STATUS, payload:status}))

    return store

  }
}


export {
  listen, name, monitor, fromReduxAction,
  createEnhancer
}

//TODO bug
// state 改变不正确
// yield 出来获取不到 response

// TODO
// monitor 获取说句

//TODO
// 调试工具结合