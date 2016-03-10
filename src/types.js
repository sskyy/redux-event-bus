
export class Type {
  constructor( data ) {
    for( let i in data ) {
      if( data.hasOwnProperty(i)) {
        this[i] = data[i]
      }
    }
  }
}

export class NamedYieldable extends Type {}

export class Listener  extends Type {}
