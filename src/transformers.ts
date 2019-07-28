import { format as dateFormat } from 'date-fns';

import { LogMeta } from './base';

export type Transformer = (logMeta: LogMeta) => LogMeta;

type TimestampOptions = {
  /**
   * The format string for the timestamp. e.g. 'YYYY-MM-DD HH:mm:ss'.
   * If this property is undefined, the date will be formatted as ISO.
   * See date-fns docs at: https://date-fns.org/v1.30.1/docs/format.
   */
  format?: string;
};

export const transformers = {
  /**
   * Compose multiple transformers returning a function which calls the given
   * transformers in order, from left to right.
   */
  compose: (...transformers: Transformer[]): Transformer => {
    return (logMeta: LogMeta) => {
      return transformers.reduce((acc, curr) => curr(acc), logMeta);
    };
  },
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
