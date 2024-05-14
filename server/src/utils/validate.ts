import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/src/middlewares/schema";
import { httpStatus } from "~/constants/status";
import { EntityError, ErrorWithStatus } from "~/schemas/models/error";

export const validate = (
  validations: RunnableValidationChains<ValidationChain>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const errorsObject = errors.mapped();
    // console.log(errorsObject)
    const entityErrors = new EntityError({ errors: {} });
    for (const key in errorsObject) {
      const { msg } = errorsObject[key];
      if (
        msg instanceof ErrorWithStatus &&
        msg.status !== httpStatus.UNPROCESSABLE_ENTITY
      ) {
        return next(msg);
      }
      entityErrors.errors[key] = errorsObject[key];
    }

    next(entityErrors);
  };
};
