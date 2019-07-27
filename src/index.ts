import { format as dateFormat } from 'date-fns';
import jsonStringify from 'fast-safe-stringify';
import * as util from 'util';

import * as colorizer from './colorizer';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function getSeverity(logLevel: LogLevel): number {
  switch (logLevel) {
    case 'error':
      return 0;
    case 'warn':
      return 1;
    case 'info':
      return 2;
    case 'debug':
    default:
      return 3;
  }
}

export interface Output {
  formatter?: Formatter;
  write: (logLevel: LogLevel, formattedData: string) => Promise<void>;
  writeLn: (logLevel: LogLevel, formattedData: string) => Promise<void>;
}

export type OutputOptions = {
  formatter?: Formatter;
};

export const outputs = {
  console: (options: OutputOptions = {}): Output => {
    const write = async (logLevel: LogLevel, formattedData: string) => {
      console[logLevel](formattedData);
    };
    return {
      formatter: options.formatter,
      write,
      writeLn: (...args) => write(...args),
    };
  },
};

export type LogMeta = {
  level: LogLevel;
  message: string;
  [key: string]: any;
};

export type Transformer = (logMeta: LogMeta) => LogMeta;

export function compose(...transformers: Transformer[]): Transformer {
  return (logMeta: LogMeta) => {
    return transformers.reduce((acc, curr) => curr(acc), logMeta);
  };
}

type TimestampOptions = {
  /**
   * The format string for the timestamp. e.g. 'YYYY-MM-DD HH:mm:ss'.
   * See date-fns docs at: https://date-fns.org/v1.30.1/docs/format
   */
  format?: string;
};

export const transformers = {
  /**
   * Adds a timestamp meta data field.
   */
  timestamp: (options: TimestampOptions = {}): Transformer => (x: LogMeta) => {
    const now = new Date();
    const timestamp = options.format
      ? dateFormat(now, options.format)
      : now.toISOString();
    const transformed: LogMeta = {
      ...x,
      timestamp,
    };
    return transformed;
  },
};

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
  simple: (): Formatter => {
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
    return ({ timestamp, app, level, message }) =>
      `[${timestamp}] [${app}] ${simpleLevel(level)}: ${message}`;
  },
};

type LoggerOptions = {
  threshold: LogLevel;
  formatter: Formatter;
  outputs?: Output[];
  transformer?: Transformer;
  defaultMeta?: { [key: string]: any };
};

type ConfigLoggerOptions = {
  threshold?: LogLevel;
  formatter?: Formatter;
  outputs?: Output[];
  transformer?: Transformer;
  defaultMeta?: { [key: string]: any };
};

type Logger = {
  log: (level: LogLevel, ...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  configure: (options: ConfigLoggerOptions) => void;
};

const formatRegExp = /%[scdjifoO%]/g;
const formatArgMapper = (x: any) => (typeof x === 'string' ? '%s' : '%O');
const format = (formatString: string, ...args: any[]) =>
  util.formatWithOptions(
    {
      depth: null,
    },
    formatString,
    ...args,
  );
function getMessage(args: any[]) {
  const [head, ...tail] = args;
  if (typeof head !== 'string') {
    return format(args.map(formatArgMapper).join(' '), ...args);
  }

  if (tail.length === 0) {
    return head;
  }

  const tokens = head.match(formatRegExp);
  const tokenCountToAdd = tokens ? tail.length - tokens.length : tail.length;
  const headWithAddedTokens = [head]
    .concat(tail.slice(tail.length - tokenCountToAdd).map(formatArgMapper))
    .join(' ');
  return format(headWithAddedTokens, ...tail);
}

export function createLogger(options: LoggerOptions): Logger {
  const optionsToUse = { ...options };

  function isSevereEnough(logLevel: LogLevel) {
    return getSeverity(logLevel) <= getSeverity(optionsToUse.threshold);
  }

  const log = (logLevel: LogLevel, ...args: any[]) => {
    if (!isSevereEnough(logLevel)) return;

    const outputsToUse = optionsToUse.outputs || [outputs.console()];
    const transformer = optionsToUse.transformer || (x => x);
    outputsToUse.forEach(output => {
      const message = getMessage(args);
      const logMeta = {
        ...optionsToUse.defaultMeta,
        level: logLevel,
        message,
      };
      const formattedMeta = optionsToUse.formatter(transformer(logMeta));
      output.writeLn(logLevel, formattedMeta);
    });
  };

  const partialLog = (logLevel: LogLevel) => (...args: any[]) =>
    log(logLevel, ...args);

  const debug = partialLog('debug');
  const info = partialLog('info');
  const warn = partialLog('warn');
  const error = partialLog('error');
  const configure = (newOptions: ConfigLoggerOptions) => {
    optionsToUse.threshold = newOptions.threshold || optionsToUse.threshold;
    optionsToUse.formatter = newOptions.formatter || optionsToUse.formatter;
    optionsToUse.outputs = newOptions.outputs || optionsToUse.outputs;
    optionsToUse.transformer =
      newOptions.transformer || optionsToUse.transformer;
    optionsToUse.defaultMeta =
      newOptions.defaultMeta || optionsToUse.defaultMeta;
  };
  return {
    log,
    debug,
    info,
    warn,
    error,
    configure,
  };
}
