import { en } from './en';
import { hi } from './hi';
import { te } from './te';
import { ta } from './ta';
import { kn } from './kn';
import { ml } from './ml';
import { bn } from './bn';
import { gu } from './gu';
import { mr } from './mr';
import { pa } from './pa';
import { ur } from './ur';
import { as } from './as';
import { or } from './or';

export const translations = {
  en,
  hi,
  te,
  ta,
  kn,
  ml,
  bn,
  gu,
  mr,
  pa,
  ur,
  as,
  or,
};

export type SupportedLocale = keyof typeof translations;

export { en, hi, te, ta, kn, ml, bn, gu, mr, pa, ur, as, or };
