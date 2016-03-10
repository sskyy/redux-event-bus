# Cancel a task by name

Let's say our use submitted a  login form, and quickly click the cancel button. We will have two event listener, one listens to event `login`, and the other listens to `cancel-login`.

```javascript
import { listen, name } from 'redux-task'

function* loginCurrentUser({ dispatch }) {
	// mimic ajax
	yield new Promise(resolve => setTimeout(resolve, 1000))

	// if canceled in time, this action will not be dispatched
	dispatch({type:'update-current-user'})
}

const loginListener = listen('login', name(hello, 'loginTask'))

const cancelListener = listen('cancel-login', function* ({ cancel, getTaskState }) {
	const taskState = getTaskState()
	if( taskState[ 'loginTask' ] === 'pending' ) cancel('loginTask')
})
```