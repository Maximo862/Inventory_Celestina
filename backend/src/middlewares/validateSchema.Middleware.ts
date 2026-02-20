import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateSchema = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      console.error(err);

      return res.status(400).json({
        error: "Invalid inputs"
      });
    }
  };
};
