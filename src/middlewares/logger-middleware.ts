import express from 'express';
import expressWinston from 'express-winston';
import winston from 'winston';

export const loggerMiddleware = expressWinston.logger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),  // Colori per la console
        winston.format.printf(({ level, message, meta }) => {
          return `${level}: request http ${meta.req.method} ${meta.req.url}`;
        })
      )
    }),
    new winston.transports.File({
      filename: 'logs/request.log',
      format: winston.format.combine(
        winston.format.json(),      // Metadata e JSON per il file
        winston.format.metadata()
      )
    })
  ],
  meta: true, // Metadata solo nel file
  msg: "HTTP {{req.method}} {{req.url}}", // Messaggio personalizzato nel file
  expressFormat: true,
  colorize: false, // Non è più necessario, gestito dal formato della console
  ignoreRoute: function (req, res) { return false; }, // Logga tutte le route
});

export const loggerErrorMiddleware = expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),  // Colori per errori in console
        winston.format.simple()     // Solo il messaggio
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      format: winston.format.combine(
        winston.format.json(),
        winston.format.metadata()
      )
    })
  ]
});
