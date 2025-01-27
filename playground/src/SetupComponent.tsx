/* eslint-disable @typescript-eslint/no-unused-vars */

export const CounterA = defineSetupComponent(() => {
  let { modelValue } = defineModel<{
    modelValue: number
  }>()

  const updateCount = (val: number) => {
    // eslint-disable-next-line no-console
    console.log((modelValue = modelValue + val))
  }

  defineRender(() => (
    <>
      <h2>SetupComponent - CounterA</h2>
      <button onClick={() => updateCount(-1)}>-</button> {''}
      {modelValue} {''}
      <button onClick={() => updateCount(+1)}>+</button>
    </>
  ))
})

export const CounterB = defineSetupComponent(() => {
  let { modelValue } = defineModel<{
    modelValue: number
  }>()

  const updateCount = (val: number) => {
    // eslint-disable-next-line no-console
    console.log((modelValue = modelValue + val))
  }

  defineRender(() => (
    <>
      <h2>SetupComponent - CounterB</h2>
      <button onClick={() => updateCount(-1)}>-</button> {''}
      {modelValue} {''}
      <button onClick={() => updateCount(+1)}>+</button>
    </>
  ))
})
