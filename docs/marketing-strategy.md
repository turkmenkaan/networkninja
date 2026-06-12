# NetworkNinja - Organic Marketing Strategy

Planning doc. Channel-by-channel playbook for growing NetworkNinja organically
(no paid ads), tuned to the product: a free, hands-on platform where you learn
BGP by running **real FRR routers** locally with Containerlab.

---

## 0. Positioning (the foundation everything else rests on)

Every channel reuses the same sharp message. Get this right first.

- **One-liner:** "Learn networking by running real routers, not watching videos." (The site already uses "Stop reading about networks. Run them.")
- **The differentiator:** not multiple-choice, not 40-minute videos. You boot genuine FRRouting routers on your own machine with Containerlab, break things, fix them. The CLI you learn is the CLI production runs.
- **Proof assets you already have:** the clean, branded diagrams; downloadable one-command labs; objective checklists; a real BGP curriculum (Foundations + eBGP + iBGP).
- **Who it's for (personas):**
  1. Network engineers leveling up / refreshing BGP.
  2. Cert students (CCNA/CCNP/JNCIA) who want hands-on practice, not just theory.
  3. Cloud/DevOps/SRE folks who hit networking and want real depth.
  4. Homelab / self-taught networkers who love free, runnable tools.
- **Honest framing for now:** free, Tier 1 (run locally), a curriculum that's actively growing. Lean into "build in public" while content fills out, rather than pretending it's finished.

---

## 1. SEO (the compounding, long-term engine)

The curriculum **is** the SEO asset: every lesson/lab is an indexable page targeting exactly what people Google while learning or troubleshooting BGP. These are low-competition, high-intent, long-tail terms.

**Keyword map (representative):**
- Concept terms: "eBGP vs iBGP", "what is AS_PATH", "BGP next-hop-self explained", "iBGP full mesh", "BGP best path selection".
- Hands-on terms (very low competition, high intent): "BGP lab", "containerlab BGP example", "FRR BGP config example", "learn BGP hands on", "BGP practice lab free".
- **Troubleshooting long-tail (gold - people paste exact symptoms):** "BGP stuck in Active", "bgp ebgp-requires-policy (Policy)", "iBGP route not installed next-hop", "frr show ip bgp summary Policy". The RFC 8212 `(Policy)` issue we hit is a perfect example - real people search that exact string.
- Cert-adjacent: "BGP for CCNP", "BGP labs for CCNA".

**Tactics:**
- **Technical SEO (mostly in PREFLIGHT P1):** sitemap.ts, robots.ts, OG image, favicon, correct `metadataBase` (real domain), per-page titles/descriptions (already present). Pages are static and fast - good baseline.
- **Structured data:** add `Course`/`Article` + `FAQPage` JSON-LD to lesson/lab pages. Helps rich results and topical authority.
- **A "Field Notes" blog** alongside the curriculum, for SEO articles that aren't full units: "Build a BGP lab in 5 minutes with Containerlab", "The iBGP next-hop problem (and 3 ways to fix it)", "RFC 8212: why your eBGP routes show (Policy)". Each funnels to the relevant lab. Set canonical URLs so cross-posts don't compete.
- **Backlinks (the slow but durable part):** submit to awesome-lists (awesome-networking, awesome-bgp, the Containerlab community showcase), get referenced by FRR/Containerlab community pages, cross-post articles to dev.to/Hashnode with canonical back to the site.
- **Internal linking:** prerequisite links already connect units - good. Add "related labs" and contextual links from blog posts to units.

> SEO is slow (3-6 months to compound) but it's the channel that keeps paying after you stop posting. Start the content + technical SEO now.

---

## 2. Reddit (highest near-term upside, highest spam-sensitivity)

Network engineers live here. Reddit will reward genuine value and punish anything that smells like an ad.

**Target subs:** r/networking, r/ccna, r/ccnp, r/homelab, r/selfhosted, r/devops, r/sre, r/juniper, r/Cisco, r/networkengineer. (Tailor each post to that sub's norms.)

**Playbook (order matters):**
1. **Be useful first.** Spend weeks answering BGP/Containerlab questions thoroughly. Build account history and reputation. Only link a specific lab/lesson when it genuinely answers the question ("here's a free lab that walks through exactly this").
2. **The "I built this" post** (the big one): r/homelab and r/networking love free, runnable, local tools - especially Containerlab-based. Frame as a project share, not a pitch: lead with the hands-on labs + the diagrams + "free, runs locally, here's the BGP path I've built so far." Be transparent you're the maker. Show screenshots/GIFs of a lab coming up.
3. **Don't blast.** Post to one or two subs, space others out by weeks, customize each. Engage every comment - the comment section is where trust is built.
4. **Disclose + follow rules.** Many subs require flair/disclosure for self-promo. Read the rules; some have a "self-promo Saturday."

---

## 3. X / Twitter (build-in-public + visual + community)

The neteng/devops/SRE community is active here, and your **diagrams are tailor-made for X** (visual, shareable).

**Tactics:**
- **Build in public:** ship a module -> tweet it ("Just shipped the iBGP module: a 5-router transit-AS lab you run locally"). People follow journeys.
- **Educational micro-content:** BGP tip threads ("The iBGP next-hop problem, visualized" with the diagram), "TIL" networking nuggets, "BGP in 10 tweets." Each thread ends with a link to the relevant lab.
- **Visuals win:** post the diagrams and short screen-recordings (a lab booting, a `show ip bgp` lighting up).
- **Engage the ecosystem:** Containerlab (Roman Dodin / @ntdvps), FRRouting, ipSpace/Ivan Pepelnjak, Network to Code, PacketPushers, well-known network educators. Reply, add value, get on their radar; a single reshare from them is worth thousands of impressions.
- **Hashtags:** #networking #BGP #neteng #devops #homelab.

---

## 4. Product Hunt (a one-shot spike - save it for a milestone)

PH is a launch *event*, not a steady channel. Its audience skews makers/tech generalists, but "learn networking by running real routers" is novel enough to stand out.

**When:** not yet - launch PH at a strong milestone (e.g. the full BGP path done, or auth + a polished domain live). A single great launch beats a weak early one.

**Prep:** a crisp tagline, a 30-60s demo video + GIFs, screenshots, a thoughtful maker's first comment (the story), and a list of people who'll upvote/comment in the first hour. Launch Tue-Thu, 12:01am PT, and be present all day to reply. Payoff: a traffic spike, a quality backlink, and "PH-featured" credibility.

---

## 5. And more (other organic channels)

- **Hacker News - "Show HN":** "Show HN: NetworkNinja - learn BGP by running real routers locally." HN loves technical, free, hands-on tools. High risk (HN is blunt), high reward (big spike + durable backlink). Save for a polished milestone; be present to answer every comment, technical and critical.
- **YouTube + short-form (under-rated for tutorials):** YouTube is the #2 search engine. A few high-quality lab walkthroughs ("Bring up your first BGP session in 5 minutes") rank for years and double as onboarding. Shorts/Reels of diagrams and concepts for reach.
- **Communities (be a member, not a billboard):** Containerlab Discord, Network to Code Slack, r/networking Discord, homelab Discord, PacketPushers community. Share when relevant.
- **Containerlab + FRR ecosystems:** NetworkNinja is a natural "learning resource built on Containerlab/FRR." Get featured in their community/showcase pages and docs links - aligned audience, strong backlinks.
- **Newsletters:** pitch ipSpace, PacketPushers, and dev-tool newsletters (Console, etc.) for a mention.
- **Open-source angle (decide deliberately):** if the content/labs repo goes public with a clear license, it can earn GitHub stars, contributions, awesome-list inclusion, and goodwill - and the labs are independently useful. Weigh against the future paid model.
- **Q&A SEO:** answer BGP questions on the Network Engineering StackExchange and Quora, linking resources tastefully (also helps SEO via referral + authority).
- **Cert + university outreach:** CCNA/CCNP study Discords/subreddits want hands-on practice; networking professors might adopt free labs.

---

## 6. The content engine (how to sustain it solo)

One unit of work, atomized across channels - this is how a single maker keeps all channels fed:

Ship a lab/lesson ->
- a **blog post** (SEO, canonical),
- an **X thread** + a **diagram graphic**,
- a short **video/GIF** walkthrough,
- a **Reddit answer** when a relevant question appears,
- a line in the **changelog/newsletter**.

Consistency beats bursts. A realistic solo cadence: 1 substantive piece/week, atomized.

---

## 7. Funnel + measurement

- **Conversion goal (now):** email signup (already built) and, once live, sign-in. Every channel -> site -> "get notified" / account.
- **Attribution:** UTM-tag every external link (`?utm_source=reddit&utm_campaign=ibgp-post`) and watch Vercel Analytics + (later) signup source. Learn which channels actually convert, then double down.
- **Metrics to track:** signups/week, traffic by source, keyword rankings (a few target terms), Reddit/HN/PH post performance, X followers + engagement, lab downloads.

---

## 8. Recommended sequencing (don't try to do everything at once)

- **Now (pre-launch, partial content):** start the **SEO content engine** + **X build-in-public** + **be-helpful-on-Reddit** + join the Containerlab/FRR communities. These compound and build an audience while content fills out. Wire UTM + analytics.
- **At launch milestone (domain + more content + auth live):** the big one-shot pushes - **Show HN**, **Product Hunt**, the Reddit **"I built this"** posts, newsletter pitches.
- **Ongoing:** weekly atomized content, community engagement, backlink building, double down on whatever converts.

**Solo-founder focus (if you can only do 3):** SEO content + Reddit value + X build-in-public. They're sustainable, compounding, and reach the exact audience. Treat HN/PH as launch-day events later.

## 9. Guardrails
- Always disclose you're the maker. Add value before linking. Read each community's self-promo rules. Authenticity is the whole game in these channels - one spammy misstep in r/networking is hard to undo.
