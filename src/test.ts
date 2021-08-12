import { html, Component, reactive } from './nvagir'
import { DAMNE, DNE, PageComponent } from './typings/nvagir-element'

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
  } as DAMNE<'son', SonData, typeof methods>
}

const test: PageComponent = () => {
  const btnClickUseProxyData = () => {
    components.son.proxyData.text = doms.text.value
    doms.text.value = ''
  }
  const btnClickUseMethods = () => {
    components.son.methods.setText(doms.text.value)
    doms.text.value = ''
  }
  const { el, doms, components } = html<
    {
      text: HTMLInputElement
    },
    [typeof Son]
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
