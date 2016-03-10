# Query task state in listener

Task state can be queried from listener. There are several API can do this.

#### getTaskState

```javascript
listen('login', name(function* () {
	...
}, 'loginTask'))

listen('logout', function* ({ getTaskState }) {

  const taskState = getTaskState('loginTask')
  if( taskState === 'pending' ) {
  	throw new Error('your login task is not complete.')
  }
})
```

#### getGroupTaskState

```javascript
listen('login', nameGroup(function* () {
	...
}, 'loginTask', 'taskOne'))

listen('logout', function* ({ getGroupTaskState }) {

  const taskState = getGroupTaskState('loginTask', 'taskOne')
  if( taskState === 'pending' ) {
  	throw new Error('your login task is not complete.')
  }
})
```

#### getTask

```javascript
listen('login', name(function* () {
	...
}, 'loginTask'))

listen('logout', function* ({ getTask }) {

  const taskState = getTaskState('loginTask')
  if( taskState['loginTask'] === 'pending' ) {
  	throw new Error('your login task is not complete.')
  }
})
```

#### getTaskGroup

```javascript
listen('login', nameGroup(function* () {
	...
}, 'loginTask'))

listen('logout', function* ({ getTask }) {

  const taskGroup = getTaskGroup()
  if( taskGroup['loginTask'] !== undefined ) {
  	 console.log('your have login task.')
  }
})
```