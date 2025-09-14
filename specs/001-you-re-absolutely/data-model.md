# Data Model: Interactive Technology Quiz Platform (Client-Side Only)

## Entities

### Quiz
Represents a collection of questions in a specific category.

**Attributes**:
- `category` (string): The name of the quiz category.
- `questions` (array of `Question`): The questions in the quiz.

### Question
Represents a single quiz question.

**Attributes**:
- `question` (string): The text of the question.
- `options` (array of strings): The possible answers to the question.
- `answer` (string): The correct answer.
- `timeLimit` (number): The time limit for the question in seconds.

### User
Represents a player.

**Attributes**:
- `name` (string): The name of the user.
- `coins` (number): The number of coins the user has.
- `streak` (number): The user's current streak.

### Reward
Represents coins or other awards given to the user.

**Attributes**:
- `amount` (number): The amount of the reward.
- `reason` (string): The reason for the reward (e.g., "correct answer", "quiz completion").
