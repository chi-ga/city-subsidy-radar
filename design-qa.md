**Source visual truth path**
- `D:\Desktop\ChatGPT Image 2026年7月1日 01_18_40.png`

**Implementation screenshot path**
- `D:\Desktop\city-subsidy-radar\output\playwright\redesign-desktop-final.png`
- `D:\Desktop\city-subsidy-radar\output\playwright\redesign-mobile-full-3.png`

**Viewport**
- Desktop: 1440 x 1000
- Mobile: 390 x 844, full page

**State**
- Home route `/`
- Default unauthenticated state

**Full-view comparison evidence**
- `D:\Desktop\city-subsidy-radar\output\playwright\design-comparison.png`

**Focused region comparison evidence**
- Focused regions were not required after the full-view comparison because the remaining differences are at the art-direction level, not small alignment or typography defects.

**Findings**
- No actionable P0/P1/P2 findings remain.
- Typography: the implementation uses a heavier sans display treatment rather than the source's calligraphic serif-like display. This is acceptable for the existing React/Tailwind product because it preserves legibility across responsive app states while matching the source hierarchy and weight.
- Spacing and layout rhythm: the implementation matches the source's top navigation, left hero/right visual balance, overlapping entry strip, lower data cards, rounded panels, and soft elevation. The hero is slightly more spacious vertically to keep the live WebGL visual from colliding with labels.
- Colors and visual tokens: the implementation maps the source's cream paper background, deep green brand, olive globe, warm gold accents, orange pins, and soft borders into Tailwind `subsidy` tokens.
- Image quality and asset fidelity: the implementation intentionally uses an interactive COBE point-globe instead of a static extruded China-map illustration. This preserves live city marker behavior while staying within the reference's green/gold opportunity-map direction.
- Copy and content: app-specific text now follows the source structure, with a stronger hero promise, primary subsidy exploration CTA, secondary usage CTA, three task entries, trust data, city comparison, and application guide.

**Patches made since previous QA pass**
- Rebuilt the dark radar homepage into a warm light product homepage.
- Reworked the 3D visual into a light olive opportunity globe with gold orbital lines and city labels.
- Added full header navigation, search, collection, login/register, three entry cards, trust data, city comparison cards, application guide, and right-side quick actions.
- Reduced oversized hero typography after first screenshot review.
- Removed the homepage GitHub floating promo to avoid blocking the product entry strip.
- Adjusted the brand mark toward the new green palette.

**Implementation Checklist**
- Build passed with `npm run build`.
- Targeted ESLint passed for modified home/globe files.
- Desktop and mobile screenshots captured.
- Interactive controls remain wired to existing routes.

**Follow-up Polish**
- A future asset pass could replace the WebGL point-globe with a generated transparent 3D China relief image if exact mock fidelity becomes more important than live interaction.

**final result: passed**
