import { Component, NE, NvagirElement, sign } from './nvagir-element'
import { getType } from '../utils'

export function isNE(item: unknown): item is NE {
  return (item as NvagirElement)?.el?.sign === sign
}
export function isNEArr(item: unknown): item is NE[] {
  if (getType(item) !== 'Array') return false
  return (item as unknown[]).every(v => isNE(v))
}

export type GetName<T> = T extends NE<infer N> ? N : never
export type NEReturnType<T extends Component> = T extends (
  ...args: any
) => infer R
  ? R
  : NE
