# redux-task

[Documents](http://sskyy.github.io/redux-task).   
A Side Effects manager for redux. The idea is really simple : we give an asynchronous task(such as fetch data from server) a name, then we can use the name to get the state of the task or cancel it if we want. You will no longger need to set state like `isSubmitting` to indicate asynchronous action state.

## 1. Quick Start

### Step 1: create a listener

A listener is a generator which will be called when a certain **event** is emitted. A task is a named generator, a promise, or a function returns a promise or generator. So, a generator can be both named and be used as listener at same time. In the code below, we named a generator as `loginTask`, so it is a task now. And we also use it as a listener to handle event `login`.


```javascript
import {listen, name} from 'redux-task'

function* loginCurrentUser(){
	// mimic ajax
	yield new Promise(resolve=>setTimeout(resolve, 1000))

}

const loginListener = listen( 'login', name(loginCurrentUser, 'loginTask'))

```

### Step 2: create store with redux-task enhancer

Then we can create our store:

```javascript
import {createEnhancer} from 'redux-task'

const store = createStore(reducer, {}, createEnhancer([loginListener]));
```
  

### Step 3: monitor the task state in react component

Finally, let's see how to emit a event, and how to get the state of the yield task. We will use api `monitor` to wrap our component. The usage is quite similar as redux api `connect`. It takes a function to map task state to props. And monitor will pass an aditional method called `emit` to your component, so you can use it to emit evemt.

```javascript
import {monitor} from 'redux-task'

const App = (props)=>{
	return (
		<div>
			<button onClick={()=>props.emit('login')}>click</button>
			<div>state of helloTask:{this.props.loginTask}</div>
		</div>
	)
}

function mapTaskStateToProps(state){
	return {
		loginTask : state.loginTask
	}
}

export default monitor(mapTaskStateToProps)(App)
```

## 2. Usage

### 2.1 Name a task

Nearly anything synchronous can be named as task. 


#### Name a listener

```javascript
listen( 'login', name(function*(){
	...
}, 'loginTask'))

``` 

#### Name a promise inside listener

```javascript
listen('login', function *(){

	yield name(new Promise(resolve=>{
		...
	}), 'loginTask')
})
```

#### Name a generator inside listener

```javascript
listen('login', function *(){

	yield name(function*(){
		...
	}), 'loginTask')
})
```

### 2.2 Get task state in listener

listener will receive two part of arguments. The first is an object with basic apis, the second is the arguments emitted with the event. We can use the api `getTaskState` in the first object.

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

### 2.3 Cancel task

Let's still use our example above. Let's say our use submitted the login form, and quickly click the cancel button.

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

## 3. Examples

Examples can be found in the `examples` folder. More docs and example comming soon.

## 4. License

MIT



