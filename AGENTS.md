# AGENTS.md - Repository Standards and Rules

This repository contains the personal portfolio and systems engineering showcase of **Harshith Padakanti** (`Harshith1702/Harshith-Padakanti`).

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `DESIGN.md` for direction, then the core antislop filter:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
<!-- antislop:end -->

## 1. Absolute Constraints (Non-Negotiable)

1. **Thing Companion Preservation**:
   - **DO NOT TOUCH OR MODIFY** the Wednesday Addams Thing companion.
   - Elements: `#thing-companion`, `#thing-shadow`, `#thing-sprite`, `#thing-bubble`, `#thing-toggle-btn` in HTML.
   - Script: lines 64-354 in `script.js`.
   - Styles: lines 1055-1132 in `style.css` / `portfolio.css`.
   - The crawling, tapping, and speech bubble behavior must remain intact.

2. **Punctuation Hygiene**:
   - Strictly **zero em dashes** (`\u2014`) in any source, documentation, or copy.
   - Use standard hyphens (`-`), colons (`:`), or commas (`,`) instead.

3. **Anti-Slop Craft Standard**:
   - Never generate AI-slop UI: avoid generic template tropes, meaningless purple/blue gradient backgrounds, floating AI glow or sparkle emojis (`✨`), inflated metric cards, and noisy borders.
   - Do not use video play button overlays on software project cards.
   - Do not use pill-shaped pastel glowing badges with pulsing dots. Use crisp, Swiss brutalist monospace tags.
   - Do not use fantasy paintings or unrelated illustrations as "screenshots" for technical, backend, or CLI tools. Use clean code and terminal showcases.

4. **Data Authenticity**:
   - Every metric, date, and link must be authentic and verified against `REVIEW.md` and public sources.
   - Real GitHub contributions: sourced from user `Harshith1702`.
   - Verified project repositories:
     - GrindLens: Private repository per owner (public web app at https://grindlens.dev)
     - LeetCode Grind Tracker: `https://github.com/Harshith1702/leetcode-grind-tracker`
     - RTRP Chat Rooms (Open Chat): `https://github.com/Harshith1702/Open_Chat_Application`
     - LeetCode Discord Reporter: `https://github.com/Harshith1702/leetcode-discord-reporter` (automation runs on cron-job.org and GitHub Actions, cookies refreshed bi-weekly)
     - NPTEL IoT Study Dashboard: `https://github.com/Harshith1702/nptel-iot`
     - Social Follower Graph (C): `https://github.com/Harshith1702/Social_Media_Follower_System_C`
     - Dead Packet Detective: `https://github.com/Harshith1702/dead-packet-detective`

5. **Local-File and Route Compatibility**:
   - Project cards must retain `href="projects/<id>.html"`.
   - All internal assets must resolve relatively without leading `/`. Exception: `404.html` is served at any URL depth, so it uses root-relative paths.
   - All 7 tests in `security.test.js` must pass 100% on every update (`npm test`).
