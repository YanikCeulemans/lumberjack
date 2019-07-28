import {
  LogMeta,
  createLogger,
  Output,
  transformers,
  formatters,
  LogLevel,
} from '.';
import * as colorizer from './colorizer';

describe('lumberjack', () => {
  describe('logger', () => {
    let mockedOutput: Output;

    const jsonFormatter = formatters.json({
      spaces: 2,
    });

    beforeEach(() => {
      const write = jest.fn();
      mockedOutput = {
        write,
        writeLn: write,
      };
    });

    it('should log to the output', () => {
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

    it('should log spread args', () => {
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
      });

      logger.log('debug', 'it should log anything', true, { a: 1 }, [], 10);

      expect(mockedOutput.write).toHaveBeenCalledWith(
        'debug',
        jsonFormatter({
          level: 'debug',
          message: 'it should log anything true \n{ a: 1 }\n \n[]\n 10',
        }),
      );
    });

    it('should log nested objects', () => {
      const logger = createLogger({
        threshold: 'debug',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
      });

      logger.log('debug', 'it should log anything', {
        some: { complex: { object: { with: { nested: 'value' } } } },
      });

      expect(mockedOutput.write).toHaveBeenCalledWith(
        'debug',
        jsonFormatter({
          level: 'debug',
          message: `it should log anything \n{ some: { complex: { object: { with: { nested: 'value' } } } } }\n`,
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

    it('should log with a custom formatter', () => {
      const customFormatter = ({ level, message, app, timestamp }: LogMeta) =>
        `[${timestamp}] [${app}] ${level.toUpperCase()}: ${message}`;
      const logger = createLogger({
        threshold: 'debug',
        formatter: customFormatter,
        outputs: [mockedOutput],
        transformer: transformers.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        defaultMeta: {
          app: 'lumberjack',
        },
      });

      logger.debug('it should log anything');

      expect((<any>mockedOutput.write).mock.calls[0][1]).toMatch(
        /\[.+\] \[lumberjack\] DEBUG: it should log anything/,
      );
    });

    it('should not log if the level does not pass the threshold', () => {
      const logger = createLogger({
        threshold: 'warn',
        formatter: jsonFormatter,
        outputs: [mockedOutput],
      });

      logger.log('info', 'it should log anything');

      expect(mockedOutput.write).not.toHaveBeenCalled();
    });

    const cases: LogLevel[][] = [['debug'], ['info'], ['warn'], ['error']];
    it.each(cases)(
      'logger.%s() should log to the correct level',
      (level: LogLevel) => {
        const logger = createLogger({
          threshold: 'debug',
          formatter: jsonFormatter,
          outputs: [mockedOutput],
        });

        logger[level]('it should log anything');

        expect(mockedOutput.write).toHaveBeenCalledWith(
          level,
          jsonFormatter({
            level,
            message: 'it should log anything',
          }),
        );
      },
    );
  });
});
