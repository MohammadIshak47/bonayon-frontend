import { describe, expect, it } from 'vitest';
import { dictionaries, translate } from './config';

describe('i18n', () => {
  it('Bangla has exactly the same keys as English', () => {
    for (const ns of Object.keys(dictionaries.en) as (keyof typeof dictionaries.en)[]) {
      expect(Object.keys(dictionaries.bn[ns]).sort()).toEqual(Object.keys(dictionaries.en[ns]).sort());
    }
  });
  it('translates', () => expect(translate('bn', 'navigation.farms')).toBe('খামার'));
});
