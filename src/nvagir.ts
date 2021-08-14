import { Component, NE } from './typings/nvagir-element'

export * from './typings/nvagir-element'
export * from './nvagir-dom'

export function reactive<T extends Record<string, unknown>>(
  data: T,
  reactiveFc: (p: keyof T, data: T) => void,
) {
  const proxyData = new Proxy(data, {
    set(target, p: string, v, receiver) {
      const flag = Reflect.set(target, p, v, receiver)
      reactiveFc(p, target)
      return flag
    },
  })
  return proxyData
}

export function render<C extends Component, N extends ReturnType<C>>(
  target: HTMLElement,
  c: C,
  components: Record<N['name'], NE>,
  ...prop: Parameters<C>
) {
  const component = c.apply(null, prop)
  components[component.name as N['name']] = component
  const {
    el: { dom },
  } = component

  target.innerHTML = ''
  target.append(dom)
  return dom
}

export function renderMaps<C extends Component, N extends ReturnType<C>>(
  target: HTMLElement,
  c: C,
  components: Record<N['name'], NE[]>,
  ...props: Parameters<C>[]
) {
  const result = props.map(prop => {
    const component = c.apply(null, prop)
    return component
  })
  if (!result.length) return []
  let name = result[0].name
  components[name as N['name']] = result
  const doms = result.map(({ el: { dom } }) => dom)

  target.innerHTML = ''
  target.append(...doms)
  return doms
}
