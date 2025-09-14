---
type: "always_apply"
---

## A. Global Rules
- **Full access is assumed:** entire codebase, logs, configs, and environments.
- **Detect stack from code:** infer language(s), frameworks, platforms, and key dependencies before acting.
- **Minimal change principle:** fix with the smallest, safest, reversible edit.
- **Safe assumptions allowed:** only low-risk, reversible assumptions/workarounds; record them explicitly.
- **Always log:** choose the most effective method available (Git commits + markdown log + inline comments).
- **Default to safety:** if uncertain at any point → **switch to SAFE MODE**.

---

## B. Decision Logic – Which Mode to Use?

### Mode Decision Flowchart (Styled List)
**Q1:** Is there a live production outage or severe impact (SEV-1)?  
- **YES** → Use **EMERGENCY FIX MODE** (Section E)  
- **NO** → Go to Q2  

**Q2:** Is the root cause 100% clear (file/line, failing logic) before editing?  
- **NO** → Use **SAFE MODE** (Section D)  
- **YES** → Go to Q3  

**Q3:** Will the fix be ≤ 5 lines (or equivalent minimal change)?  
- **NO** → Use **SAFE MODE** (Section D)  
- **YES** → Go to Q4  

**Q4:** Any risk to security, performance, or core functionality?  
- **YES** → Use **SAFE MODE** (Section D)  
- **NO** → Go to Q5  

**Q5:** Is the issue isolated (single module) AND tests exist for it?  
- **YES** → Use **QUICK EXECUTION MODE** (Section C)  
- **NO** → Use **SAFE MODE** (Section D)  

**Default Rule:** If at any point you are unsure → **SAFE MODE**.

---

## C. QUICK EXECUTION MODE *(simple, low-risk fixes)*

**Action → Details → Success Criteria**

1. **Access & Identify** → Read code/logs; confirm stack and location. → You know exactly where and what fails.  
2. **Reproduce & Diagnose** → Trigger error in dev/staging; confirm cause. → Error reproducible; cause pinpointed.  
3. **Plan Safe Fix** → Choose the smallest safe change. → Plan documented; low risk.  
4. **Apply Fix** → Branch/backup; edit minimal lines; add brief comments. → Change is reversible and isolated.  
5. **Test Fix** → Re-run failing steps; run related/regression tests. → Error gone; no side effects.  
6. **Log & Commit** → Clear commit (“what + why”); update tracker/log. → Traceable history exists.  
7. **Monitor** → Watch logs/metrics post-deploy; confirm with users/testers. → Stable for one normal cycle.

---

## D. SAFE MODE *(complex or risky fixes)*

**Action → Details → Output Required**

1. **Access & Identify**  
   - Confirm full access (code/logs/configs).  
   - Detect stack (languages, frameworks, dependencies).  
   - **Output:** recorded stack + likely impacted modules.

2. **Reproduce & Diagnose**  
   - Set safe env (dev/staging).  
   - Capture message, stack trace, relevant variable states.  
   - Trace back to root cause line(s).  
   - **Output:** step-by-step repro; file:line; plain-English cause.

3. **Plan Safe Fix**  
   - If clear: write exact logic change.  
   - If unclear: produce ≥2 hypotheses; define a low-risk reversible fix for each; pick safest.  
   - **Output:** written plan + why it’s safe.

4. **Apply Fix**  
   - Create branch/backup.  
   - Edit only necessary lines.  
   - Comment why/when to revisit if temporary.  
   - **Output:** paths + lines changed; before/after snippets.

5. **Test Fix**  
   - Re-run original scenario; then related features; then regression tests.  
   - Watch logs for new warnings/errors.  
   - **Output:** pass/fail for each; any new issues listed.

6. **Log Changes**  
   - Commit with clear message (what/why/reference).  
   - Update tracker/log (summary, root cause, fix, tests).  
   - **Output:** commit text; log location/ID.

7. **Monitor**  
   - Deploy fix.  
   - Monitor one full operational cycle; confirm with stakeholders/users.  
   - Add alerts for recurrence.  
   - **Output:** stability confirmation; stakeholder confirmation.

8. **Safeguards**  
   - No unrelated edits; validate security & performance; rollback ready.  
   - **Output:** brief risk assessment (sec/perf/stability OK).

9. **Continuous Improvement**  
   - Add tests/linting/monitoring; search for similar patterns; document lessons.  
   - **Output:** list of preventions + doc link/path.

---

## E. EMERGENCY FIX MODE *(critical live outage only)*

**Use when:** production down/severely degraded and immediate restoration is required.

1. Confirm scope (this issue causes the outage).  
2. Snapshot/backup affected file(s) or system state.  
3. Choose the quickest safe temporary change to restore service.  
4. Apply minimal code/config change.  
5. Restart/reload services if needed.  
6. Smoke-test core user paths (login, checkout, API heartbeat, etc.).  
7. Announce restoration to stakeholders/monitoring channel.  
8. Log change immediately (time, file, diff, reason).  
9. Transition to **SAFE MODE** to create permanent fix.  
10. Deploy permanent fix and remove temporary patch.

**Exit when:** service stable, permanent fix in place, monitoring clean for one cycle.

---

## F. Mode Transitions & Escalation
- **Quick → Safe:** switch immediately if:  
  - New risk appears  
  - Change grows >5 lines  
  - Tests missing  
  - Multiple modules touched  
- **Emergency → Safe:** after service restoration; never remain on a temporary patch.  
- **Safe → Quick:** only if the fix reduces to a trivial, fully-tested change with zero risk.  
- **At any uncertainty:** escalate to **SAFE MODE**.

---

## G. Unified Outputs & Logging
- **Stack Detection:** languages/frameworks/platforms/deps list.  
- **Repro Package:** steps, inputs, environment notes, observed error text/trace.  
- **Fix Plan:** chosen approach + safety rationale; alternatives if applicable.  
- **Code Diff:** exact files/lines; before/after; comments for temp workarounds.  
- **Test Report:** original scenario + related + regression results; log excerpt if relevant.  
- **Commit/Change Log:** clear message (“what & why”); tracker/ticket update.  
- **Monitoring Note:** post-deploy status, any alerts/metrics; stakeholder confirmation.  
- **Prevention List:** new tests, rules, monitors, or refactors queued/completed.

---

## H. Safety Gates *(auto-route to SAFE MODE)*
- Database schema changes or migrations.  
- Dependency upgrades/downgrades, build toolchain edits.  
- Authentication/authorization, payment, PII handling.  
- Cross-module or cross-service impacts.  
- Performance-critical paths, caching, or concurrency changes.  
- Anything requiring feature flags or config toggles in production.

---

## I. End-of-Task Checklist *(do not mark complete until all are true)*
- [ ] Error no longer reproducible in target environment.  
- [ ] Related/regression tests pass; no new warnings/errors.  
- [ ] Commit + tracker/log updated; inline comments added where needed.  
- [ ] Post-deploy monitoring clean for one operational cycle.  
- [ ] Stakeholders/users confirm resolution (if user-visible).  
- [ ] Prevention measures added or scheduled (tests/lint/monitoring).  
- [ ] Temporary patches removed or clearly documented with removal criteria.