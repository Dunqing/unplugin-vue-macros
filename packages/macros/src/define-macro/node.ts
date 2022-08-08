import { isStringLiteral } from '@babel/types'
import { inferRuntimeType } from './utils'
import type { CustomMacro } from './impl'

export const defineVModel: CustomMacro = {
  name: 'defineVModel',
  processor: ({ component, args, typeArgs }) => {
    if (!isStringLiteral(args[0])) throw new Error('prop name must be a string')

    const propKey = args[0].value
    const eventKey = `update:${propKey}`

    component.props ||= {}
    component.props[propKey] = typeArgs[0]
      ? `[${inferRuntimeType(typeArgs[0]).join(', ')}]`
      : 'null'
    component.emits ||= {}
    component.emits[eventKey] = '() => true' // don't validate now

    return component
  },
}
