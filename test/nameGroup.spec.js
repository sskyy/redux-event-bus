import expect from 'expect'
import { nameGroup, listen } from '../src/index'
import { PENDING_STATE, FULFILLED_STATE } from '../src/bus'
import Bus from '../src/bus'
import { NamedYieldable } from '../src/types'

describe('name', () => {
  let bus
  let groupState = {}
  const groupName = 'delay'
  const taskName = 'delay100'
  const eventName = 'some cool event'
  const waitTime = 100
  const checkTime = 50

  function delay(duration) {
    return new Promise(resolve=>setTimeout(()=>resolve(), duration))
  }


  function firstKey(obj) {
    return Object.keys(obj)[0]
  }

  beforeEach(()=>{
    bus = new Bus
    groupState  = {}
    bus.onStateChange((newState)=>{
      groupState = newState
    })
  })

  it('named yieldable should have right type', () => {
    const namedGroup = nameGroup({}, 'test')
    const namedGroupInst = nameGroup({}, 'test')
    expect(namedGroup instanceof  NamedYieldable).toBe(true)
    expect(namedGroupInst instanceof  NamedYieldable).toBe(true)
  })

  it('yield named group', (done) => {

    bus.listen(listen(eventName, function* () {
      yield nameGroup(delay(waitTime), groupName)
    }))

    expect(Object.keys(groupState).length).toBe(0)

    const promise = bus.emit(eventName)

    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        const taskName = firstKey(groupState[groupName])
        expect( groupState[groupName][taskName] ).toBe(PENDING_STATE)
      }),
      promise.then(() => {
        const taskName = firstKey(groupState[groupName])
        expect(groupState[groupName][taskName]).toBe(FULFILLED_STATE)
      })
    ]).then(() => done()).catch(done)

  })

  it('yield named group with instance name', (done) => {

    bus.listen(listen(eventName, function* () {
      yield nameGroup(delay(waitTime), groupName, taskName)
    }))

    expect(Object.keys(groupState).length).toBe(0)

    const promise = bus.emit(eventName)

    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect( groupState[groupName][taskName] ).toBe(PENDING_STATE)
      }),
      promise.then(() => {
        expect(groupState[groupName][taskName]).toBe(FULFILLED_STATE)
      })
    ]).then(() => done()).catch(done)

  })

})
