// ===================================================================
// TechKwiz Personality Quiz Scoring Model
// ===================================================================
// Personality questions have no correct answer (correct_answer is -1).
// Each answer maps to one of four outcomes; the outcome with the most
// answers wins. Ties go to the outcome that was picked first.

export interface PersonalityOutcome {
  // Unique identifier for the outcome
  id: string
  // Result title shown to the player
  title: string
  // Emoji icon for the result
  icon: string
  // One-sentence description of the result
  description: string
}

export interface PersonalityModel {
  // The four possible results for the category
  outcomes: PersonalityOutcome[]
  // For each question id, the outcome id for each option index
  answerMap: Record<string, string[]>
}

export const PERSONALITY_MODELS: Record<string, PersonalityModel> = {
  'swipe-personality': {
    outcomes: [
      { id: 'cozy-dreamer', title: 'Cozy Dreamer', icon: '📚', description: 'You recharge in calm, thoughtful spaces and pick your moments carefully.' },
      { id: 'social-spark', title: 'Social Spark', icon: '🎉', description: 'You light up a room and bring people together.' },
      { id: 'trend-setter', title: 'Trendsetter', icon: '🚀', description: 'You love being first and making things happen your way.' },
      { id: 'free-explorer', title: 'Free Explorer', icon: '🌲', description: 'You chase fresh experiences and tell your own story.' }
    ],
    answerMap: {
      swipe_001: ['cozy-dreamer', 'social-spark', 'trend-setter', 'free-explorer'],
      swipe_002: ['cozy-dreamer', 'social-spark', 'trend-setter', 'free-explorer'],
      swipe_003: ['trend-setter', 'social-spark', 'cozy-dreamer', 'free-explorer'],
      swipe_004: ['trend-setter', 'cozy-dreamer', 'social-spark', 'free-explorer'],
      swipe_005: ['cozy-dreamer', 'trend-setter', 'social-spark', 'free-explorer']
    }
  },
  'social-identity': {
    outcomes: [
      { id: 'aesthetic-curator', title: 'Aesthetic Curator', icon: '📸', description: 'You shape a look and a mood that people remember.' },
      { id: 'knowledge-guide', title: 'Knowledge Guide', icon: '🧠', description: 'You share what you know and go deep on what matters.' },
      { id: 'entertainer', title: 'Entertainer', icon: '😂', description: 'You make people laugh and keep feeds fun.' },
      { id: 'authentic-connector', title: 'Authentic Connector', icon: '💝', description: 'You build real connections by being yourself.' }
    ],
    answerMap: {
      social_001: ['aesthetic-curator', 'knowledge-guide', 'entertainer', 'authentic-connector'],
      social_002: ['aesthetic-curator', 'authentic-connector', 'entertainer', 'knowledge-guide'],
      social_003: ['aesthetic-curator', 'entertainer', 'authentic-connector', 'knowledge-guide'],
      social_004: ['aesthetic-curator', 'knowledge-guide', 'entertainer', 'knowledge-guide'],
      social_005: ['authentic-connector', 'entertainer', 'knowledge-guide', 'aesthetic-curator']
    }
  }
}

// Score a personality quiz.
// Parameters:
// - categoryId: 'swipe-personality' or 'social-identity'
// - answers: array of { questionId, optionIndex } in the order answered
// Returns: the winning PersonalityOutcome, or null if the category has no model or no valid answers
export const scorePersonality = (
  categoryId: string,
  answers: { questionId: string; optionIndex: number }[]
): PersonalityOutcome | null => {
  const model = PERSONALITY_MODELS[categoryId]
  if (!model) return null

  const scores: Record<string, number> = {}
  const firstSeen: string[] = []
  for (const answer of answers) {
    const outcomeId = model.answerMap[answer.questionId]?.[answer.optionIndex]
    if (!outcomeId) continue
    if (!(outcomeId in scores)) {
      scores[outcomeId] = 0
      firstSeen.push(outcomeId)
    }
    scores[outcomeId] += 1
  }
  if (firstSeen.length === 0) return null

  // Highest score wins; on a tie the earliest-picked outcome wins
  let winner = firstSeen[0]
  for (const id of firstSeen) {
    if (scores[id] > scores[winner]) winner = id
  }
  return model.outcomes.find(o => o.id === winner) || null
}
