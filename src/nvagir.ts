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

export * from './nvagir-dom'
