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

interface Logger {
  log: (level: LogLevel, ...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export function createLogger(options: LoggerOptions): Logger {
  const outputs = options.outputs || [createConsoleOutput()];
  const log = (logLevel: LogLevel, ...args: any[]) => {
    outputs.forEach(output => {
      const logMeta = {
        ...options.defaultMeta,
        level: logLevel,
        message: args.join(' '),
      };
      const formattedMeta = options.formatter(logMeta);
      output.writeLn(logLevel, formattedMeta);
    });
  };
  const debug = (...args: any[]) => log('debug', ...args);
  const info = (...args: any[]) => log('info', ...args);
  const warn = (...args: any[]) => log('warn', ...args);
  const error = (...args: any[]) => log('error', ...args);
  return {
    log,
    debug,
    info,
    warn,
    error,
  };
}
