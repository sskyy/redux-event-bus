# 1. Listen to a event

There to ways to listen to match a  event you want to listen. First, use string as the name of event.

```javascript
listen('login', function *(){})
```

Second, use a function which returns a bool to match event.

```javascript
listen(function(event){
  return  event === 'login'
}, function *(){})
```

# 2. Listen to a redux action

Actually, when a action is dispatched, the action will be emit as event also. So we can use a function to match actions we want.

 ```javascript
 listen(function(action){
   return  action.type && action.type=== 'some-redux-action-type'
 }, function *(){})
 ```

 or use a helper function to match certain action type.

 ```javascript
 listen( fromReduxAction('some-redux-action-type'), function *(){
 })
 ```

# 3. Name a task

Nearly anything synchronous can be named as task, event a event listener.

## 3.1 Name  listener as task

```javascript
listen( 'login', name(function*(){
	...
}, 'loginTask'))

```

## 3.2 Name a promise inside listener

```javascript
listen('login', function *(){

	yield name(new Promise(resolve=>{
		...
	}), 'loginTask')
})
```

## 3.3 Name a generator inside listener

```javascript
listen('login', function *(){

	yield name(function*(){
		...
	}), 'loginTask')
})
```

# 4. Query task state in listener

listener will receive two part of arguments. The first is an object with basic APIs, the second is the arguments emitted with the event. We can use the api `getTaskState` in the first object.

```javascript
listen( 'login', name(function*(){
	...
}, 'loginTask'))

listen( 'logout', function*({getTaskState}){

  const taskState = getTaskState()
  if( taskState['loginTask'] === 'pending' ){
  	throw new Error('your login task is not complete.')
  }
})
```

# 5. Cancel a task by name

Let's say our use submitted a  login form, and quickly click the cancel button. We will have two event listener, one listens to event `login`, and the other listens to `cancel-login`.

```javascript
import {listen, name} from 'redux-task'

function* loginCurrentUser({dispatch}){
	// mimic ajax
	yield new Promise(resolve=>setTimeout(resolve, 1000))

	// if canceled in time, this action will not be dispatched
	dispatch({type:'update-current-user'})
}

const loginListener = listen( 'login', name(hello, 'loginTask'))

const cancelListener = listen('cancel-login', function*({cancel, getTaskState}){
	const taskState = getTaskState()
	if( taskState['loginTask'] === 'pending' ) cancel('loginTask')
})
```