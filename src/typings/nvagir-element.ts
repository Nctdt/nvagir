import { getType } from '../utils'

export const sign = Symbol('nvagirComponent')

export interface NvagirEl {
  readonly sign: typeof sign
  dom: HTMLElement
}

export type NvagirElement<N extends string = string> = {
  name: N
  el: NvagirEl
}
export type NE<N extends string = string> = NvagirElement<N>
export function isNE(item: unknown): item is NE {
  return (item as NvagirElement)?.el.sign === sign
}
export function isNEArr(item: unknown): item is NE[] {
  if (getType(item) !== 'Array') return false
  return (item as unknown[]).every(v => isNE(v))
}

export type PageNvagirElement = Omit<NvagirElement, 'name'>
export type PageComponent = () => PageNvagirElement

type Data<T extends Record<string, unknown>> = { proxyData: T }
type Methods<T extends Record<string, (...args: any) => any>> = { methods: T }

export type DataNameNvagirElement<
  N extends string = '',
  D extends Record<string, unknown> = {},
> = NE<N> & Data<D>
export type DNE<
  N extends string = '',
  D extends Record<string, unknown> = {},
> = NE<N> & Data<D>

export type MethodNvagirElement<
  N extends string = '',
  M extends Record<string, (...args: any) => any> = {},
> = NE<N> & Methods<M>
export type MNE<
  N extends string = '',
  M extends Record<string, (...args: any) => any> = {},
> = NE<N> & Methods<M>

export type DataAndMethodNvagirElement<
  N extends string = '',
  D extends Record<string, unknown> = {},
  M extends Record<string, (...args: any) => any> = {},
> = NE<N> & Data<D> & Methods<M>
export type DAMNE<
  N extends string = '',
  D extends Record<string, unknown> = {},
  M extends Record<string, (...args: any) => any> = {},
> = NE<N> & Data<D> & Methods<M>
