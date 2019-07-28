import { LogLevel } from './base';
import { Formatter } from './formatters';

export interface Output {
  supportsColors?: boolean;
  formatter?: Formatter;
  write: (logLevel: LogLevel, formattedData: string) => Promise<void>;
  writeLn: (logLevel: LogLevel, formattedData: string) => Promise<void>;
}

export type OutputOptions = {
  formatter?: Formatter;
  withColors?: boolean;
};

export const outputs = {
  console: (options: OutputOptions = { withColors: true }): Output => {
    const write = async (logLevel: LogLevel, formattedData: string) => {
      console[logLevel](formattedData);
    };
    return {
      supportsColors: options.withColors,
      formatter: options.formatter,
      write,
      writeLn: (...args) => write(...args),
    };
  },
};
