export interface Logger {
  debug(message: string, meta?: unknown): void
  info(message: string, meta?: unknown): void
  warn(message: string, meta?: unknown): void
  error(message: string, meta?: unknown): void
}

export class ConsoleLogger implements Logger {
  info(message: string, meta?: unknown): void {
    console.log(`INFO: ${message}`, meta ?? '');
  }
  debug(message: string, meta?: unknown): void {
    console.debug(`DEBUG: ${message}`, meta ?? '');
  }
  warn(message: string, meta?: unknown): void {
    console.warn(`WARN: ${message}`, meta ?? '');
  }
  error(message: string, meta?: unknown): void {
    console.error(`ERROR: ${message}`, meta ?? '');
  }
}
