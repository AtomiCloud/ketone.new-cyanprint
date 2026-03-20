# Plan 3: Run all 32 tests and fix snapshots

Run the full test suite and fix any failing tests by updating snapshots or source templates.

## Process

For each test case:

1. Run `direnv exec . cyanprint test template --test <test_name> .`
2. **Pass** → move to next
3. **Fail** → classify and fix:
   - Snapshot mismatch → run `--update-snapshots` if the diff is expected
   - Nested validate fail → trace root cause back to source templates
4. Re-run to confirm fix

## Final verification

Run full suite: `direnv exec . cyanprint test template .`

All 32 must pass.
