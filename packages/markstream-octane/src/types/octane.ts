import type { OctaneNode } from 'octane'
import type { Octane } from 'octane/jsx-runtime'

export type OctanePropsWithChildren<P> = P & {
  children?: OctaneNode
}

export interface OctaneRefObject<T> {
  current: T
}

export type OctaneStyle = Exclude<
  Octane.JSX.IntrinsicElements['div']['style'],
  string | undefined
>

export type OctaneHeadingAttributes = Octane.JSX.IntrinsicElements['h1']
export type OctaneSpanAttributes = Octane.JSX.IntrinsicElements['span']
