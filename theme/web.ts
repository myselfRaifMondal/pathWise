import { isWeb } from '@/theme/responsive';

/**
 * Tags a component for the web stylesheet in theme/webStyles.ts.
 *
 * React Native Web turns `dataSet` into `data-*` attributes; on native the prop
 * is omitted entirely, so this is a no-op there.
 */
export function web(pw: string) {
  return isWeb ? ({ dataSet: { pw } } as const) : null;
}
