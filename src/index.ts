type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Output {
  formatter?: Formatter;
  write: (logLevel: LogLevel, formattedData: string) => Promise<void>;
  writeLn: (logLevel: LogLevel, formattedData: string) => Promise<void>;
}

export function createConsoleOutput(): Output {
  const write = async (logLevel: LogLevel, formattedData: string) => {
    console[logLevel](formattedData);
  };
  return {
    write,
    writeLn: (...args) => write(...args),
  };
}

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

export type Formatter = (logMeta: LogMeta) => string;

type JsonFormatterOptions = { spaces?: number };

export function createJsonFormatter(
  options: JsonFormatterOptions = {},
): Formatter {
  return (logMeta: LogMeta) =>
    JSON.stringify(logMeta, undefined, options.spaces);
}

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

export function createLogger(options: LoggerOptions): Logger {
  const optionsToUse = { ...options };
  const outputs = optionsToUse.outputs || [createConsoleOutput()];
  const log = (logLevel: LogLevel, ...args: any[]) => {
    outputs.forEach(output => {
      const logMeta = {
        ...optionsToUse.defaultMeta,
        level: logLevel,
        message: args.join(' '),
      };
      const formattedMeta = optionsToUse.formatter(logMeta);
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
