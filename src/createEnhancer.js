import { flat } from './helpers'
import Bus from './bus'

export const ActionTypes = {
  PERFORM_ACTION: 'BUS_PERFORM_ACTION',
  CHANGE_STATUS: 'BUS_CHANGE_STATUS',
  REDUX_INIT: '@@redux/INIT'
}


function performAction(action) {
  if (typeof action.type === 'undefined') {
    throw new Error(
      'Actions may not have an undefined "type" property. ' +
      'Have you misspelled a constant?'
    )
  }
  return { type: ActionTypes.PERFORM_ACTION, action, timestamp: Date.now() }
}

function liftAction(action) {
  return performAction(action)
}


function liftReducerWithBus(reducer, initialCommittedState) {
  const initialLiftedState = {
    status: {},
    computedState: initialCommittedState
  }
  return (liftedState = initialLiftedState, liftedAction) => {
    let { status,computedState } = liftedState
    switch (liftedAction.type) {
      case ActionTypes.CHANGE_STATUS :
        status = liftedAction.payload
        break
      case  ActionTypes.REDUX_INIT:
        computedState = reducer(computedState, { type: ActionTypes.REDUX_INIT })
        break
    }

    return {
      status,
      computedState: liftedAction.action ? reducer(computedState, liftedAction.action) : computedState
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
      liftedStore.dispatch(liftAction(action))
      bus.emit(action)
      return action
    },

    getState() {
      return unliftState(liftedStore.getState())
    },

    replaceReducer(nextReducer) {
      liftedStore.replaceReducer(liftReducer(nextReducer))
    }
  }
}


export default function createEnhancer(listeners) {

  return createStore=>(reducer, initialState, enhancer)=> {
    const bus = new Bus

    function liftReducer(r, bus) {
      return liftReducerWithBus(r, initialState, bus)
    }

    //once we createStore, it will use internal dispatch init action
    const liftedStore = createStore(liftReducer(reducer, bus), enhancer)
    const store = unliftStore(liftedStore, liftReducer, bus)
    bus.setDefaultContext({
      dispatch: store.dispatch,
      getState: store.getState
    })

    liftedStore.bus = bus

    //flat listeners
    //so we can create multiple listeners which shares a closure
    flat(listeners).forEach(listener=> {
      bus.listen(listener)
    })

    bus.onStateChange(status=>liftedStore.dispatch({ type: ActionTypes.CHANGE_STATUS, payload: status }))

    return store

  }
}

