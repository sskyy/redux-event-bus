
import { NamedYieldable, Listener } from './types'


export function listen( eventName, handler ) {
  return new Listener({
    listenTo : eventName,
    handler
  })
}

export function fromReduxAction( ReduxActionType ) {
  return function (action) {
    return action.type === ReduxActionType
  }
}

export const DEFAULT_GROUP_NAME = '__default__'

export function name(yieldable, name) {
  return new NamedYieldable({
    yieldable,
    name,
    group : DEFAULT_GROUP_NAME
  })
}

export const nameGroup = function () {
  const memory = {}
  return function (yieldable, group, inst) {
    if( inst !== undefined && typeof inst !== 'string' ) {
      throw new Error(`task name can only be string, get ${inst} instead.`)
    }

    let name

    if( memory[ group ] === undefined ) {
      memory[ group ] = 0
    }

    if( typeof inst !== 'string'  ) {
      name = ()=>{
        memory[ group ]++
        return `${group}-${String(memory[ group ])}`
      }
    }else {
      name = inst
    }


    return new NamedYieldable({
      yieldable,
      name,
      group
    })
  }
}()

