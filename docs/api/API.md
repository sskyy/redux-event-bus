
# `listen(event, handler)`  


#### Arguments

 - event(String|Function) : Use a string or a function to match certain event.
 - handler(Generator) : Code will be executed when event match. Listener will receive two parts of arguments. The first is an object with basic APIs, the second is the arguments emitted with the event.

#### Returns

EventHandler: Internal data structure.

#### Examples

```javascript
listen('login', function *(){})
```

Use a function which returns a bool to match event:

```javascript
listen(function(event){
  return  event === 'login'
}, function *(){})
```

Listen to a redux action:

Actually, when a action is dispatched, the action will be emitted just as an event. So we can use a function to match actions we want:

 ```javascript
 listen(function(action){
   return  action.type && action.type=== 'some-redux-action-type'
 }, function *(){})
 ```

 Or use a helper function to match certain action type:

 ```javascript
 listen( fromReduxAction('some-redux-action-type'), function *(){
 })
 ```

# `name( asynchronousAction, name )`

#### Arguments

  - asynchronousAction(Generator|Promise|Function) : Internally we use **co.js** like machanism to handle asynchronous code. So, you can name anything can be yield by co.js.
  - name(String) : unique name of the task.

#### Returns

 Internal data structure.

# `getTaskState(taskName)`

This api can only be achieved in listener. Task may have three type of state: **pending**, **fulfilled** and **rejected**.

#### Returns

An Object contains all tasks with state.

#### Example

```javascript
listen('login', function *({getTaskState}){
  if( getTaskState()['taskA'] === 'pending' ){
    console.log('task a is running')
  }
})
```

# `getTask()`

# `getGroupTaskState()`

# `cancel(name)`

#### Arguments

 - name(String) : The name of task to cancel.

This API can only be achieved in listener.

#### Example

```javascript
listen('login', function *({cancel, getTaskState}){
  if( getTaskState()['taskA'] === 'pending' ){
    cancel('taskA')
  }
})
```

# `dispatch()`

The same as redux dispatch method. This API can only be achieved in listener.

#### Example

```javascript
listen('login', function *({dispatch}){
  dispatch({type:'login'})
})
```

# `getState()`

The same as redux getState method. This API can only be achieved in listener.

#### Example

```javascript
listen('login', function *({getState}){
  console.log( getState() )
})
```