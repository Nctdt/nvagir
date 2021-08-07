import { v4 } from 'uuid'
import { getType, littleHump } from './utils'

export type Component<P extends Record<string, unknown> = {}> = (
  props: P,
) => HTMLElement

export type PureComponent = () => HTMLElement

type TemplateValues = (
  | string
  | number
  | EventListener
  | HTMLElement
  | HTMLElement[]
)[]

type Command = {
  id: string
  event: keyof DocumentEventMap | '' | 'dom'
}

function bindEvent(
  body: HTMLElement,
  commands: Command[],
  values: TemplateValues,
) {
  const doms = commands.map(({ id, event }) => {
    const dom = body.querySelector(`[${id}]`)! as HTMLElement
    if (event === '') return dom

    const dataId = id.replace('data-', '')
    const valueId = +dom.dataset[littleHump(dataId)]!
    const target = values[valueId]
    switch (event) {
      case 'dom':
        dom.replaceWith(...(target as HTMLElement[]))
        return false
      default:
        dom.addEventListener(event, target as EventListener)
        return dom
    }
  })
  return doms.filter(v => v) as HTMLElement[]
}

export function html(
  templates: TemplateStringsArray,
  ...values: TemplateValues
) {
  const parser = new DOMParser()
  const commands: Command[] = []

  let domStr = values.reduce<string>((p, c, i) => {
    let add = c
    if (typeof c === 'function') {
      add = `"${i}"`
    }
    if (c instanceof Node) {
      c = values[i] = [c]
    }
    if (getType(c) === 'Array') {
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
  const doms = bindEvent(parserDocument.body, commands, values)
  return {
    el: parserDocument.body.children[0] as HTMLElement,
    doms,
  }
}
