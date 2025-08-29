import winston from 'winston';

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, context, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const contextName = context || 'Application';

    const colors: Record<string, string> = {
      error: '\x1b[31m',
      warn: '\x1b[33m',
      info: '\x1b[38;5;39m',
      debug: '\x1b[32m',
      verbose: '\x1b[36m',
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

const loggerInstance = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'verbose',
  format: fileFormat,
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env['NODE_ENV'] !== 'production') {
  loggerInstance.add(new winston.transports.Console({ format: consoleFormat }));
}

const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorMethod(method: string) {
  switch (method) {
    case 'GET': return c.green + method + c.reset;
    case 'POST': return c.blue + method + c.reset;
    case 'PUT': return c.yellow + method + c.reset;
    case 'DELETE': return c.red + method + c.reset;
    case 'PATCH': return c.magenta + method + c.reset;
    default: return c.cyan + method + c.reset;
  }
}

function colorStatus(statusNum: number) {
  if (statusNum >= 200 && statusNum < 300) return c.green + statusNum + c.reset;
  if (statusNum >= 300 && statusNum < 400) return c.yellow + statusNum + c.reset;
  if (statusNum >= 400 && statusNum < 500) return c.red + statusNum + c.reset;
  return c.magenta + statusNum + c.reset; // 5xx
}

function nestHeader(level = '') {
  const ts = new Date().toLocaleString();
  return `[ExpressJS] ${process.pid}  - ${ts}${level ? `   ${level}` : ''}`;
}
export const loggerStream = {
  write: (line: string) => {
    const message = line.trim();

    try {
      const e = JSON.parse(message) as {
        method: string;
        url: string;
        status: number;
        responseTime: string; // "12.34"
        contentLength: string; // "123" | "-"
        httpVersion: string;
        remoteAddr: string;
        referrer?: string;
        userAgent?: string;
        requestId?: string;
      };

      const parts: string[] = [];

      parts.push(`[HTTP] ${colorMethod(e.method)} ${e.url}`);
      parts.push(`${colorStatus(e.status)}`);
      parts.push(`${e.responseTime}ms`);

      if (e.contentLength) parts.push(`- ${e.contentLength}`);
      if (e.httpVersion) parts.push(`v${e.httpVersion}`);
      if (e.remoteAddr) parts.push(`${c.gray}${e.remoteAddr}${c.reset}`);
      if (e.referrer && e.referrer !== '-') parts.push(`"${e.referrer}"`);
      if (e.userAgent && e.userAgent !== '-') parts.push(`"${e.userAgent}"`);
      if (e.requestId && e.requestId !== '-') parts.push(`${c.gray}rid=${e.requestId}${c.reset}`);

      const formatted = `${nestHeader()} ${parts.join(' ')}`;

      console.log(formatted);

      // file (JSON)
      loggerInstance.info({
        context: 'HTTP',
        message: `${e.method} ${e.url}`,
        status: e.status,
        responseTimeMs: Number(e.responseTime),
        contentLength: e.contentLength,
        httpVersion: e.httpVersion,
        remoteAddr: e.remoteAddr,
        referrer: e.referrer,
        userAgent: e.userAgent,
        requestId: e.requestId,
        timestamp: new Date().toISOString(),
      });
    } catch {
      const cleaned = message.replace(/\s\[[^\]]+\]\s/, ' ');
      console.log(`${nestHeader()} [HTTP] ${cleaned}`);
    }
  },
};

export class Logger {
  private context: string;
  constructor(context: string = 'Application') { this.context = context; }

  private formatMessage(message: string, meta?: any): any {
    return { context: this.context, message, timestamp: new Date().toISOString(), ...meta };
  }

  log(message: string, meta?: any): void { loggerInstance.info(this.formatMessage(message, meta)); }
  info(message: string, meta?: any): void { loggerInstance.info(this.formatMessage(message, meta)); }
  warn(message: string, meta?: any): void { loggerInstance.warn(this.formatMessage(message, meta)); }
  error(message: string, error?: Error | any, meta?: any): void {
    const errorMeta = {
      ...meta,
      ...(error instanceof Error && { error: { message: error.message, stack: error.stack, name: error.name } }),
      ...(error && typeof error === 'object' && !(error instanceof Error) && { error }),
    };
    loggerInstance.error(this.formatMessage(message, errorMeta));
  }
  debug(message: string, meta?: any): void { loggerInstance.debug(this.formatMessage(message, meta)); }
  verbose(message: string, meta?: any): void { loggerInstance.verbose(this.formatMessage(message, meta)); }
}

export default Logger;
