import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// this is a middleware factory
// it takes a schema and returns a middleware function
// the middleware validates req.body against the schema
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    // abortEarly: false means show ALL errors at once, not just first one

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: messages[0], // show first error message
        data: null,
      });
    }

    next(); // no errors, continue to controller
  };
};

export default validate;