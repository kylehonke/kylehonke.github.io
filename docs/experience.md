# Editing the Experience page

Edit [src/data/experience.json](../src/data/experience.json) and commit your change. The page sorts the entries, calculates elapsed time and shared dates, and links promotions. About is written separately in [About.jsx](../src/pages/About.jsx).

## Add a job or degree

In GitHub, open the JSON file and choose the pencil icon. Reuse an organization key from `organizations`, or add a key and its public display name there. Append an object to `entries`, with a comma between objects. For example, this is the complete existing UT internship entry.

```json
{
    "id": "ut-intern",
    "type": "work",
    "title": "Intern",
    "organization": "ut-austin",
    "start": "2026-10-27"
}
```

| Field | What to enter |
| --- | --- |
| `id` | Required, unique lowercase letters or digits separated by hyphens. Keep it stable when renaming a role. |
| `type` | Required. Use `work` or `education`. |
| `title` | Required. Enter the job title or degree as it should appear. |
| `start` | Required. Enter `YYYY-MM` or `YYYY-MM-DD`. Use only the precision you know. |
| `organization` | Optional key from `organizations`. Omit the field if the school or employer is unconfirmed. |
| `end` | Confirmed final day or month. Omit for a current role. Enter a month-only actual end after completion. |
| `expectedEnd` | Expected completion, such as `"2026-12"`. An expectation alone keeps the entry current. |
| `promotedFrom` | ID of the preceding work role at the same organization. Enter the successor’s exact start day. |
| `summary` | Optional sentence about your contribution, written in your own words. |
| `links` | Optional array, for example `[{"label": "Project details", "url": "/projects/"}]`. Use site paths or HTTP(S) links. |
| `emphasis` | Optional. Use `"subtle"` for a quieter title, as on the Shore entry. |

## Edit, finish or remove an entry

Edit the original entry to correct a date, update its title or add a link. Renaming the display name in the organization lookup updates that employer throughout Experience. The order of entries in the file is immaterial.

After BAS graduation is confirmed, add `"end": "2026-12"` to `acc-bas` if that is the actual month. A confirmed end supersedes `expectedEnd`. The degree moves to **previously**, its duration freezes, and both current jobs’ **meanwhile** sections reflect the actual end. Ending a job uses the same field.

To remove an entry, delete its object and fix the surrounding comma. Search the file for its ID and remove or retarget any `promotedFrom` pointing to it. Other overlaps are recalculated automatically.

## Record a promotion

Add just the successor entry. This example uses an illustrative title and date. Substitute the confirmed details before publishing.

```json
{
    "id": "ut-next-role",
    "type": "work",
    "title": "Confirmed UT title",
    "organization": "ut-austin",
    "start": "2027-01-01",
    "promotedFrom": "ut-intern"
}
```

The new title takes effect on its start date in America/Chicago. Until then it is hidden on the page. Scheduled records are already visible in the public repository. Each role links to the other in its expanded tile. Without an explicit end, the internship ends the preceding day. Keep an explicit end if both titles share a handoff date, as at Clozure. Leave `promotedFrom` out for independent or parallel jobs. A gap restarts employer tenure.

**Meanwhile** displays the part of each role that intersects the selected entry. It groups related roles by employer. A month-only boundary shared by two degrees does not establish that the degrees overlapped. Month-only durations are approximate.

## Preview and publish

1. From the repository root, run `npm ci` and `npm run dev`. Open `/experience/` on the printed local address.
2. Check the two lines of the collapsed entry, its dates and tag, its expanded links, and any related roles. Use a narrow phone viewport. Tab to a disclosure and press Enter. Follow a promotion in both directions.
3. Run `npm run lint` and `npm test`. The test runner builds and serves the production site. On a new machine, install Chromium with `npx playwright install chromium` first.
4. Commit the JSON on a branch and open a pull request. The standard deployment publishes the changes when merged.
