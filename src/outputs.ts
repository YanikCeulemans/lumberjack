import { LogLevel } from './base';
import { Formatter } from './formatters';

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
