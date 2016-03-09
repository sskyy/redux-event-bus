import expect from 'expect'
import { name, listen } from '../src/index'
import { PENDING_STATE, FULFILLED_STATE, REJECTED_STATE } from '../src/bus'
import Bus from '../src/bus'
import { NamedYieldable } from '../src/types'


describe('name', () => {
  let bus
  let taskState = {}
  const taskName = 'delay100'
  const eventName = 'some cool event'
  const waitTime = 100
  const checkTime = 50
  const internalError = 'internalError'

  function delay(duration) {
    return new Promise(resolve=>setTimeout(()=>resolve(), duration))
  }

  beforeEach(()=>{
    bus = new Bus
    taskState = {}
    bus.onStateChange(newState=>{
      taskState = newState
    })
  })

  it('named yieldable should have right type', () => {
    const namedObject = name({})
    expect(namedObject instanceof  NamedYieldable).toBe(true)
  })

  it('yield named promise', (done) => {

    bus.listen(listen(eventName, function* () {
      yield name(delay(waitTime), taskName)
    }))

    expect(taskState[taskName]).toBe(undefined)

    const promise = bus.emit(eventName)

    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => expect(taskState[taskName]).toBe(PENDING_STATE)),
      promise.then(() => expect(taskState[taskName]).toBe(FULFILLED_STATE))
    ]).then(() => done()).catch(done)

  })

  it('yield a generator', (done)=>{

    function* waitGenerator(waitTime) {
      yield delay(waitTime)
    }

    bus.listen(listen(eventName, function* () {
      yield name(waitGenerator(waitTime), taskName)
    }))

    expect(taskState[taskName]).toBe(undefined)

    const promise = bus.emit(eventName)

    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => expect(taskState[taskName]).toBe(PENDING_STATE)),
      promise.then(() => expect(taskState[taskName]).toBe(FULFILLED_STATE))
    ]).then(() => done()).catch(done)

  })

  it('name listener', (done)=>{

    function* waitGenerator(waitTime) {
      yield delay(waitTime)
    }

    bus.listen(listen(eventName, name(function* () {
      yield waitGenerator(waitTime)
    }, taskName)))

    expect(taskState[taskName]).toBe(undefined)

    const promise = bus.emit(eventName)

    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => expect(taskState[taskName]).toBe(PENDING_STATE)),
      promise.then(() => expect(taskState[taskName]).toBe(FULFILLED_STATE))
    ]).then(() => done()).catch(done)

  })

  it('named task reject', (done)=>{
    function* waitGenerator(waitTime) {
      yield delay(waitTime)
    }

    bus.listen(listen(eventName, name(function* () {
      yield waitGenerator(waitTime)
      throw new Error(internalError)
    }, taskName)))

    expect(taskState[taskName]).toBe(undefined)

    const promise = bus.emit(eventName)

    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => expect(taskState[taskName]).toBe(PENDING_STATE)),
      promise.then(done)
    ]).then(done).catch( e =>{
      expect(taskState[taskName]).toBe(REJECTED_STATE)
      expect(e.message).toBe(internalError)
      done()
    })
  })

})
