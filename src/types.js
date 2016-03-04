import assign from 'object-assign'

export class Type{
  constructor( data ){
    assign(this,  data)
  }
}

export class NamedYieldable extends Type{}

export class Listener  extends Type{}