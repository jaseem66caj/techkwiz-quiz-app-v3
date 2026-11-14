# Security and ads safety

No secret values belong in this file. Names of variables only.

## Environment and secrets

| Name | Notes |
| --- | --- |
| `NEXT_PUBLIC_*` | Bundled into the client. Never put a password, Sentry auth token, or API secret behind this prefix |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional override for the Play GA4 id. Must match `G-` + alphanumerics. The fallback in `src/config/site.ts` is the Play property. Do not point it at the blog stream |
| `NEXT_PUBLIC_ANALYTICS_ID` | Legacy. `site.ts` does not read it. `.env.example` says the Vercel value may still be the blog stream |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | Unused while `AdBanner` returns null. The public publisher id is already in `public/ads.txt` |
| `NEXT_PUBLIC_ENABLE_ADSENSE` | Flag in `appConfig.ts`. Turning the flag on does not by itself render a safe ad. `AdBanner` ignores it and returns null |
| `NEXT_PUBLIC_SENTRY_DSN` | Client DSN. Set in the host, not in git |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | Build-time source-map upload. Server/CI only |
| `ADMIN_PASSWORD_HASH` | Commented in `.env.example`. There is no server admin login |
| `NEXT_PUBLIC_ENABLE_TEST_PAGES` | When not `true`, `src/middleware.ts` redirects `/test-*` to `/` |

Gitignore covers `.env`, `.env.local`, `.env.*.local`, `.env.test`, `*token.json*`, `*credentials.json*`, `*.pem`. It does **not** list `.env.production`. The GitHub workflow writes that file on the runner. Do not commit it. Do not commit `.env.example` with real tokens; the tracked examples use placeholders such as `G-XXXXXXXXXX` and `ca-pub-your-publisher-id`.

`vercel.json` sets `NODE_ENV=production` for the Vercel build. It does not contain secrets.

## Auth

There is no server session.

- `src/utils/auth.ts` stores one user at `localStorage` key `techkwiz_user` (id, display name, avatar id, coins, level, quiz history, streak).
- `getCurrentUser()` creates a guest (`id: 'guest'`, 0 coins) when nothing is stored. `providers.tsx` can also create `guest_${Date.now()}`.
- `login(email, password)` ignores both arguments and returns the current user. `signup` ignores email and password, writes a local user, and grants 100 welcome coins. The homepage profile form does not call `signup`; it keeps the coins already earned.
- Username on `CreateProfile` is trimmed and marked `required`. There is no max length, charset filter, or server check.
- `src/utils/twoFactorAuth.ts` can generate a TOTP-like secret and store it in `localStorage` (`admin_2fa_setup`, `admin_2fa_data`). The QR image is a canvas that says “QR Code”. This is not an admin control. Do not build a real login on top of it. Do not log those keys.
- `robots.ts` disallows `/admin/` and `/private/`. There is no `src/app/admin` route.

`ErrorBoundary` may send `user.id` and `user.name` from `techkwiz_user` to Sentry. Do not put emails or secrets into that object.

## Input validation

- Quiz answers are option indexes handled in the quiz page, not free text posted to an API.
- The only route handler is `GET src/app/api/health/route.ts`. It returns status, timestamp, `NEXT_PUBLIC_APP_VERSION` or `8.0.0`, and `NODE_ENV`. No body is accepted.
- Quiz JSON imports go through `quizDataManager` (`MAX_FILE_SIZE` 5 MB) into localStorage. Treat imported question text as content, not as HTML to inject. The legal and landing pages render strings as React text, which escapes HTML.
- No schema library (no Zod) is installed.

## Rate limiting

`DEFAULT_SECURITY_SETTINGS.rateLimiting` in `src/types/settings.ts` is 60 requests/minute, burst 10, block 300000 ms. `settingsDataManager.ts` only normalizes that object in localStorage. No middleware or route reads it. `/api/health` is unlimited. Do not describe this as protection that is already on.

`twoFactorAuth.ts` counts failed attempts in localStorage (`admin_2fa_failed_attempts`, lock key). That counter is on the client and is not a server lockout.

## Sensitive data

| Data | Where | Rule |
| --- | --- | --- |
| Display name, coins, quiz history | `localStorage` `techkwiz_user` | Device-local. Clearing site data deletes it. Do not sync it to a new backend without a review |
| Reward and settings blobs | `admin_reward_config`, `admin_*` keys | Same browser store. Homepage SSG calls the reward reader and logs `localStorage is not defined`; do not “fix” that by embedding production config into the bundle |
| Analytics | GA4 via `PlayGa4` (`gtag`, `afterInteractive`) | Disclose it, as `/privacy` already does, including the measurement id |
| Errors | Sentry, tunnel route `/monitoring` | No tokens in `captureException` context |
| Ads | Not rendered | Privacy page states ads are not currently displayed and includes the Google cookie sentences |

Do not add a second analytics tag. `GoogleAnalytics.tsx` still exists beside `PlayGa4`. Check both before adding another gtag snippet.

## Headers and cookies

`next.config.js` `headers()` sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin` on `/(.*)`. There is no Content-Security-Policy in that function. `poweredByHeader` is false. This audit did not find a cookie-consent banner component. Owner policy: personalized ads in the EEA, UK, or Switzerland need a Google-certified CMP, which Jaseem turns on in the AdSense UI. Do not invent a CMP banner in a random PR.

## Ads and policy safety

- `public/ads.txt` must stay `text/plain`, one authorized line, publisher `pub-9542222034675291`. Do not add a second publisher id.
- `AdBanner` returns `null` on purpose. Call sites (`leaderboard`, `profile`) pass a slot name; that does not reserve height, because the component renders nothing. Before any future ads-on change, reserve the slot and keep it out of the nav.
- Do not hide, clip, resize, or cover a rendered unit. Do not auto-refresh ads. Do not label them with anything other than “Advertisements” or “Sponsored Links”.
- `trackAdView` returns 0 unless `adSettings.enabled` and status is `'viewed'`. Do not credit coins from a click handler.
- `RewardedAdOptIn` returns null while ads are off. A later reward is in-game coins only, after `adBreak({ type: 'reward' })` / `adViewed`, with a skip path.
- Insufficient coins must keep routing to the homepage quiz (`src/app/quiz/[category]/page.tsx`), not to an ad.
- Do not click live ads, script clicks, or add “support us” copy. See `docs/ai/VOICE.md`.
- Monetized pages need real publisher content. Do not put ads on a spinner, an empty state, or a wall whose only exit is an ad.
- Site is 13+. Do not add flows aimed at children.

AdSense Management API calls, if any agent is given a token later, are read-only. Account settings stay in the AdSense UI.
