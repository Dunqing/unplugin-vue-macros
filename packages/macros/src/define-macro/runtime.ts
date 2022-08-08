import { computed, getCurrentInstance } from 'vue'

export const defineVModel = <T>(propKey: string) => {
  const { props, emit } = getCurrentInstance()!
  return computed<T>({
    get: () => props[propKey] as T,
    set: (value) => emit(`update:${propKey}`, value),
  })
}
