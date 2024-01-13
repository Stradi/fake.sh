import {
  pino,
  stdTimeFunctions,
  transport,
  type DestinationStream,
} from 'pino';

const pinoTransport = transport({
  targets: [
    {
      target: 'pino-pretty',
      level: 'trace',
    },
    {
      target: 'pino/file',
      level: 'trace',
      options: {
        destination: `${process.cwd()}/data/logs/main.log`,
        mkdir: true,
      },
    },
    {
      target: 'pino/file',
      level: 'error',
      options: {
        destination: `${process.cwd()}/data/logs/error.log`,
        mkdir: true,
      },
    },
  ],
});

export const log = pino(
  {
    timestamp: stdTimeFunctions.isoTime,
    level: 'trace',
  },
  pinoTransport as DestinationStream
);
