import { ErrorRequestHandler } from "express";
import { omit } from "lodash";
import { ErrorWithStatus } from "~/schemas/models/error";

export const defaultHandlerError: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ["status"]));
  }
};
