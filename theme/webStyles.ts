import { LAYOUT_BREAKPOINT, SHEET_BREAKPOINT, TYPE, type TypeRole } from '@/theme/responsive';

/**
 * The stylesheet injected into every statically exported page by app/+html.tsx.
 *
 * Every selector is prefixed with `:root ` on purpose. React Native Web emits
 * one atomic class per property and injects its stylesheet after this one, so a
 * bare `[data-pw="…"]` selector ties on specificity and loses on order. `:root `
 * raises specificity above a single class without resorting to `!important`,
 * which would block per-instance overrides via the `style` prop.
 *
 * Everything here is keyed on `data-pw="…"`. React Native Web turns a `dataSet`
 * prop into `data-*` attributes, which is the supported way to let CSS style a
 * React Native component. These properties are deliberately NOT set in JS on
 * web, so there is no inline style to fight and no `!important` needed.
 */

function typeRule(role: TypeRole): string {
  const spec = TYPE[role];
  const measure = spec.maxWidthCh ? `\n  max-width: ${spec.maxWidthCh}ch;` : '';
  return `:root [data-pw="${role}"] {
  font-size: clamp(${spec.min}px, ${spec.vw}vw, ${spec.max}px);
  font-weight: ${spec.weight};
  line-height: ${spec.lineHeight};
  letter-spacing: ${spec.tracking}em;${measure}
}`;
}

const TYPE_RULES = (Object.keys(TYPE) as TypeRole[]).map(typeRule).join('\n\n');

export const WEB_STYLESHEET = `
/* Type scale — fluid at every width, so there is no breakpoint to get wrong. */
${TYPE_RULES}

/* The subtitle's line breaks are part of the design's composition. */
:root [data-pw="subtitle"], :root [data-pw="bandBody"] { text-wrap: pretty; }

/* ---- Layout: mobile first, widened at the breakpoint ---- */

:root [data-pw="gutter"] { padding-left: 20px; padding-right: 20px; }
:root [data-pw="stack"] { flex-direction: column; }
:root [data-pw="stack-item"] { flex-grow: 0; flex-shrink: 1; flex-basis: auto; }
:root [data-pw="tabs-inline"] { display: none; }
:root [data-pw="tabs-scroll"] { display: flex; }
:root [data-pw="sheet"] { max-width: none; }

@media (min-width: ${SHEET_BREAKPOINT}px) {
  :root [data-pw="sheet"] { max-width: 560px; margin-top: 0; }
}

@media (min-width: ${LAYOUT_BREAKPOINT}px) {
  :root [data-pw="gutter"] { padding-left: 48px; padding-right: 48px; }
  :root [data-pw="stack"] { flex-direction: row; }
  :root [data-pw="stack-item"] { flex-grow: 1; flex-shrink: 1; flex-basis: 0%; }
  /* The Applications panel is the wider of the two on the Overview screen. */
  :root [data-pw="stack-item-wide"] { flex-grow: 1.4; }
  :root [data-pw="tabs-inline"] { display: flex; }
  :root [data-pw="tabs-scroll"] { display: none; }
}

/* The design used :hover on the nav and on cards; native has no equivalent. */
@media (hover: hover) {
  :root [data-pw="navlink"]:hover { opacity: 0.7; }
}
`.trim();
