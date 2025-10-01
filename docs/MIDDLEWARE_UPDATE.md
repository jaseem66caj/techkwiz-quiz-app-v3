# Middleware Update

## Description

The `middleware.ts` file has been updated to allow access to test pages in a production environment. Previously, the middleware blocked access to any page with a URL starting with `/test-` when `NODE_ENV` was set to `production`. This change introduces a new environment variable, `NEXT_PUBLIC_ENABLE_TEST_PAGES`, which must be set to `'true'` to enable access to these pages.

## Reason for Change

This change was made to facilitate debugging and testing in a production-like environment. By enabling access to test pages, developers can verify functionality and diagnose issues on a live server without affecting the main application.

## Implementation

The middleware now checks for the `NEXT_PUBLIC_ENABLE_TEST_PAGES` environment variable. If the variable is not set to `'true'`, and the pathname starts with `/test-`, the user will be redirected to the homepage. Otherwise, access to the test page will be allowed.
