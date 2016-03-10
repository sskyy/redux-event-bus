# 1. Listen to a event

There are two ways to listen to a event. First, use string as the name of event.

```javascript
listen('login', function* () {})
```

Second, use a function which returns a bool to match event.

```javascript
listen(function (event) {
  return  event === 'login'
}, function* () {})
```

# 2. Listen to a redux action

Actually, when a action is dispatched, the action will be emit as event also. So we can use a function to match actions.

 ```javascript
 listen(function(action){
   return  action.type && action.type=== 'some-redux-action-type'
 }, function* (){})
 ```

 or use a helper function to match certain action type.

 ```javascript
 import { fromReduxAction } from 'redux-task'
 
 listen( fromReduxAction('some-redux-action-type'), function* () {})
 ```

