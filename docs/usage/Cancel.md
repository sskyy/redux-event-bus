# Cancel a task by name

Scenario: User submitted a  login form, and quickly clicked the cancel button.
We will declare two event listener, one listens to event `login`, and the other listens to `cancel-login`.

```javascript
import { listen, name } from 'redux-task'

function* loginCurrentUser({ dispatch }) {
	// mimic ajax
	yield new Promise(resolve => setTimeout(resolve, 1000))

	// if canceled in time, this action will not be dispatched
	dispatch({type:'update-current-user'})
}

const loginListener = listen('login', name(loginCurrentUser, 'loginTask'))

const cancelListener = listen('cancel-login', function* ({ cancel, getTaskState }) {
	const taskState = getTaskState()
	if( taskState[ 'loginTask' ] === 'pending' ) cancel('loginTask')
})
```