import jsonStringify from 'fast-safe-stringify';

import { LogLevel, LogMeta } from './base';
import * as colorizer from './colorizer';

export type Formatter = (logMeta: LogMeta, withColors?: boolean) => string;

type JsonFormatterOptions = {
  /**
   * The amount of spaces to be used for formatting the `LogMeta` object.
   */
  spaces?: number;
};

type SimpleFormatterOptions = {
  /**
   * A format fn which will be used to format the given `LogMeta`. The `simpleFormat`
   * parameter is a simple preformatted string containing the log level and message.
   * If this property is undefined, the `simpleFormat` will be returned when using
   * this formatter.
   */
  formatFn?: (logMeta: LogMeta, simpleFormat: string) => string;
};

export const formatters = {
  json: (options: JsonFormatterOptions): Formatter => {
    return (logMeta, _ = false) =>
      jsonStringify(logMeta, undefined, options.spaces);
  },
  simple: (options: SimpleFormatterOptions = {}): Formatter => {
    const formatFn = options.formatFn || ((_, x) => x);
    function simpleLevel(logLevel: LogLevel, withColors: boolean) {
      if (!withColors) return logLevel.toUpperCase();

      switch (logLevel) {
        case 'debug':
          return colorizer.green(logLevel.toUpperCase());
        case 'info':
          return colorizer.blue(logLevel.toUpperCase());
        case 'warn':
          return colorizer.yellow(logLevel.toUpperCase());
        case 'error':
          return colorizer.red(logLevel.toUpperCase());
      }
    }
    return (logMeta, withColors = false) =>
      formatFn(
        logMeta,
        `${simpleLevel(logMeta.level, withColors)}: ${logMeta.message}`,
      );
  },
};
