import { html, reactive } from './nvagir'
import { DAMNE, DNE, MNE, PageComponent } from './typings/nvagir-element'

type SonData = {
  text: string
}

const Son = () => {
  const data: SonData = {
    text: '',
  }
  const { el, doms } = html<{ text: HTMLElement }>`
    <div><div n@name="text">${data.text}</div></div>
  `
  const proxyData = reactive(data, (p, data) => {
    switch (p) {
      case 'text':
        doms.text.textContent = data.text
    }
  })
  const methods = {
    setText(text: string) {
      proxyData.text = text
    },
  }
  return {
    name: 'son',
    el,
    proxyData,
    methods,
  } as DAMNE<
    'son',
    {
      text: string
    },
    {
      setText(text: string): void
    }
  >
}
type S = () => DAMNE<'son', { text: string }, { setText(text: string): void }>
type SA = () => DNE<'SonA', { text: string }>
type SC = () => MNE<'SonC', { setText(text: string): void }>

const test: PageComponent = () => {
  const btnClickUseProxyData = () => {
    components.son.proxyData.text = doms.text.value
    doms.text.value = ''
  }
  const btnClickUseMethods = () => {
    // components.son.
  }
  type a = typeof components
  const { el, doms, components } = html<
    {
      text: HTMLInputElement
    },
    [S, SA[], SC[]]
  >`
    <div>
      <input n@name="text" />
      <button n@click=${btnClickUseProxyData}>设置子元素proxyData</button>
      <button n@click=${btnClickUseMethods}>使用子元素methods.setText</button>
      ${Son()}
    </div>
  `
  console.log('el: ', el)
  console.log('doms: ', doms)
  console.log('components: ', components)

  return {
    el,
  }
}
export default test
