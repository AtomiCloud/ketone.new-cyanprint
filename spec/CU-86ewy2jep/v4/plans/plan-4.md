# Plan 4: Update snapshots and run tests

## Snapshot updates

After modifying source skills in plans 1-3, regenerate affected snapshots:

1. Run `cyanprint test template . --update-snapshots` for all 16 template test cases
2. Verify all 32 tests pass with `cyanprint test template .`

## Affected snapshots

- All 8 `*_with_skills` snapshots (contain skill files)
- All 8 `*_no_skills` snapshots (contain skill files)
- Any snapshot whose diff includes documenting-template, documenting-resolver, testing-template, testing-resolver, writing-template-_, or writing-resolver-_
