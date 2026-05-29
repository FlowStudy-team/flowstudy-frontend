import type { OJLanguage } from '../types/oj'

const DRAFT_PREFIX = 'flowstudy:draft'

function key(problemId: string, language: OJLanguage) {
  return `${DRAFT_PREFIX}:${problemId}:${language}`
}

export function loadCodeDraft(problemId: string, language: OJLanguage): string | null {
  return localStorage.getItem(key(problemId, language))
}

export function saveCodeDraft(problemId: string, language: OJLanguage, code: string): void {
  localStorage.setItem(key(problemId, language), code)
}

export function clearCodeDraft(problemId: string, language: OJLanguage): void {
  localStorage.removeItem(key(problemId, language))
}

