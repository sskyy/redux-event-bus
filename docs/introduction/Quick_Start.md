#  Quick Start

One of the most annoying things about managing asynchronicity in redux is that you have to manually set multiple state in store to indicate the states of you asynchronous action such as fetching data from server. To handle on asynchronous action, usually three state are needed, `REQUEST_START`, `REQUEST_SUCCEED` and `REQUEST_FAILED`. What if there is a central palce automatically hold all the asynchronous action and their state for you, and all you need to do is name the asynchronous action if you need to put their state in components. Let's see how we can acheive this.

## Step 1: create a event listener

Just like action and reducer, we use `event` and `listener` to wrap all the asynchronous code. A listener is a generator which will be called when a certain **event** is emitted. A task is a named generator, a promise, or a function returns a promise or generator. So, a generator can be both named and be used as listener at same time. In the code below, we named a generator as `loginTask`, so it is a task now. And we also use it as a listener to handle event `login`.


```javascript
import {listen, name} from 'redux-task'

function* loginCurrentUser(){
	// mimic ajax
	yield new Promise(resolve=>setTimeout(resolve, 1000))

}

const loginListener = listen( 'login', name(loginCurrentUser, 'loginTask'))

```

Listening to a redux action directly is also possible, we will show you how to do that later.

## Step 2: create store with redux-task enhancer

Then we can create our store:

```javascript
import {createEnhancer} from 'redux-task'

const store = createStore(reducer, {}, createEnhancer([loginListener]));
```


## Step 3: monitor the task state in react component

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

Looking for more examples? Checkout the [examples](https://github.com/sskyy/redux-task/tree/master/examples) directory.
