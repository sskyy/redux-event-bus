# API

## listen( event, handler )

### Arguments

 - event(String|Function) : use a string or a function to match certain event.
 - handler(Generator) : code will be executed when event match. listener will receive two part of arguments. The first is an object with basic APIs, the second is the arguments emitted with the event.

### Returns

EventHandler: internal data structure.

### Examples

```javascript
listen('login', function *(){})
```

use a function which returns a bool to match event:

```javascript
listen(function(event){
  return  event === 'login'
}, function *(){})
```

Listen to a redux action:

Actually, when a action is dispatched, the action will be emit as event also. So we can use a function to match actions we want:

 ```javascript
 listen(function(action){
   return  action.type && action.type=== 'some-redux-action-type'
 }, function *(){})
 ```

 or use a helper function to match certain action type:

 ```javascript
 listen( fromReduxAction('some-redux-action-type'), function *(){
 })
 ```

 ## name( asynchronousAction, name )

 ### Arguments

  - asynchronousAction(Generator|Promise|Function) : Internally we use **co.js** like machanism to handle asynchronous code. So, you can name anything can be yield by co.
  - name(String) : unique name of the task.

 ### Returns

 Internal data structure.

## getTaskState()

This api can only be achieved in listener. Task have three state: **pending**, **fulfilled** and **rejected**.

### Returns

An Object contains all tasks with state.

### Example

```javascript
listen('login', function *({getTaskState}){
  if( getTaskState()['taskA'] === 'pending' ){
    console.log('task a is running')
  }
})
```

## cancel(name)

## Arguments

 - name(String) : The name of task to cancel.

This api can only be achieved in listener.

### Example

```javascript
listen('login', function *({cancel, getTaskState}){
  if( getTaskState()['taskA'] === 'pending' ){
    cancel('taskA')
  }
})
```

## dispatch()

The same as redux dispatch method. This api can only be achieved in listener.

### Example

```javascript
listen('login', function *({dispatch}){
  dispatch({type:'login'})
})
```

## getState()

The same as redux getState method. This api can only be achieved in listener.

### Example

```javascript
listen('login', function *({getState}){
  console.log( getState() )
})
```