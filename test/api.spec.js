import expect from 'expect'
import { name, nameGroup, listen } from '../src/index'
import { PENDING_STATE } from '../src/bus'
import { DEFAULT_GROUP_NAME } from '../src/util'
import Bus from '../src/bus'


describe('getTaskState', () => {
  let bus
  let taskState = {}
  const groupName = 'delay'
  const taskName = 'delay100'
  const eventName = 'some cool event'
  const waitTime = 100
  const checkTime = 50

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


  it('getTaskState', (done) => {

    const cancelEvent = 'cancelEvent'

    bus.listen(listen(eventName, name(function* () {
      yield delay(waitTime)
    }, taskName)))

    bus.listen(listen(cancelEvent, function*({ getTaskState }) {
      expect( getTaskState(taskName) ).toBe(PENDING_STATE)
    }))


    const promise = bus.emit(eventName)
    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect(taskState[DEFAULT_GROUP_NAME][taskName]).toBe(PENDING_STATE)
        return bus.emit(cancelEvent)
      }),
      promise
    ]).then(()=>done()).catch(done)

  })


  it('getGroupTaskState', (done) => {

    const checkEvent = 'check'

    bus.listen(listen(eventName, nameGroup(function* () {
      yield delay(waitTime)
    }, groupName, taskName)))

    bus.listen(listen(checkEvent, function*({ getGroupTaskState }) {
      expect( getGroupTaskState(groupName, taskName) ).toBe(PENDING_STATE)
    }))

    const promise = bus.emit(eventName)
    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect(taskState[groupName][taskName]).toBe(PENDING_STATE)
        return bus.emit(checkEvent)
      }),
      promise
    ]).then(()=>done()).catch(done)

  })


  it('getTaskGroup', (done) => {

    const checkEvent = 'check'

    bus.listen(listen(eventName, nameGroup(function* () {
      yield delay(waitTime)
    }, groupName, taskName)))

    bus.listen(listen(checkEvent, function*({ getTaskGroup }) {
      const taskGroup = getTaskGroup(groupName)
      expect( Object.keys(taskGroup).length ).toBe( 1 )
      expect( Object.keys(taskGroup)[0] ).toBe( taskName )
      expect( taskGroup[taskName] ).toBe( PENDING_STATE )
    }))

    const promise = bus.emit(eventName)
    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect(taskState[groupName][taskName]).toBe(PENDING_STATE)
        return bus.emit(checkEvent)
      }),
      promise
    ]).then(()=>done()).catch(done)

  })

  it('getTask', (done) => {

    const checkEvent = 'check'

    bus.listen(listen(eventName, name(function* () {
      yield delay(waitTime)
    }, taskName)))

    bus.listen(listen(checkEvent, function*({ getTask }) {
      const tasks = getTask()
      expect( Object.keys(tasks).length ).toBe( 1 )
      expect( Object.keys(tasks)[0] ).toBe( taskName )
      expect( tasks[taskName] ).toBe( PENDING_STATE )
    }))

    const promise = bus.emit(eventName)
    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect(taskState[DEFAULT_GROUP_NAME][taskName]).toBe(PENDING_STATE)
        return bus.emit(checkEvent)
      }),
      promise
    ]).then(()=>done()).catch(done)

  })

})

