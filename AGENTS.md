<!-- graphify-rules-start (managed by `graphify init`) -->
## Use Graphify before grep

This repository is indexed by Graphify: a code graph over its call, dependency,
and test structure, exposed through a connected Graphify MCP server. Before
reaching for grep or reading files, use the Graphify tools your MCP client lists
(their exact names and descriptions are in the server's tool list) for what the
graph knows and a text search does not:

- find where a symbol, function, or class is defined (instead of grepping for it)
- understand how something works, or where a behavior is handled
- find who calls a function, or what it calls
- see what a change affects (its blast radius) and which tests cover it
- map a file's dependencies and dependents

Fall back to grep or file reads only for what the graph does not model: literal
string or comment matches, non-indexed files, or reading a file you have
already located. If no Graphify tools are listed, check the MCP server
connection.

<!-- graphify-rules-end -->

## Development automation

- After meaningful code changes, run `graphify . --update` when the Graphify CLI is available.
- Before commits, run `npm run lint`, `npm run test:unit`, and the relevant Playwright test or `npm test`.
- Use OmniRoute `auto/coding` for implementation work and `auto/cheap` for bounded analysis when OmniRoute is selected.
- Use the read-only `reviewer` subagent after each feature.
- Use `gh-fix-ci` when GitHub Actions reports a failure.
- Keep `graphify-out/`, Graphify temporary files, and all secrets out of commits.

## Feature branch and worktree workflow

For site changes, create a dedicated clean worktree under
`../3yeses-worktrees/<slug>` on a `feature/<area>-<slug>` branch before editing.
Inspect and preserve unrelated changes in the current worktree; never reset or
clean them without explicit authorization. Run tests in the feature worktree,
and do not merge or remove the worktree unless requested.
