export function forEach( obj, fn ) {
  return Object.keys( obj ).forEach(key=>{
    return fn( obj[key], key)
  })
}


export function compose( fnA, fnB) {
  return function ( ...arg) {
    fnA && fnA(...arg)
    fnB && fnB(...arg)
  }
}

export function mapValues(obj, handler) {
  const result = {}
  Object.keys( obj).forEach(key=>{
    result[key] = handler(obj[key], key)
  })
  return result
}

export function intersection( ...arrays ) {
  let result= []
  arrays[0].forEach(item=>{
    if( arrays[1].indexOf(item) !== -1 ) {
      result.push(item)
    }
  })
  if( arrays.length > 2 ) {
    result =  intersection(result, ...arrays.slice(2) )
  }
  return result
}

export function zip( keys, values ) {
  const result = {}
  keys.forEach( (key, index)=>{
    result[key] = values[index]
  })
  return result
}

export function decorate( fnA, fnB ) {
  return function (...arg) {
    fnA.call(this, ...arg)
    return fnB.call(this, ...arg)
  }
}


export function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) ||
        objA[keysA[i]] !== objB[keysA[i]]) {
      return false
    }
  }

  return true
}

export function flat( arr ) {
  return arr.reduce((a, b)=>a.concat(b),[])
}

export function partialRight( fn, ...args ) {
  return function ( ...runtimeArgs ) {
    return fn(...runtimeArgs, ...args)
  }
}
