import { Component, NE } from './typings/nvagir-element'

export * from './typings/nvagir-element'
export * from './nvagir-dom'

/**
 * react to data changes
 * @template T data type
 * @param data will proxy data
 * @param reactiveFc when the proxy data changes, will call `reactiveFc(changePropName, changedData)`.
 * @return proxy data
 */
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

/**
 * re-render child component utility method
 * @template C child component type
 * @template N child component return type
 * @param target will render place
 * @param childComponent will re-render child component
 * @param components make the corresponding attribute of `components` point to the new component
 * @param prop child component props
 * @return DOM element rendered on the page
 */
export function render<C extends Component, N extends ReturnType<C>>(
  target: HTMLElement,
  childComponent: C,
  components: Record<N['name'], NE>,
  ...prop: Parameters<C>
) {
  const component = childComponent.apply(null, prop)
  components[component.name as N['name']] = component
  const {
    el: { dom },
  } = component

  target.innerHTML = ''
  target.append(dom)
  return dom
}

/**
 * re-render several child components utility method
 * @template C child component type
 * @template N child component return type
 * @param target will render place
 * @param childComponent will re-render child component
 * @param components make the corresponding attribute of `components` point to the new components
 * @param props child component props
 * @return DOM elements rendered on the page
 */
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
