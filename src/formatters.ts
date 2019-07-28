import jsonStringify from 'fast-safe-stringify';

import { LogLevel, LogMeta } from './base';
import * as colorizer from './colorizer';

export type Formatter = (logMeta: LogMeta) => string;

type JsonFormatterOptions = {
  /**
   * The amount of spaces to be used for formatting the `LogMeta` object.
   */
  spaces?: number;
};

export const formatters = {
  json: (options: JsonFormatterOptions): Formatter => {
    return (logMeta: LogMeta) =>
      jsonStringify(logMeta, undefined, options.spaces);
  },
  simple: (
    formatFn: (logMeta: LogMeta, simpleFormat: string) => string = (_, x) => x,
  ): Formatter => {
    function simpleLevel(logLevel: LogLevel) {
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
    return logMeta =>
      formatFn(logMeta, `${simpleLevel(logMeta.level)}: ${logMeta.message}`);
  },
};
