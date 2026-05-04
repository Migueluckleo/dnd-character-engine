// src/api/middleware/error-handler.ts
// Spec: .claude.md §5 — Standardized Error Handling
// All errors → { httpStatus, developerMessage (EN), clientMessage (ES) }

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiError } from '../../types/index';

export class AppError extends Error implements ApiError {
  constructor(
    public httpStatus: number,
    public developerMessage: string,
    public clientMessage: string,
  ) {
    super(developerMessage);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      httpStatus: 422,
      developerMessage: err.message,
      clientMessage: 'La información enviada no tiene el formato esperado.',
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      httpStatus: 400,
      developerMessage: err.message,
      clientMessage: 'La solicitud enviada no tiene un formato JSON válido.',
    });
    return;
  }

  if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.too.large') {
    res.status(413).json({
      httpStatus: 413,
      developerMessage: 'Request payload too large.',
      clientMessage: 'La imagen es demasiado pesada incluso después de comprimirla.',
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.httpStatus).json({
      httpStatus: err.httpStatus,
      developerMessage: err.developerMessage,
      clientMessage: err.clientMessage,
    });
    return;
  }

  // Unhandled error — log and return generic 500
  console.error(err);
  res.status(500).json({
    httpStatus: 500,
    developerMessage: err instanceof Error ? err.message : 'Unknown error',
    clientMessage: 'Ha ocurrido un error interno. Por favor, intenta de nuevo.',
  });
}
