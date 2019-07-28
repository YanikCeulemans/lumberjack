import { LogMeta } from './base';
import { transformers } from './transformers';

describe('transformers', () => {
  describe('#compose', () => {
    const value: LogMeta = {
      level: 'debug',
      message: 'Some log message',
    };
    it('Should return the identity transformer when given no transformers', () => {
      const identityTransformer = transformers.compose();

      const actual = identityTransformer(value);

      expect(actual).toEqual(value);
    });

    it('should transform a value correctly with 1 transformer', () => {
      const transformer = transformers.compose(x => ({ ...x, extra: true }));

      const actual = transformer(value);

      expect(actual).toEqual({ ...value, extra: true });
    });

    it('should transform a value correctly with multiple transformers', () => {
      const transformer = transformers.compose(
        x => ({ ...x, extra: true }),
        x => ({ ...x, second: true }),
      );

      const actual = transformer(value);

      expect(actual).toEqual({ ...value, extra: true, second: true });
    });
  });
});
