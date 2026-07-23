type LogLevel = 'info' | 'warn' | 'error';

interface LogFields {
  event: string;
  [key: string]: unknown;
}

function log(level: LogLevel, fields: LogFields) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    ...fields,
  };
  // JSON.stringify on one line = one queryable log entry in Vercel
  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (fields: LogFields) => log('info', fields),
  warn: (fields: LogFields) => log('warn', fields),
  error: (fields: LogFields) => log('error', fields),
};