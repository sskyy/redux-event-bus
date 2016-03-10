#  Name a task

Nearly anything synchronous can be named as task, event a event listener.

#### Name listener as task

```javascript
listen('login', name(function* () {
	...
}, 'loginTask'))

```

#### Name a promise inside listener

```javascript
listen('login', function* () {
	yield name(new Promise(resolve => {
		...
	}), 'loginTask')
})
```

#### Name a generator inside listener

```javascript
listen('login', function* () {
	yield name(function* () {
		...
	}), 'loginTask')
})
```

#### Name task Group

If a task can be run parallel. It should be named as a group using API `nameGroup`.

```
listen('login', function* () {
	yield nameGroup(function* () {
		...
	}), 'loginTask')
})
```

#### Name task Group with instance Name

If a task was named as a Group, a instance name can be given. But instance name must be unique too.

```
listen('login', function* () {
	yield nameGroup(function* () {
		...
	}), 'loginTask', 'taskOne')
})
```