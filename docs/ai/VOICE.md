# Voice — from the copy that ships

Two registers exist. Use the one the surface already uses. Do not mix legal plainness into the quiz chrome, and do not put quiz slang on legal or SEO pages.

## Personality

TechKwiz Play is a short, free quiz in the browser. The host is direct and a bit playful during a round, and plain on pages that explain the site. It is not a children’s brand, not a casino, and not a “support us by clicking” publisher. Coins are a game score.

Audience in landings: “Developers and students”, “Anyone who wants a quick trivia round”, “People who follow entertainment”. Age floor is 13+. Do not add baby talk, school-kid mascots, or “hey bestie”.

## UI copy that is already live

| Surface | Pattern | Example |
| --- | --- | --- |
| Home / landings | One or two short sentences. State the mechanic | “Short, free quizzes in the browser.” “Each category round draws five questions from that quiz’s bank.” “Coins are virtual and are not cash.” |
| Landing eyebrow | Three words, sentence case in the string but rendered uppercase | “Technical quiz”, “Personality quiz”, “Trivia quiz” |
| Landing FAQ | Same answers everywhere they apply | “Yes. You can play in the browser without paying.” “No. You can play as a guest.” |
| About | Name the categories from data. Disclose AI when relevant | “Some drafts may be prepared with AI assistance and checked before they go live.” |
| Contact | One mailbox, no fake address | “We do not publish a business street address. Please use the email above.” |
| Quiz chrome | Short, emoji, second person | “Question {n} of {total}”, “Wallet:”, “Earned:”, “Vibe Check!”, “Level Up!” |
| Encouragement (`UnifiedQuizInterface`) | Four to six words | “Just getting started!”, “You’re doing great!”, “Almost there!”, “Final question!” |
| Reward strings (`DEFAULT_REWARD_CONFIG`) | Name the coins | “Great job! You earned {coins} coins!” “Better luck next time!” “Bonus! You earned {coins} extra coins!” |
| Profile | Tell them what is saved | “Pick a username and an avatar to save your progress.” |
| Exit guard | Say what is lost | “Are you sure you want to leave? Your progress will be lost!” |

Category card blurbs are looser than landings (“Discover your vibe”, “Decode trends and viral moments”, “Lightning-fast knowledge battles”). New landing paragraphs should follow `quizLandings.ts`, not those blurbs.

## Errors

| Case | Copy in code | Keep |
| --- | --- | --- |
| React error boundary | “Oops! Something went wrong” / “Try Again” / “Go Home”. Dev-only `<details>` labeled “Error Details (Development Only)” | Say something failed. Do not dump stack traces in production UI |
| Root `global-error.tsx` | “Something went wrong!” / “Try again” / “Go home” | Same idea, lower case on the buttons |
| Quiz load failure | `err.message` or “Failed to load quiz”, button “Back to Categories” | Prefer a specific sentence over a code |
| Not enough coins | “Insufficient coins”. “Taking you to the homepage quiz where you can earn coins for free!” Button “Go to Homepage Quiz Now” | Send them to a real quiz, never to an ad |
| Health API | JSON `status: 'error'`, `message: 'Health check failed'` | Machine-readable, no marketing |

“Our team has been notified” is already on the error boundary. Leave it only where Sentry actually captures the error (`ErrorBoundary`, `global-error.tsx`). Do not add that sentence to validation mistakes.

## Rules for new strings

- Say “virtual” and “not cash” whenever coins could be read as money. The privacy page and homepage already do this.
- Personality quizzes: “There is no single correct answer, and the result is for fun — it is not a psychological assessment.”
- Sample questions on landings must say a live round may not include them (`QuizLanding.tsx`).
- Button labels are verbs: “Play this quiz”, “Try Again”, “Go Home”, “Browse the quiz catalog”.
- Dates on legal pages come from `LEGAL_LAST_UPDATED`, written “13 November 2026”.

## Banned

Do not add these, including in button text, empty states, or meta descriptions:

- “click the ads”, “support us”, “visit these links”, “help keep this site running”, “feel free to click”
- Any reward for clicking or for an impression. “Watch this ad to get coins” is only allowed later, on a real H5 opt-in, and is not the default
- “We tested this on a real device” unless a person did
- Fake social proof. `SocialProofBanner` invents names (“Sarah just earned 150 coins”) and a rising user count starting at 847362. It is unmounted. Do not wire it up or copy that pattern
- Invented mailboxes, street addresses, or “our office”
- Buzzwords that are not in the live landings: leverage, seamless, unlock your potential, next-gen, game-changing, revolutionary, cutting-edge, synergy, empower, delight, robust, supercharge
- Clickbait titles or “you won’t believe”

Emojis belong in the quiz chrome and category icons. They do not belong in privacy, terms, ads.txt, or meta descriptions (`DEFAULT_DESCRIPTION` has none).
