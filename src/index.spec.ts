import { compose, LogMeta, createLogger, createJsonFormatter, Output } from '.';

const value: LogMeta = {
  level: 'debug',
  message: 'Some log message',
};

describe('lumberjack', () => {
  describe('#compose', () => {
    it('Should return the identity transformer when given no transformers', () => {
      const identityTransformer = compose();

      const actual = identityTransformer(value);

      expect(actual).toEqual(value);
    });

    it('should transform a value correctly with 1 transformer', () => {
      const transformer = compose(x => ({ ...x, extra: true }));

      const actual = transformer(value);

      expect(actual).toEqual({ ...value, extra: true });
    });

    it('should transform a value correctly with multiple transformers', () => {
      const transformer = compose(
        x => ({ ...x, extra: true }),
        x => ({ ...x, second: true }),
      );

      const actual = transformer(value);

      expect(actual).toEqual({ ...value, extra: true, second: true });
    });
  });

  describe('logger', () => {
    let mockedOutput: Output;
    beforeEach(() => {
      mockedOutput = {
        write: jest.fn(),
        writeLn: (...args) => mockedOutput.write(...args),
      };
    });

    it('should log to the output', async () => {
      const jsonFormatter = createJsonFormatter({
        spaces: 2,
      });
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
      });

      logger.log('debug', 'it', 'should', 'log', 'anything');

      expect(mockedOutput.write).toHaveBeenCalledWith(
        'debug',
        jsonFormatter({
          level: 'debug',
          message: 'it should log anything',
        }),
      );
    });

    it('should include default meta data', () => {
      const jsonFormatter = createJsonFormatter({
        spaces: 2,
      });
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
        defaultMeta: {
          app: 'lumberjack',
        },
      });

      logger.log('debug', 'it should log anything');

      expect(mockedOutput.write).toHaveBeenCalledWith(
        'debug',
        jsonFormatter({
          app: 'lumberjack',
          level: 'debug',
          message: 'it should log anything',
        }),
      );
    });
  });
});
