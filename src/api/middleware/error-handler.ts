// src/api/middleware/error-handler.ts
// Spec: .claude.md §5 — Standardized Error Handling
// All errors → { httpStatus, developerMessage (EN), clientMessage (ES) }

import type { Request, Response, NextFunction } from 'express';
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
