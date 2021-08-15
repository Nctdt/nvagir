# Getting Started

## Prerequisites
1. init `vite` project with npm
> npm init vite@latest

2. select option `vanilla-ts` after, install dependency
> npm i

## installation
use npm
> npm i nvagir

## Documentation
first, write simple example.
```ts
// /src/pages/App.ts
import { html } from 'nvagir'

const { el } = html`
  <div>
    this is first App Page
  </div>
`
document.getElementById('app')!.append(el.dom)
```
`html` is a tag function, you can write HTML code as usual.

`html<D, C>` return property:
1. `el`: `{ sign, dom }`, 
   - `sign` is used to determine whether it is a component element.
   - `dom` is HTMLElement, that is the root HTMLElement.

2. `doms`: all captured DOM elements, 
   > `D extends Record<string, HTMLElement> = {}`, `doms` type is D

3. `components`: all components used
   > `C extends Readonly<Component | Component[]> = []`, `components` type is `TupleMap2NE<C>`

> note: `html` only return first root HTMLElement

Use `n@name="xxx"` to capture `HTMLElement`.

Modify the above example.
```ts
const { el, doms } = html<{
  sonBox: HTMLElement
}>`
  <div>
    this is first App Page
    <div n@name="sonBox">
      this is son Box
    </div>
  </div>
`
doms.sonBox.textContent // this is son Box
```

Now you can use `doms.sonBox` to do anything.

Use `n@event=${handlerEvent}` to bind event

Modify the above example.
```ts
const handlerClick = () => {
  console.log('clicked')
}
const { el, doms } = html<{
  sonBox: HTMLElement
}>`
  <div>
    this is first App Page
    <button n@click=${handlerClick}>click</button>
    <div n@name="sonBox">
      this is son Box
    </div>
  </div>
`
```
> `n@event=${handlerEvent}` equivalent to `dom.addEventLister(event, handlerEvent)`.

Use `reactive(data, reactiveFc)` to react to data changes

Modify the above example.
```ts
import { html, reactive } from 'nvagir'
const data = {
  text: 'this is son Box',
}
const handlerClick = () => {
  console.log('clicked')
  proxyData.text = doms.text.value
  doms.text.value = ''
}
const { el, doms } = html<{
  text: HTMLInputElement
  sonBox: HTMLElement
}>`
  <div>
    <input n@name="text" />
    <button n@click=${handlerClick}>modify text</button>
    <div n@name="sonBox">${data.text}</div>
  </div>
`

const proxyData = reactive(data, (p, data) => {
  switch (p) {
    case 'text':
      doms.sonBox.textContent = data.text
  }
})
```
In the above example, we input after, click button will change `sonBox` text content.

> `reactive(data, reactiveFc) => proxyData`: when we change proxyData, will call `reactiveFc(changePropName, changedData)`.

### Declare Page Component
Now encapsulate the above example.
```ts
import { html, PageComponent, reactive } from 'nvagir'

const App: PageComponent = () => {
  const data = {
    text: 'this is son Box',
  }
  const handlerClick = () => {
    console.log('clicked')
    proxyData.text = doms.text.value
    doms.text.value = ''
  }
  const { el, doms } = html<{
    text: HTMLInputElement
    sonBox: HTMLElement
  }>`
    <div>
      <input n@name="text" />
      <button n@click=${handlerClick}>modify text</button>
      <div n@name="sonBox">${data.text}</div>
    </div>
  `

  const proxyData = reactive(data, (p, data) => {
    switch (p) {
      case 'text':
        doms.sonBox.textContent = data.text
    }
  })
  return { el }
}
document.getElementById('app')!.append(App().el.dom)
export default App
```
> `PageComponent`: type is `() => { el }`, because this is page render component, i will introduce nvagir-router later.

### Declare Child Component
```ts
import { html, NE, PageComponent, reactive } from 'nvagir'

const Son = () => {
  const data = {
    text: 'this is son Box',
  }
  const { el, doms } = html<{
    sonBox: HTMLElement
  }>` <div n@name="sonBox">${data.text}</div> `

  const proxyData = reactive(data, (p, data) => {
    switch (p) {
      case 'text':
        doms.sonBox.textContent = data.text
    }
  })

  const component: NE<'son'> = {
    name: 'son',
    el,
  }
  return component
}

const App: PageComponent = () => {
  const handlerClick = () => {
    console.log('clicked')
    // proxyData.text = doms.text.value
    doms.text.value = ''
  }
  const { el, doms } = html<{
    text: HTMLInputElement
  }>`
    <div>
      <input n@name="text" />
      <button n@click=${handlerClick}>modify text</button>
      ${Son()}
    </div>
  `

  return { el }
}

document.getElementById('app')!.append(App().el.dom)

export default App

```
We declare a `Son` child component, but can not modify `Son` text, so we need change to following code to expose and modify `Son().proxyData`.
```ts
import { DNE, html, PageComponent, reactive } from 'nvagir'

const Son = () => {
  const data = {
    text: 'this is son Box',
  }
  const { el, doms } = html<{
    sonBox: HTMLElement
  }>` <div n@name="sonBox">${data.text}</div> `

  const proxyData = reactive(data, (p, data) => {
    switch (p) {
      case 'text':
        doms.sonBox.textContent = data.text
    }
  })

  const component: DNE<'son', typeof proxyData> = {
    name: 'son',
    el,
    proxyData,
  }
  return component
}

const App: PageComponent = () => {
  const handlerClick = () => {
    console.log('clicked')
    components.son.proxyData.text = doms.text.value
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
      <button n@click=${handlerClick}>modify text</button>
      ${Son()}
    </div>
  `

  return { el }
}

document.getElementById('app')!.append(App().el.dom)

export default App
```

Child-component will return `NE | DNE | MNE | DAMNE`
- `NE` is `NvagirElement` alias, and has `N` generic type. `NE<'son'>` same as `{ name: 'son', el }`
  > mean is child component
- `DNE` is `DataNvagirElement` alias, and has `N, D` generic type. `DNE<'son', typeof proxyData>` same as `{ name: 'son', el, proxyData }`
  > mean is child component and expose proxyData
- `MNE` is `MethodsNvagirElement` alias, and has `N, M` generic type. `MNE<'son', typeof methods>` same as `{ name: 'son', el, methods }`
  > mean is child component and expose methods
- `DAMNE` is `DataAndMethodsNvagirElement` alias, and has `N, D, M` generic type. `DAMNE<'son', typeof proxyData, typeof methods>` same as `{ name: 'son', el, proxyData, methods }`
  > mean is child component and expose proxyData and methods

That's all fundamental concepts and basic parent-child component communication.

### Re-render Child-Component
When we parent component data change, we probably need re-render child component, so let's write a basic demo to learn how to re-render child component.
```ts
import { html, NE, PageComponent, render } from 'nvagir'

const Son = (text = 'this is son Box') => {
  const data = {
    text,
  }
  const { el } = html` <div>${data.text}</div> `

  const component: NE<'son'> = {
    name: 'son',
    el,
  }

  return component
}

const App: PageComponent = () => {
  const handlerClick = () => {
    console.log('clicked')
    render(doms.sonBox, Son, components, doms.text.value)
    doms.text.value = ''
  }
  const { el, doms, components } = html<
    {
      text: HTMLInputElement
      sonBox: HTMLElement
    },
    [typeof Son]
  >`
    <div>
      <input n@name="text" />
      <button n@click=${handlerClick}>modify text</button>
      <div n@name="sonBox">${Son()}</div>
    </div>
  `

  return { el }
}

document.getElementById('app')!.append(App().el.dom)

export default App
```

We use `render` utility method to re-render we child component.

`render(target, childComponent, components, ...childComponentProps) => HTMLElement`
  - `target` indicates where to render
  - `childComponent` indicates you will re-render child component
  - `components` make the corresponding attribute of `components` point to the new component
  - `...childComponentProps` child component props
  - `=> HTMLElement` DOM element rendered on the page

We may also use several child components.

```ts
import { html, NE, PageComponent, render, renderMaps } from 'nvagir'

const Son = (text = 'this is son Box') => {
  const data = {
    text,
  }
  const { el } = html` <div>${data.text}</div> `

  const component: NE<'son'> = {
    name: 'son',
    el,
  }

  return component
}

const App: PageComponent = () => {
  const handlerClick = () => {
    console.log('clicked')
    renderMaps(doms.sonBox, Son, components, ...new Array(+doms.text.value))
    doms.text.value = ''
  }
  const { el, doms, components } = html<
    {
      text: HTMLInputElement
      sonBox: HTMLElement
    },
    [typeof Son[]]
  >`
    <div>
      <input n@name="text" />
      <button n@click=${handlerClick}>modify text</button>
      <div n@name="sonBox">${[Son()]}</div>
    </div>
  `

  return { el }
}

document.getElementById('app')!.append(App().el.dom)

export default App
```

`renderMaps(target, childComponent, components, ...childComponent[]) => HTMLElement[]`
 - The meaning of the parameters is similar to the render above.
