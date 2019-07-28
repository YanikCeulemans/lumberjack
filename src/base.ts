export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function getSeverity(logLevel: LogLevel): number {
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

export type LogMeta = {
  readonly level: LogLevel;
  message: string;
  [key: string]: any;
};
