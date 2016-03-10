# Listener

Just the same concept in any other event-bus library. We declare a listener using `listen` method.

```javascript
const listener =  listen(fetch_event, function* listener() {
  yield fetch('data_url')
})
```

The listener function can only be a generator.

# Task

Promise, generator, or a function returns a promise or generator, when given a name by using `name` method, we call it **Task**.

```javascript
const listener =  listen(fetch_event, function* listener() {
  // This is a task now
  yield name(fetch('data_url'), 'fetch_task')
})
```

Of course, a listener can also be a task:

```javascript
const listener =  listen(fetch_event, name(function* listener() {
  yield name(fetch('data_url'), fetch_task)
}), 'listener_task')
```

# Task Group

When a task can be run parallel, we should use `nameGroup` method to wrapped, and we call it **Task Group**.

```javascript
const listener =  listen(fetch_event, nameGroup(function* listener() {
  yield name(fetch('data_url'), fetch_task)
}), 'listener_task')
```