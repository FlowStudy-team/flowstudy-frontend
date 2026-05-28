import type { LearningActivity, ProfileSummary } from '../../types/profile'

export async function fetchProfileSummary(): Promise<ProfileSummary> {
  await new Promise((resolve) => setTimeout(resolve, 260))
  return {
    name: 'Flow Learner',
    email: 'learner@flowstudy.dev',
    streakDays: 12,
    solvedCount: 28,
  }
}

export async function fetchRecentActivities(): Promise<LearningActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [
    { id: 'a1', title: 'Read chapter Architecture', time: '2026-05-28 09:15', type: 'chapter' },
    { id: 'a2', title: 'Solved p1001', time: '2026-05-28 10:12', type: 'problem' },
    { id: 'a3', title: 'Read article Async Queue', time: '2026-05-27 20:21', type: 'article' },
  ]
}
