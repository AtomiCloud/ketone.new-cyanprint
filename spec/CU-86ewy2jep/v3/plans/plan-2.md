# Plan 2: Iteratively test and fix all 32 test cases

Run the full test suite and fix any failing tests by updating snapshots or source templates.

## Process

For each test case, run it and handle the result:

1. Run `direnv exec . cyanprint test template --test <test_name> .`
2. **Pass** → move to next
3. **Fail** → classify and fix:
   - Snapshot mismatch → run `--update-snapshots` if the diff is expected (skills changed)
   - Nested validate fail → trace root cause back to source templates
4. Re-run to confirm fix

## Test order (all 32 cases)

4 artifacts x 4 languages x 2 skill variants = 32 tests.

For each, run: `direnv exec . cyanprint test template --test <test_name> .`

## Final verification

Run full suite: `direnv exec . cyanprint test template .`

All 32 must pass.
