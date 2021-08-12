import { v4 } from 'uuid'

import {
  DAMNE,
  DNE,
  isNE,
  isNEArr,
  MNE,
  NE,
  NvagirEl,
  sign,
} from './typings/nvagir-element'
import { littleHump } from './utils'

type Component<N extends string = string> = (...args: any) => NE<N>

type MyReturnType<T extends Component> = T extends (...args: any) => infer R
  ? R
  : NE
type GetName<T> = T extends NE<infer N> ? N : never

type GetTupleReturnNE<C extends ReadonlyArray<Component | Component[]> = []> = {
  [K in keyof C]: C[K] extends (infer A)[]
    ? A extends Component
      ? MyReturnType<A>[]
      : NE
    : C[K] extends Component
    ? MyReturnType<C[K]>
    : NE
}
type Tuple2UnionNE<
  C extends ReadonlyArray<Component | Component[]>,
  R extends GetTupleReturnNE<C> = GetTupleReturnNE<C>,
> = {
  [K in keyof R as R[K] extends NE<infer N>[]
    ? N
    : GetName<R[K]>]: K extends string ? R[K] : never
}

// Test
// type S = () => DAMNE<'son', { text: string }, { setText(text: string): void }>
// type SA = () => DNE<'SonA', { text: string }>
// type SC = () => MNE<'SonC', { setText(text: string): void }>
// type R = Tuple2UnionNE<[S, SA[], SC[]]>

type TemplateValues = (string | number | EventListener | NE | NE[])[]

type Command = {
  id: string
  event: keyof DocumentEventMap | 'name' | 'dom'
}
function bindEvent<
  T extends Record<string, HTMLElement>,
  C extends Record<string, NE | NE[]>,
>(body: HTMLElement, commands: Command[], values: TemplateValues) {
  const result = commands.reduce(
    (p, { id, event }) => {
      const dom = body.querySelector(`[${id}]`)! as HTMLElement
      const dataId = id.replace('data-', '')
      const dataVal = dom.dataset[littleHump(dataId)]

      if (!dataVal) return p
      let target = values[+dataVal]

      switch (event) {
        case 'name':
          p.doms[dataVal] = dom
          break
        case 'dom':
          if (isNEArr(target) || isNE(target)) {
            let curr = target
            if (isNE(curr)) curr = [curr]

            dom.replaceWith(
              ...curr.map(v => {
                const {
                  el: { dom },
                  name,
                } = v
                if (isNE(target)) {
                  p.components[name] = v
                } else if (isNEArr(target)) {
                  p.components[name] = curr
                }
                return dom
              }),
            )
          }
          return p
          break
        default:
          dom.addEventListener(event, target as EventListener)
          break
      }
      return p
    },
    {
      doms: {} as Record<string, HTMLElement>,
      components: {} as Record<string, NE | NE[]>,
    },
  )
  return result as { doms: T; components: C }
}

export function html<
  T extends Record<string, HTMLElement> = {},
  C extends ReadonlyArray<Component | Component[]> = [],
>(
  templates: TemplateStringsArray,
  ...values: TemplateValues
): {
  el: NvagirEl
  doms: T
  components: Tuple2UnionNE<C>
} {
  const parser = new DOMParser()
  const commands: Command[] = []

  let domStr = values.reduce<string>((p, c, i) => {
    let add = c
    // case insertVal is function
    if (typeof c === 'function') {
      add = `"${i}"`
    }
    // case insertVal is NE | NE[]
    if (isNE(c) || isNEArr(c)) {
      add = `<div n@dom="${i}"></div>`
    }

    return p + add + templates[i + 1]
  }, templates[0])
  domStr = domStr.replace(/n@([a-z]*)(?=\>|\s|\/|\=)/g, (_, event = '') => {
    const id = `data-n-id-${v4().substring(0, 8)}`
    commands.push({
      id,
      event,
    })
    return id
  })

  const parserDocument = parser.parseFromString(domStr, 'text/html')
  const { doms, components } = bindEvent<T, Tuple2UnionNE<C>>(
    parserDocument.body,
    commands,
    values,
  )
  return {
    el: {
      sign,
      dom: parserDocument.body.children[0] as HTMLElement,
    },
    doms,
    components,
  }
}
