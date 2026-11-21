import { scorePersonality, PERSONALITY_MODELS } from '@/data/personalityOutcomes'
import { QUIZ_DATABASE } from '@/data/quizDatabase'

describe('personality scoring', () => {
  it('maps every personality question option to a known outcome', () => {
    for (const [categoryId, model] of Object.entries(PERSONALITY_MODELS)) {
      const ids = model.outcomes.map(o => o.id)
      for (const q of QUIZ_DATABASE[categoryId]) {
        expect(model.answerMap[q.id]).toHaveLength(q.options.length)
        model.answerMap[q.id].forEach(id => expect(ids).toContain(id))
      }
    }
  })

  it('picks the most common outcome', () => {
    const result = scorePersonality('swipe-personality', [
      { questionId: 'swipe_001', optionIndex: 1 },
      { questionId: 'swipe_002', optionIndex: 1 },
      { questionId: 'swipe_003', optionIndex: 0 }
    ])
    expect(result?.id).toBe('social-spark')
  })

  it('breaks ties by earliest pick and handles bad input', () => {
    const tie = scorePersonality('social-identity', [
      { questionId: 'social_001', optionIndex: 2 },
      { questionId: 'social_002', optionIndex: 0 }
    ])
    expect(tie?.id).toBe('entertainer')
    expect(scorePersonality('programming', [])).toBeNull()
    expect(scorePersonality('social-identity', [{ questionId: 'x', optionIndex: 9 }])).toBeNull()
  })
})
