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
