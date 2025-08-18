# Acceptance Criteria

## Slice 1: Nav + Layout
- NavBar visible on all routes.
- Light/dark toggle works.
- Routes switch without full page reload.

## Slice 2: Design Tokens
- All components use `var(--token)` references.
- No inline or hard-coded colour/spacing.
- Changing a token updates app globally.

## Slice 3: Components
- Card renders with correct shadow + radius.
- TrustMarker shows correct emoji + label.
- Accordion expands/collapses smoothly.
- ExportModal opens/closes, disclaimer visible.
- ChartStub renders placeholder.

## Slice 4: Routes + Wireframes
- Each route resolves to its layout.
- Placeholder content matches ASCII frames.
- No broken links.

## Slice 5: Fake Data
- Components render against JSON mocks.
- Business detail page loads fake company profile.
- Toolkit calculators accept dummy inputs.
