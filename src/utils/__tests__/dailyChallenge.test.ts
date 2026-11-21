import { getDailyChallenge, dailyCategories } from '../dailyChallenge'

describe('daily challenge', () => {
  it('is deterministic per UTC date and uses scored questions only', () => {
    const a = getDailyChallenge('2026-11-22')
    const b = getDailyChallenge('2026-11-22')
    expect(a.questions.map(q => q.id)).toEqual(b.questions.map(q => q.id))
    expect(a.questions).toHaveLength(5)
    expect(a.questions.every(q => q.correct_answer >= 0)).toBe(true)
    expect(dailyCategories()).toContain(a.category)
  })
  it('changes across dates', () => {
    const ids = new Set<string>()
    for (let d = 1; d <= 20; d++) ids.add(getDailyChallenge(`2026-12-${String(d).padStart(2, '0')}`).questions[0].id)
    expect(ids.size).toBeGreaterThan(3)
  })
})
