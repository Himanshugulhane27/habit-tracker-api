// This is a helper function that creates consistent response format
// Instead of writing { success: true, message: ..., data: ... } every time
// We just call apiResponse(res, 200, "message", data)

import { Response } from 'express';

export const apiResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    success: statusCode < 400, // true for success, false for errors
    message,
    data: data || null,
  });
};