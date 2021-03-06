import * as util from 'util';

import { LogLevel, getSeverity } from './base';
import { Formatter, formatters } from './formatters';
import { Output, outputs } from './outputs';
import { Transformer } from './transformers';

export * from './base';
export * from './formatters';
export * from './outputs';
export * from './transformers';

type LoggerOptions = {
  threshold: LogLevel;
  formatter?: Formatter;
  outputs?: Output[];
  transformer?: Transformer;
  defaultMeta?: { [key: string]: any };
  splatOptions?: {
    compact?: boolean;
    colors?: boolean;
  };
};

type ConfigLoggerOptions = { [K in keyof LoggerOptions]?: LoggerOptions[K] };

type Logger = {
  log: (level: LogLevel, ...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  configure: (options: ConfigLoggerOptions) => void;
};

const formatRegExp = /%[scdjifoO%]/g;
const formatArgMapper = (x: any) => {
  switch (typeof x) {
    case 'string':
      return '%s';
    case 'number':
    case 'bigint':
      return '%d';
    case 'boolean':
      return '%O';
    default:
      return '%O';
  }
};

export function createLogger(options: LoggerOptions): Logger {
  const optionsToUse = { ...options };

  function isSevereEnough(logLevel: LogLevel) {
    return getSeverity(logLevel) <= getSeverity(optionsToUse.threshold);
  }

  function format(withColors: boolean, formatString: string, ...args: any[]) {
    return util.formatWithOptions(
      {
        depth: null,
        compact:
          (optionsToUse.splatOptions && optionsToUse.splatOptions.compact) ||
          true,
        colors: withColors,
      },
      formatString,
      ...args,
    );
  }

  function getMessage(withColors: boolean, args: any[]) {
    const [head, ...tail] = args;
    if (typeof head !== 'string') {
      return format(withColors, args.map(formatArgMapper).join(' '), ...args);
    }

    if (tail.length === 0) {
      return head;
    }

    const tokens = head.match(formatRegExp);
    const tokenCountToAdd = tokens ? tail.length - tokens.length : tail.length;
    const headWithAddedTokens = [head]
      .concat(tail.slice(tail.length - tokenCountToAdd).map(formatArgMapper))
      .join(' ');
    return format(withColors, headWithAddedTokens, ...tail);
  }

  const log = (logLevel: LogLevel, ...args: any[]) => {
    if (!isSevereEnough(logLevel)) return;

    const outputsToUse = optionsToUse.outputs || [outputs.console()];
    const transformer = optionsToUse.transformer || (x => x);
    const formatter = optionsToUse.formatter || formatters.simple();
    outputsToUse.forEach(output => {
      const message = getMessage(output.supportsColors || false, args);
      const logMeta = {
        ...optionsToUse.defaultMeta,
        level: logLevel,
        message,
      };
      const formattedMeta = formatter(
        transformer(logMeta),
        output.supportsColors,
      );
      output.writeLn(logLevel, formattedMeta);
    });
  };

  const partialLog = (logLevel: LogLevel) => (...args: any[]) =>
    log(logLevel, ...args);

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
    debug: partialLog('debug'),
    info: partialLog('info'),
    warn: partialLog('warn'),
    error: partialLog('error'),
    configure,
  };
}
