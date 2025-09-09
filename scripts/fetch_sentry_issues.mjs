#!/usr/bin/env node
/*
  Fetch Sentry issues for the last 7 days and latest event details per issue.
  Reads env:
    - SENTRY_AUTH_TOKEN (required)
    - SENTRY_ORG (required)
    - SENTRY_API_BASE (optional, default https://sentry.io)
  Writes:
    - sentry_issues_7d.json (issues list)
    - sentry_events_7d.json (map of issue.id -> latest event)
*/

const fs = await import('fs');

const TOKEN = process.env.SENTRY_AUTH_TOKEN;
const ORG = process.env.SENTRY_ORG;
const API_BASE = process.env.SENTRY_API_BASE || 'https://sentry.io';

if (!TOKEN || !ORG) {
  console.error('Missing SENTRY_AUTH_TOKEN or SENTRY_ORG');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} for ${url}: ${text}`);
  }
  return res.json();
}

async function main() {
  // Fetch issues from the last 7 days; errors only
  const issuesUrl = `${API_BASE}/api/0/organizations/${encodeURIComponent(ORG)}/issues/?statsPeriod=7d&query=event.type:error&expand=owners&limit=50`;
  const issues = await fetchJSON(issuesUrl);
  fs.writeFileSync('sentry_issues_7d.json', JSON.stringify(issues, null, 2));

  const events = {};
  for (const issue of issues) {
    try {
      const eventUrl = `${API_BASE}/api/0/issues/${issue.id}/events/latest/`;
      const event = await fetchJSON(eventUrl);
      events[issue.id] = event;
    } catch (e) {
      events[issue.id] = { error: String(e) };
    }
  }
  fs.writeFileSync('sentry_events_7d.json', JSON.stringify(events, null, 2));

  // Print a concise summary to stdout
  console.log(`Fetched ${issues.length} issues. Details saved to sentry_issues_7d.json and sentry_events_7d.json`);
  for (const issue of issues) {
    const evt = events[issue.id];
    const title = issue.title;
    const level = issue.level;
    const count = issue.count;
    const url = issue.permalink || `${API_BASE}/organizations/${ORG}/issues/${issue.id}`;
    console.log(`- [${level}] ${title} (events: ${count}) -> ${url}`);
  }
}

main().catch(err => {
  console.error('Failed to fetch Sentry issues:', err);
  process.exit(1);
});

