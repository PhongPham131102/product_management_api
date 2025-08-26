import winston from 'winston';

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, context, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const contextName = context || 'Application';

    const colors: { [key: string]: string } = {
      error: '\x1b[31m', // red
      warn: '\x1b[33m',  // yellow    
      info: '\x1b[38;5;39m', // blue
      debug: '\x1b[32m', // green
      verbose: '\x1b[36m' // cyan
    };
    const reset = '\x1b[0m';
    const color = colors[level] || colors['info'];

    return `${color}${timestamp} ${level.toUpperCase()} [${contextName}]: ${message}${reset}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Log levels hierarchy: error > warn > info > debug > verbose
// Chỉ hiển thị logs từ level được set trở lên
const loggerInstance = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'verbose',
  format: fileFormat,
  transports: [
    // File transport cho tất cả logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    // new winston.transports.File({
    //   filename: 'logs/combined.log'
    // })
  ]
});

// Console transport cho development
if (process.env['NODE_ENV'] !== 'production') {
  loggerInstance.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

export const loggerStream = {
  write: (message: string) => {
    loggerInstance.info(message.trim());
  },
};

export class Logger {
  private context: string;

  constructor(context: string = 'Application') {
    this.context = context;
  }

  private formatMessage(message: string, meta?: any): any {
    const logData = {
      context: this.context,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    return logData;
  }

  log(message: string, meta?: any): void {
    loggerInstance.info(this.formatMessage(message, meta));
  }

  info(message: string, meta?: any): void {
    loggerInstance.info(this.formatMessage(message, meta));
  }

  warn(message: string, meta?: any): void {
    loggerInstance.warn(this.formatMessage(message, meta));
  }

  error(message: string, error?: Error | any, meta?: any): void {
    const errorMeta = {
      ...meta,
      ...(error instanceof Error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }),
      ...(error && typeof error === 'object' && !(error instanceof Error) && { error }),
    };

    loggerInstance.error(this.formatMessage(message, errorMeta));
  }

  debug(message: string, meta?: any): void {
    loggerInstance.debug(this.formatMessage(message, meta));
  }

  verbose(message: string, meta?: any): void {
    loggerInstance.verbose(this.formatMessage(message, meta));
  }
}

export default Logger;