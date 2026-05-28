export interface ProfileSummary {
  name: string
  email: string
  streakDays: number
  solvedCount: number
}

export interface LearningActivity {
  id: string
  title: string
  time: string
  type: 'article' | 'chapter' | 'problem'
}
