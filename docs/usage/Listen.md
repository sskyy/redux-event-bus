#  Listen to a event

There are two ways to listen to a event. First, use string to match the name of the event.

```javascript
listen('login', function* () {})
```

Second, use a function which returns a bool to match event.

```javascript
listen(function (event) {
  return  event === 'login'
}, function* () {})
```

#  Listen to a redux action

Actually, when a redux action is dispatched, the action will be emitted just as an event. So we can use a function to match the action.

 ```javascript
 listen(function(action){
   return  action.type && action.type === 'some-redux-action-type'
 }, function* (){})
 ```

 or use a helper function to match certain action type.

 ```javascript
 import { fromReduxAction } from 'redux-task'
 
 listen( fromReduxAction('some-redux-action-type'), function* () {})
 ```

