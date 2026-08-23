import { request } from '../request'

export interface DailyActivity { date: string; count: number }
export interface LearningOverview {
  submissionCount: number
  acceptedSubmissionCount: number
  solvedProblemCount: number
  learningDays: number
  streakDays: number
  readingActivity: DailyActivity[]
  submissionActivity: DailyActivity[]
}

export interface UserProfile {
  userId: number
  abilityJson: string | null
  weakPointsJson: string | null
  codingStyleJson: string | null
  summaryMd: string | null
  updatedAt: string | null
}

export interface LearningNote {
  id: number
  title: string
  contentMd: string
  source: string
  status: string
  createdAt: string
}

export function fetchLearningOverview(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate })
  return request<LearningOverview>(`/learning/overview?${params.toString()}`)
}

export function recordLearningEvent(payload: {
  eventType: string
  resourceType?: string
  resourceId?: number
  durationSeconds?: number
  extraJson?: string
}) {
  return request<void>('/learning/events', { method: 'POST', body: JSON.stringify(payload) })
}

export function fetchLearningProfile() {
  return request<UserProfile | null>('/learning/profile')
}

export function analyzeLearningProfile() {
  return request<UserProfile>('/learning/profile/analyze', { method: 'POST', body: '{}' })
}

export function fetchLearningNotes() {
  return request<LearningNote[]>('/learning/notes')
}

export function createLearningNote(title: string, contentMd: string) {
  return request<LearningNote>('/learning/notes', {
    method: 'POST',
    body: JSON.stringify({ title, contentMd }),
  })
}
