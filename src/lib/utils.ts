import { A, L } from 'ts-toolbelt'

import { PureAttributeDefinition } from '../classes/Entity'
import { DynamoDBTypes, DynamoDBKeyTypes } from '../classes/Table'

export const validTypes: DynamoDBTypes[] = [
  'string',
  'boolean',
  'number',
  'list',
  'map',
  'binary',
  'set'
]

export const validKeyTypes: DynamoDBKeyTypes[] = ['string', 'number', 'binary']

export const isDynamoDbType = (value: string): value is DynamoDBTypes =>
  validTypes.includes(value as DynamoDBTypes)

export const isDynamoDbKeyType = (value: string): value is DynamoDBKeyTypes =>
  validKeyTypes.includes(value as DynamoDBKeyTypes)

// Boolean conversion
export const toBool = (val: any) =>
  typeof val === 'boolean'
    ? val
    : ['false', '0', 'no'].includes(String(val).toLowerCase())
      ? false
      : Boolean(val)

// has value shortcut
export const hasValue = (val: any) => val !== undefined && val !== null

// isEmpty object shortcut
export const isEmpty = (val: any) =>
  val === undefined || (typeof val === 'object' && Object.keys(val).length === 0)

// Inline error handler
export const error = (err: string) => {
  throw new Error(err)
}

// Standard type error
export const typeError = (field: string) => {
  error(
    `Invalid or missing type for '${field}'. ` +
      `Valid types are '${validTypes.slice(0, -1).join(`', '`)}',` +
      ` and '${validTypes.slice(-1)}'.`
  )
}

// Key type error
export const keyTypeError = (field: string) => {
  error(
    `Invalid or missing type for '${field}'. ` +
      `Valid types for partitionKey and sortKey are 'string','number' and 'binary'`
  )
}

// Condition error
export const conditionError = (op: string) =>
  error(`You can only supply one sortKey condition per query. Already using '${op}'`)

// Transform attribute values
export const transformAttr = (mapping: PureAttributeDefinition, value: any, data: {}) => {
  value = mapping.transform ? mapping.transform(value, data) : value
  return mapping.prefix || mapping.suffix
    ? `${mapping.prefix || ''}${value}${mapping.suffix || ''}`
    : value
}

// Type now exists in ts-toolbelt but requires upgrading ts: See https://github.com/millsp/ts-toolbelt/issues/169
export type If<C extends 0 | 1, T, E = never> = C extends 1 ? (1 extends C ? T : E) : E

export type FirstDefined<List extends L.List> = {
  stopNone: undefined
  stopOne: L.Head<List>
  continue: FirstDefined<L.Tail<List>>
}[A.Cast<
  If<A.Equals<List, []>, 'stopNone', If<A.Equals<L.Head<List>, undefined>, 'continue', 'stopOne'>>,
  'stopNone' | 'stopOne' | 'continue'
>]

// ts-toolbelt A.Compute has issues: A.Compute<any[]> returns { [key:string]: any } and A.Compute<unknown> returns {}
export type Compute<A> = A extends Promise<infer T>
  ? Promise<Compute<T>>
  : A extends (...args: infer P) => infer R
  ? (...args: Compute<P>) => Compute<R>
  : A extends Set<infer V>
  ? Set<Compute<V>>
  : A extends object
  ? { [key in keyof A]: Compute<A[key]> }
  : A
