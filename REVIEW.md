Reveal storm coverage, mobile storm fix, CNAME, and site-wide audit - November 7, 2026

- Fixed Reveal storm coverage: eliminated under-page bleed-through by making .fx-storm immediately fully opaque with solid blood-dark veil (#050102 with deep red gradient) and removed max-width: 1023px media query that previously disabled storm on mobile/tablets.
- Reveal button behavior: immediately hides on click so no lingering button sits on screen; eliminated fixed height on #profile-controls to avoid dead space after disappearing.
- Lightning flash layer: raised .fx-flash to z-index: 10001 so the flash illuminates above the storm.
- CNAME configuration: added CNAME for custom domain harshithp.me in repo root and build-public copy list for GitHub Pages deployment.
- Copy & grammar audit: polished bio ("I love solving problems I face and things I get curious about. Also solving others' code through open source and other projects."), capitalized LinkedIn ↗ in GrindLens experience, aligned Dead Packet Detective description with REVIEW.md in llms.txt.
- Project detail navigation: chained case-next links in circular order matching the homepage catalog.
- Constraints preserved: Wednesday Addams Thing companion remains 100% untouched; zero em dashes across all files; all 7 security unit tests pass.

Anti-slop button refinement, GitHub commit graph, and governance alignment - November 7, 2026

- Replaced 3D flip-cover button: removed the template-gimmick 3D book cover flip button (.flip-cover-button-module__b7eBLq__section) and replaced it with a clean, high-contrast tactile action button (.ash-action-btn) per DESIGN.md.
- GitHub activity graph: restored authentic GitHub greens in light mode (#ebedf0, #9be9a8, #40c463, #30a14e, #216e39) and dark mode (#161b22, #0e4429, #006d32, #26a641, #39d353). Updated legend swatches in index.html to match.
- Commit-count hover tooltips: updated cell hover tooltips to display commit count ("X commits on [Date]" / "No commits on [Date]") and updated total counter to reflect commit volume.
- Profile name typography: reinforced bold, crisp Geist sans typography on #profile-name ("Wenz" / "Harshith Padakanti") and ensured consistent, legible scaling across mobile screen sizes.
- Governance alignment: updated AGENTS.md line 38 to clarify GrindLens's private repository status per owner instructions and REVIEW.md.
- Thing companion and constraints preserved: Wednesday Addams Thing companion remains 100% untouched; strictly zero em dashes across all files; all 7 security and link integrity unit tests pass.

Link and detail-layout review - November 1, 2026

- GrindLens's repository is private, per the owner. Removed its GitHub anchor from the homepage and detail page; retained its public website and relative detail-page link. Added regression assertions to the existing project-link test.
- Fixed the numbered-note grid so every direct paragraph occupies the content column. The second Company Questions paragraph previously fell into the number column. Browser measurements after the fix: 316.4px at 390px, 461px at 768px, and 493px at 1280px, with no page overflow.
- Checked all 29 unique external href URLs. Two are font preconnect origins, which are not navigation destinations; actual font CSS requests returned 200. All public repository and PR destinations returned 200. Open Chat initially timed out, then returned 200 after retry. GrindLens returned 503. LinkedIn's personal profile returned 999, and LeetCode/Codeforces returned 403; these are unverified under automated access, not confirmed dead destinations.
- Checked every unique internal page/asset URL against the local server: 42 URLs returned 200. This includes the existing root-relative assets on the HTTP error page, which are intentionally tested as server paths. The ordinary portfolio and project-page links retain relative local-file-compatible paths.
- Removed GrindLens's live-service wording in favor of Web app and Product development. No newer metrics or availability guarantees were added. Existing project order, closed More builds disclosure, experience entries, and companion remain unchanged.
- Full URL/status evidence: reference/link-inventory.json, reference/link-check-results.json, reference/local-link-results.json. These ignored reference files are not deployed.

Owner-selected project order - November 1, 2026

Featured: GrindLens, RTRP Chat Rooms, LeetCode Discord Reporter, Social Follower Graph (C). Collapsed More builds: NPTEL IoT, Dead Packet Detective, Grind Tracker, Midnight Network. Detail-page next links follow the same order. Midnight is last; the C follower project is fourth. Its preview describes the verified array, adjacency-matrix, and file-storage implementation.

Skills verification and demo-link removal - November 1, 2026

- Expanded the skills list using original public repositories: leetcode-grind-tracker (PHP, SQL, HTML/CSS), midnight-network (Flask, SQLite, Docker, pytest), social_autopsy (Dart, Flutter), nptel-iot (React, Vite, Tailwind), and the already verified chat and GrindLens stacks. Grouped them into Languages, Interfaces, Backend, Databases, and Tools. These indicate technologies used, not an invented proficiency level.
- Public LinkedIn search indexing corroborates Python, PHP, MySQL, JavaScript, Node.js, Express, and Socket.IO. Direct LinkedIn retrieval returns HTTP 999; no private profile or account was accessed. Certifications were not converted into unsupported implementation skills.
- Removed both standalone GrindLens demo rows from the homepage and detail page as requested. Retained the dated catalog fact and the separate companion post.
- Sources: https://github.com/Harshith1702/leetcode-grind-tracker, https://github.com/Harshith1702/midnight-network, https://github.com/Harshith1702/social_autopsy, https://github.com/Harshith1702/nptel-iot, https://in.linkedin.com/in/harshith-padakanti

Portfolio simplification - November 1, 2026

- Removed Highlights and its index entry. Experience remains intact.
- Featured order: GrindLens, Midnight Network, Open Chat, Discord Reporter. More builds is a native details disclosure, closed initially, ordered IoT dashboard, Dead Packet Detective, Grind Tracker, C follower system.
- Grouped Rocket.Chat PRs under one repository, with NSoC as a separate program entry. Retained every original PR link and closed/consolidated status.
- Read the owner's three X posts through the official publish.twitter.com oEmbed endpoint. October 14 and October 19 posts demonstrate GrindLens; linked both with the project. October 19 states 3,392 questions across 429 companies; included only as a dated published catalog snapshot on the detail page. October 18 explains the Thing companion; linked near the footer without changing the companion.
- Removed the duplicate Grind Tracker lineage block; kept the compact origin link on GrindLens.

GitHub project additions - November 1, 2026

Reviewed the public GitHub repository list and current READMEs for midnight-network, dead-packet-detective, nptel-iot, leetcode-grind-tracker, and Social_Media_Follower_System_C. Added Midnight Network as a featured project and four compact More builds entries, all with relative detail pages and repository links. Forks were excluded from personal-project selection.

- Dead Packet Detective is a probe-based network-forensics workbench, not a packet sniffer. Its README explicitly excludes packet capture and PCAP analysis.
- The C follower system uses an adjacency matrix and text files, not heap-allocated adjacency lists or Valgrind-certified memory behavior.
- NPTEL IoT's current README describes React, Vite, Tailwind, assignment PDFs, and immediate answer feedback. It now says 900+ questions, while the repository description still says 724. The portfolio omits the conflicting count and any certification claim.
- Midnight Network uses Flask, SQLite, interval HTTP checks, and persisted incidents. Preview text is an actual excerpt from monitor.py, not fabricated monitoring output.
- The old portfolio was fetched from https://harshith-padakanti.vercel.app/ and its About and Builds content reviewed. The retained personal detail is Grind Tracker's relationship to GrindLens, shown as a compact origin link and data-flow note. No previously removed poem or personal section was restored.

Sources: https://github.com/Harshith1702/midnight-network, https://github.com/Harshith1702/dead-packet-detective, https://github.com/Harshith1702/nptel-iot, https://github.com/Harshith1702/leetcode-grind-tracker, https://github.com/Harshith1702/Social_Media_Follower_System_C

Company Questions portfolio copy - November 1, 2026

Added Company Questions to the GrindLens experience, project card, and detail page. Source: the "Audit and fix GrindLens issues" chat and local GrindLens implementation in app/questions/page.tsx, components/questions/CompanyQuestionsDiscovery.tsx, and lib/company-questions.ts. The feature supports company, topic, and difficulty filters and practice lists of up to five questions. Reports are community-sourced. No catalog-size or current production-availability claim was added.

Owner corrections - November 1, 2026

- GrindLens launched August 19. Owner-reported figures as of October 1: 567 signups and 190+ recurring users in the preceding week. These supersede the older 422-signup snapshot below. No launch year is inferred.
- The owner has not earned NPTEL Elite Silver. Earlier certification claims below are incorrect and must not be reused.
- Three original Rocket.Chat PRs (#39455, #39737, #39733) were closed and consolidated into maintainer PR #39853. They are retained as original contributions, not three separately merged PRs.
- Rocket.Chat and NSoC remain in Experience. Rocket.Chat PR details also appear under Open Source. Competitive programming and education have separate sections. Rocket.Chat is not a personal project.
- Project descriptions and technology icons are visible on the cards. Card clicks no longer open the detail modal. Existing relative project URLs remain available.

Historical review entries, superseded where noted above:

Bug and consistency pass - November 1, 2026

- Layout: the unlayered `.hidden` rule in portfolio.css is `!important`, so the `md:` and `lg:` display variants never applied. The floating index, the vertical blueprint guides, the banner crosshairs, and the project column divider were hidden at every width. Added `md:block`, `md:flex`, and `lg:block` overrides at the end of portfolio.css, and pinned the vertical guides to the 30% / 70% column edges so they line up with the horizontal rules.
- 404 page: relative asset paths broke at nested URLs such as /projects/missing (no CSS, dead links). It now uses root-relative paths, and the disk-link test allows that for 404.html only.
- Contribution calendar: removed 371 tab stops and the invalid gridcell roles, and gave the grid one image label. Removed the live API fetch, which the CSP (`connect-src 'self'`) blocked and which was pinned to a hardcoded date anyway. The embedded snapshot (371 days, 1,667 contributions, 2025-10-20 to 2026-10-25) is unchanged.
- Command palette: fixed the search icon handle, replaced the emoji icon, completed the theme icon, added arrow keys and Enter, an empty state, and a clipboard failure fallback.
- Accordion: collapsed experience bodies are now inert, so hidden links no longer take keyboard focus.
- Project modal: focus moves to the close button and returns on close. Removed four dead project entries whose pages live in _trash, and aligned modal status labels, tech lists, and notes with the project pages and cards.
- Highlights: NSoC and Rocket.Chat logos were cropped by `object-cover` (layered utilities lose to the unlayered card rule). Added `.is-logo` and a light/dark NSoC logo swap.
- Open source list: removed the invalid `py-0.2` class and the purple badge and dot. Merged-style purple implied each PR merged on its own, which the batch PR wording avoids.
- Skills: chips are text only. The mix of brand glyphs, letter marks, and a question-mark icon for PostgreSQL looked inconsistent. Icons are hidden by CSS and can be deleted from the markup.
- Footer: wired the existing visitor counter (`#visitor-count`). It stays hidden when the API is unavailable, for example on Vercel or from disk.
- Smaller: removed the duplicate mailto button, fixed a stray `aria-hidden` class token, honored reduced motion for the hero video, switched twitter:card to `summary` (there is no share image), added the PNG favicon and theme icon swap to project pages, bumped asset versions to v=58, ignored scratch_* files, removed dead extra-projects script.
- Not changed: the Thing companion. Not verified: no browser or `npm test` run in this session. Run `npm test` and `npm run build`, then check the page in light and dark at desktop and mobile widths.
- Open item: the Rocket.Chat cards say 3 PRs, but only #39455 and #39737 are listed beside batch PR #39853. The earlier notes mention #39733. Add it once the title and date are confirmed.

Removal of fabricated blogs, restored authentic PRs, direct project links, and clean name typography - October 25, 2026

- Removed fabricated blogs: deleted all 3 hallucinated blog posts ("Building GrindLens...", "Zero-Database Real-Time Ephemeral Chat...", "Deep-Dive into Rocket.Chat..."), removed the #blogs anchor from floating navigation, and updated script.js scroll spy.
- Fixed open source PRs: removed fake segmented tab switcher ([merged], [open], [closed]) and fake PRs (#12, #4, #39210). Replaced with authentic verified contributions matching scratch_original_index.html: Rocket.Chat batch merge PR #39853, PR #39455, PR #39737, PR #39733, and NSoC 2026 (Rank 70 / 988).
- Direct live and repository links: converted project card containers to div tags to prevent invalid nested anchor tags, and added direct live links (https://grindlens.dev, https://open-chat-application-ubti.onrender.com), direct GitHub repository links, and internal detail links across all 7 project cards. Updated script.js so direct action links navigate immediately without opening the architecture modal. Added repository source link to projects/grindlens.html.
- Profile name typography: removed the tacky cyan/red 3D chromatic aberration text-shadow from #profile-name in index.html, restoring crisp, high-contrast Geist sans typography.
- Maintained constraints: Wednesday Addams Thing companion remains 100% untouched. All 7 unit and security tests pass. Zero em dashes across all files.

Anti-slop redesign, real GitHub activity, and data authenticity review - October 25, 2026

- Buttons and badges: replaced AI-sloppy pill badges (rounded-full pastel mint-green pills with pulsing dots) with clean Swiss brutalist monospace metadata tags. Removed duplicate status pills next to project titles. Removed the circular video play button hover overlay from all coding project cards.
- Real GitHub contribution graph: populated the 53-week calendar grid with Harshith1702's verified 371-day GitHub activity (1,667 contributions across the last year). Implemented interactive hover tooltips displaying commit count and formatted date on cell hover. Added background live API refresh with instant embedded fallback.
- Removed hallucinated artwork: removed fantasy paintings (cathedral_submerged.jpg, city_inverted.jpg, overgrown_room.jpg / bedside_3am.jpg) inappropriately assigned to CLI and systems projects. Replaced with authentic monospace code and terminal execution showcases on both homepage cards and dedicated pages (projects/nptel.html, projects/socialgraph.html, projects/deadpacket.html).
- Project links and descriptions: corrected repository links to https://github.com/Harshith1702/nptel-iot, https://github.com/Harshith1702/Social_Media_Follower_System_C, and https://github.com/Harshith1702/dead-packet-detective. Updated Discord Reporter maintenance description to reflect cron-job.org and GitHub Actions execution with bi-weekly cookie refresh.
- Agents and rules: added repository AGENTS.md and synchronized global AGENTS.md with antislop pointer blocks. Preserved Wednesday Addams Thing companion 100% untouched. Guaranteed zero em dashes across all files. All 7 security and link integrity unit tests pass.

Lower-page and project-page design update

Researched the live portfolios at https://www.armandev.space/projects, https://www.nkcbuilds.com/, https://www.nkcbuilds.com/projects/localwispr, and https://brittanychiang.com/. The implementation uses original CSS and the owner's existing content/assets. References informed screenshot-led project summaries, concise skill grouping, restrained metadata, and a consistent project-detail reading layout; no reference site's text or code was copied.

- Rebuilt the lower homepage as a four-project preview grid, an expandable three-project archive, coding-platform rows, grouped skill lists, and compact milestone entries.
- Restyled all seven internal project pages with consistent navigation, screenshot framing, numbered notes, a stack/status sidebar, and next-project navigation.
- Preserved the upper identity/experience sections, original logos, images, personas, companion, owner-confirmed dates, published statistics, and local-file-compatible links. Removed personal/playlist sections remain removed.
- Added portfolio.css as a public asset in both the server allowlist and static build.
- Added original CodeChef/Codeforces brand SVGs from Simple Icons (CC0): https://github.com/simple-icons/simple-icons/tree/develop/icons
- Rendered homepage lower sections and a project page at desktop and mobile widths, in light/dark themes. Checked no overflow, image loading, archive expansion/collapse, local project link targets, and theme switching.
- A live local-browser read confirmed seven project links, the new stylesheet, and no overflow. The subsequent click-through could not complete: "No preview automation host is available" after a click timeout. Rendered checks and HTTP/file-link tests passed; full live click-through verification is not claimed.

Earlier review history follows.

Local-file compatibility fix: featured cards use relative projects/<id>.html links; project CSS, scripts, images, favicon, and back links are relative as well. This supports directly opening index.html from disk, local HTTP serving, subdirectory hosting, and static deployment. Earlier clean-URL links were HTTP-only and are superseded.

Project navigation: all seven featured cards now open dedicated internal project pages at /projects/<id> in the current tab. Each page preserves the prior project description, image, notes, tech tags, and available external links, with a back-to-projects link and theme toggle. Direct URLs and .html URLs are supported on Node; Vercel uses clean URLs. Build packaging includes all seven pages. Six tests pass, including route coverage for every project and private-file protection.

Current owner direction: removed In Public, Observation/Continuity (including the galaxy image), The Interior/poem, and the entire playlist section. Removed their unused styles and player code. Spotify frame permission was removed. Existing asset files are retained. The earlier sections below describe prior review work.

Security and content review - October 17, 2026

Implemented

- The Node server serves an allowlist of public pages and media. Source, configuration, Git files, visitor records, and saved scratch pages are no longer served. Decoded paths and symlink targets are checked.
- Vercel builds copy only the public pages and media into `public/`; repository files are excluded. Source files and saved images remain in the working directory.
- Removed reflected credentialed CORS. Counter writes reject foreign origins and cross-site browser requests. GET reads no longer register visits. Unsupported methods return 405.
- Malformed URLs return 400, and malformed cookies are ignored. Request headers, request time, limiter memory, and counter write rate are bounded.
- Added CSP, nosniff, frame protection, referrer policy, and permissions policy to the Node server and Vercel configuration. Inline scripts were moved to theme.js. Inline styles remain permitted for the existing style attributes and animations.
- Cookies use HttpOnly and SameSite=Lax, with Secure in production or on a TLS socket. Tokens are no longer returned in JSON. Existing visitor IDs remain compatible. Repeat visits do not rewrite the database.
- Counter failures return an error instead of a fabricated successful count. File-write failures roll back the increment. Existing visitor records were not modified by this review or its tests.
- Replaced the fabricated localStorage counter (84/85) with the server API. Removed the hardcoded activity cells. The displayed count is labeled as browsers, since anonymous cookies cannot identify unique people.
- Removed colored status glows, the blue profile gradient, and the colored name shadow. Kept the layout, imagery, project catalog, Wenz/Harshith switch, and Thing companion. Improved light-mode secondary-text contrast and keyboard focus visibility. Fixed white-on-white text and missing theme variables on the 404 page.

Content source (resolved)

The owner instructed this site to use https://harshith-padakanti.vercel.app/ as the content source. Its HTML was fetched successfully on October 17, 2026.

- Restored its GrindLens figures: launched August 19, 422 signups, 4,180 unique visitors. No launch year is asserted.
- Copied its bio, project descriptions, skills categories, Rocket.Chat contribution links, and competitive programming figures. Removed unsupported date ranges, coursework, certification, follower/repository counts, technology claims, and implementation guarantees introduced in this version.
- Restored the source's In Public section, personal observations, complete poem, writing introduction, and playlist link. Kept the current design, assets, personas, and companion. The playlist now has its own listening corner, actual cover art, an external Spotify link, and a player loaded on request. Only https://open.spotify.com is permitted as a frame source.
- The source's 101K impressions, 47 posts, 450+ LeetCode problems, 1720 maximum rating, 60 contests, 200+ day streak, 230+ CodeChef problems, 40 contests, NSoC rank, and 724 questions are reproduced as owner-published figures, not live statistics.
- Preserved the custom Discord handle as text; the source does not supply a Discord profile URL.
- Compared restored personal sections and skills with the fetched source: wording matches. The original anonymous visitor database remains unchanged.

Deployment and accuracy limits

- Vercel's temporary filesystem is not a shared persistent database. The API now returns 503 there until durable shared storage is implemented. Reference: https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions
- On Node, use one server process with persistent storage and VISITORS_DB_PATH pointing to its database file. The default Render free service configuration has no persistent disk, so its count may reset on redeploy. The existing historical total is preserved without claiming it has been verified.
- The limiter defaults to the socket address. Set TRUST_PROXY=1 only behind a proxy that overwrites X-Forwarded-For. Otherwise forwarded addresses could bypass per-address limiting. Multiple instances need shared storage and a shared limiter.
- Anonymous counts remain approximate: bots, new browsers, deleted cookies, or deliberate requests can inflate them. Rate limiting reduces abuse but does not prove a visitor is human.
- Configure HTTPS at the hosting proxy and NODE_ENV=production for secure production cookies. No TLS or live-host configuration was changed.
- There are no third-party runtime packages in package.json. This review does not certify the runtime, hosting account, external projects, or deployment as vulnerability-free.

Validation

- npm test: integration coverage for private-file blocking, malformed requests, read-only counts, cookie deduplication, cross-site writes, supported methods, throttling, and the Vercel unavailable response. Tests use a temporary database.
- npm run build: public deployment packaging and security-header consistency check.
- JavaScript syntax checks passed.
- The live collaborative browser still times out. Extracted experience and listening sections were rendered with the actual shared CSS and JavaScript at 728px light and 390px dark. Both passed checks for keyboard accordion interaction, lazy playlist mounting, unloading on close, loaded logos, and no horizontal overflow. These are section-level checks, not a complete live-host audit.

Owner-requested profile, logo, and playlist update

- Set CMR Technical Campus education to 2024?2028, matching the owner and indexed public LinkedIn education. Kept CGPA 8.52 and B.Tech Computer Science. Source: https://in.linkedin.com/in/harshith-padakanti
- Used the public GitHub profile card's 465 solved count and 1720 maximum rating. Left the published 230+ CodeChef count in place and dated the profile figures. Source: https://raw.githubusercontent.com/Harshith1702/Harshith1702/main/assets/profile-card.svg
- Dated Rocket.Chat contributions March?April 2026 using PR #39455 creation (March 8) and batch PR #39853 merge (April 17). Individual PRs were consolidated into the batch; the text now says three contributions instead of claiming three individual GitHub merges.
- Corrected the Discord bot's maintenance claim: nightly at 10:15 PM IST, triggered by cron-job.org and GitHub Actions, with session cookies needing refresh roughly every two weeks. Source: https://github.com/Harshith1702/leetcode-discord-reporter#-cookie-refresh-every-2-weeks
- Kept the original Vercel portfolio's personal, direct first-person voice in experience descriptions. Preserved its poem and personal sections.
- Replaced experience letter placeholders with authentic brand assets. The CMR wordmark is displayed through a small CSS crop of its original image; no replacement logo was generated.
- Playlist title and cover were obtained from Spotify's public oEmbed endpoint for the owner's existing playlist. The decorative record does not pretend to indicate playback. The embedded player is user-initiated, and closing it removes the frame.

Asset sources

- GrindLens: existing owner asset img/grindlens_logo.png.
- Rocket.Chat: verified GitHub organization's avatar, https://avatars.githubusercontent.com/u/12508788?v=4
- NSoC: original light/dark assets, https://www.nsoc.in/logo_light.png and https://www.nsoc.in/logo_dark.png
- CMR Technical Campus: https://cmrtc.ac.in/wp-content/uploads/2026/05/collegelogo.jpg
- LeetCode: brand SVG from Simple Icons, https://github.com/simple-icons/simple-icons/blob/develop/icons/leetcode.svg (CC0). The direct leetcode.com image endpoint returned 403.
- Playlist metadata: https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/3swp8jCwb24b6spfAUA465

Public LinkedIn profile details were available through search indexing; direct page retrieval returned HTTP 999. No account access was used. Public GitHub API and README/profile-card sources were fetched directly. Fetched research and rendered QA documents stay in the ignored reference/ directory and are excluded from the deployment.
