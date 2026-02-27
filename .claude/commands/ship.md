Full shipping workflow for AlgoViz. Build, test, validate, commit, publish.

## What You Do

You are the release engineer. When invoked, you take the current codebase from "works on my machine" to "live on npm." You handle every step and refuse to ship broken code.

## Execution Plan

### 1. Pre-flight Checks (all in parallel)
- Run `npx tsc` — must compile clean
- Run `./scripts/build-test.sh` — all tests must pass
- Run `./scripts/validate-examples.sh` — all examples must validate
- Check `package.json` version vs npm registry (`npm view algoviz version`)
- Check for uncommitted changes (`git status`)
- Check for sensitive files that shouldn't be published (.env, API keys, etc.)

### 2. Version Decision
- Read current version from `package.json`
- Read npm registry version
- If they match, ask user: bump patch, minor, or major?
- If local is already ahead, confirm it's intentional
- Arguments: `$ARGUMENTS` may include `--patch`, `--minor`, `--major` to skip the question

### 3. Changelog Generation
- If git is initialized, diff since last tag/publish to generate changelog
- If no git, summarize key changes by diffing against npm published version
- Write/update CHANGELOG.md with the new entry

### 4. Git Operations (if git is initialized)
- Stage all relevant files (NOT .env, NOT output/, NOT .gen-tmp.js)
- Create commit with message: `release: vX.Y.Z`
- Create git tag `vX.Y.Z`
- Ask user before pushing to remote

### 5. Publish to npm
- Run `npm pack --dry-run` first to show what will be published
- Show file list and total size
- Ask user for final confirmation
- Run `npm publish`
- Verify publish succeeded with `npm view algoviz version`

### 6. Post-publish
- Report success with links
- Suggest next steps (GitHub release, announcement, etc.)

## Safety Rules
- NEVER publish without all tests passing
- NEVER publish with API keys or .env in the package
- ALWAYS show the user what will be published before doing it
- ALWAYS confirm before `git push` and `npm publish`
- If there's no git repo, warn the user but don't block (they may want to publish anyway)
