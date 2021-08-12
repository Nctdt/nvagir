import { v4 } from 'uuid'

import { isNE, isNEArr, NE, NvagirEl, sign } from './typings/nvagir-element'
import { getType, littleHump } from './utils'

export type Component<
  N extends string = string,
  P extends Record<string, unknown> = {},
> = (props: P) => NE<N>

type TemplateValues = (string | number | EventListener | NE | NE[])[]

type Command = {
  id: string
  event: keyof DocumentEventMap | 'name' | 'dom'
}
type MyReturnType<T> = T extends (...args: any) => infer R ? R : any

type GetTupleReturnType<C extends ReadonlyArray<Component | Component[]> = []> =
  {
    [K in keyof C & number]: C[K] extends Component[]
      ? MyReturnType<C[K][number]>[]
      : MyReturnType<C[K]>
  }

type Tuple2NvagirElement<
  C extends ReadonlyArray<Component | Component[]> = [],
  R extends GetTupleReturnType<C> = GetTupleReturnType<C>,
> = {
  [K in keyof R & number as (R[K] extends NE[]
    ? R[K][number]['name']
    : R[K] extends NE
    ? R[K]['name']
    : '') &
    string]: R[K]
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
      const target = values[+dataVal]

      switch (event) {
        case 'name':
          p.doms[dataVal] = dom
          break
        case 'dom':
          if (!isNEArr(target)) return p
          dom.replaceWith(
            ...target.map(v => {
              const {
                el: { dom },
                name,
              } = v
              const curr = p.components[name]
              // case undefined
              if (!curr) {
                p.components[name] = v
              } else if (isNE(curr)) {
                p.components[name] = [curr, v]
              } else {
                curr.push(v)
              }
              return dom
            }),
          )
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
  components: Tuple2NvagirElement<C>
} {
  const parser = new DOMParser()
  const commands: Command[] = []

  let domStr = values.reduce<string>((p, c, i) => {
    let add = c
    // case insertVal is function
    if (typeof c === 'function') {
      add = `"${i}"`
    }
    // case insertVal is Component
    if (isNE(c)) {
      c = values[i] = [c]
    }
    if (isNEArr(c)) {
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
  const { doms, components } = bindEvent<T, Tuple2NvagirElement<C>>(
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
