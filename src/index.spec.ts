import {
  compose,
  LogMeta,
  createLogger,
  createJsonFormatter,
  Output,
  transformers,
} from '.';

describe('lumberjack', () => {
  describe('#compose', () => {
    const value: LogMeta = {
      level: 'debug',
      message: 'Some log message',
    };
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

    const jsonFormatter = createJsonFormatter({
      spaces: 2,
    });

    beforeEach(() => {
      const write = jest.fn();
      mockedOutput = {
        write,
        writeLn: write,
      };
    });

    it('should log to the output', async () => {
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

    it('should include newly configured default meta data', () => {
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
        defaultMeta: {
          app: 'lumberjack',
        },
      });

      logger.configure({ defaultMeta: { app: 'lumberjack tests' } });
      logger.log('debug', 'it should log anything');

      expect(mockedOutput.write).toHaveBeenCalledWith(
        'debug',
        jsonFormatter({
          app: 'lumberjack tests',
          level: 'debug',
          message: 'it should log anything',
        }),
      );
    });

    it('should add a timestamp without format', () => {
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
        transformer: transformers.timestamp(),
      });

      logger.log('debug', 'it should log anything');

      expect((<any>mockedOutput.write).mock.calls[0][1]).toMatch(
        /"timestamp": "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/,
      );
    });

    it('should add a timestamp with format', () => {
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
        transformer: transformers.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
      });

      logger.log('debug', 'it should log anything');

      expect((<any>mockedOutput.write).mock.calls[0][1]).toMatch(
        /"timestamp": "\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}"/,
      );
    });
  });
});
