import expect from 'expect'
import { name, nameGroup, listen } from '../src/index'
import { PENDING_STATE, CANCELED_STATE, CancelException } from '../src/bus'
import { DEFAULT_GROUP_NAME } from '../src/util'
import Bus from '../src/bus'


describe('cancel', () => {
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


  it('cancel a task', (done) => {

    const cancelEvent = 'cancelEvent'

    bus.listen(listen(eventName, name(function* () {
      yield delay(waitTime)
    }, taskName)))

    bus.listen(listen(cancelEvent, function*({ cancel }) {
      cancel(taskName)
    }))


    const promise = bus.emit(eventName)
    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect(taskState[DEFAULT_GROUP_NAME][taskName]).toBe(PENDING_STATE)
        bus.emit(cancelEvent)
      }),
      promise
    ]).then(done.bind(null,'should not resolve')).catch( e => {
      expect(taskState[DEFAULT_GROUP_NAME][taskName]).toBe(CANCELED_STATE)
      expect(e instanceof CancelException).toBe(true)
      done()
    })

  })

  it('cancel a group task', (done) => {

    const cancelEvent = 'cancelEvent'

    bus.listen(listen(eventName, nameGroup(function* () {
      yield delay(waitTime)
    }, groupName, taskName)))

    bus.listen(listen(cancelEvent, function*({ cancelGroupTask }) {
      cancelGroupTask(groupName, taskName)
    }))


    const promise = bus.emit(eventName)
    // delay is important
    // emit will not always  change state immediately

    Promise.all([
      delay(checkTime).then(() => {
        expect(taskState[groupName][taskName]).toBe(PENDING_STATE)
        bus.emit(cancelEvent)
      }),
      promise
    ]).then(done.bind(null,'should not resolve')).catch( e => {
      expect(taskState[groupName][taskName]).toBe(CANCELED_STATE)
      expect(e instanceof CancelException).toBe(true)
      done()
    })

  })

})

