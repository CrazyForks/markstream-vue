import type { MarkdownToken } from '../types'

export type SyntheticLinkOrigin = 'autolink' | 'explicit' | 'linkify' | 'recovery'

const syntheticLinkOrigins = new WeakMap<object, SyntheticLinkOrigin>()
const cacheStableLinkValidators = new WeakSet<(url: string) => boolean>()

export function setSyntheticLinkOrigin<T extends object>(token: T, origin: SyntheticLinkOrigin): T {
  syntheticLinkOrigins.set(token, origin)
  return token
}

export function readSyntheticLinkOrigin(token: MarkdownToken): SyntheticLinkOrigin | undefined {
  return syntheticLinkOrigins.get(token)
}

export function registerCacheStableLinkValidator(validateLink: (url: string) => boolean) {
  cacheStableLinkValidators.add(validateLink)
}

export function isCacheStableLinkValidator(validateLink: ((url: string) => boolean) | undefined) {
  return validateLink === undefined || cacheStableLinkValidators.has(validateLink)
}
