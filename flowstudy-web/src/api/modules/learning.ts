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
