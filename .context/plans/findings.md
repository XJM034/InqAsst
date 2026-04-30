**Findings**

1. `matchedInternalTeacher` is not tied to the current phone value in [external-teacher-client.tsx](/Users/minxian/conductor/workspaces/inqasst/bordeaux/components/app/external-teacher-client.tsx:199). When the user changes from one valid 11-digit phone to another, the old match stays visible until the new lookup returns, and the submit guard only checks `matchedInternalTeacher` at [line 266](/Users/minxian/conductor/workspaces/inqasst/bordeaux/components/app/external-teacher-client.tsx:266). This can briefly block a valid external phone with the previous teacher’s warning, or allow a newly typed internal-teacher phone to reach the confirm dialog before the lookup lands. Store the phone alongside the match and only trust it when it equals the current normalized phone; ideally track lookup-pending for valid phones before allowing submit.

2. The new `q` prefill path can leave the teacher selection page stuck showing `搜索中...`. In [select-teacher/client.tsx](/Users/minxian/conductor/workspaces/inqasst/bordeaux/app/admin/emergency/course/[courseId]/select-teacher/client.tsx:68), the debounce timer sets `isRefreshing` when `hasLoadedRef.current` is true, even if `searchQuery.trim()` equals the existing `debouncedSearchQuery`. If the initial `q` load finishes within 250ms, the timer flips refreshing on but no new fetch runs to clear it. Skip the refresh state when the debounced value is unchanged.

**Verification**

`npm test` passed: 150 tests passed, 3 skipped.  
`npm run lint` passed with 0 errors and 41 warnings in the existing warning baseline.

I did not run the live browser/shared-dev validation for `17853981108`, since you chose code review scope. 当前工作区还有大量 `.next/` / `out/` 生成产物噪音，提交前需要 source-only diff 复核。