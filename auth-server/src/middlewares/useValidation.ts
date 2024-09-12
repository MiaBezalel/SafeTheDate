import { ClassConstructor, plainToInstance } from "class-transformer"
import { validate } from "class-validator"
import { NextFunction, Request, RequestHandler, Response } from "express"
import { mapValidationErrors } from "../utils/error"

async function validateDto<T extends ClassConstructor<any>>(
  classDto: T,
  payload: object
) {
  const objInstance = plainToInstance(classDto, payload)
  return await validate(objInstance)
}

type payloadOrigin = "query" | "body"

const queryParamsParser = (queryParams: Object) => {
  if (queryParams && typeof queryParams === "object") {
    Object.entries(queryParams).forEach(([key, value]) => {
      // Value is boolean
      if (["true", "false"].includes(value)) {
        // @ts-ignore
        queryParams[key] = value === "true"
      }
    })
  }
}

const useValidateDto =
  <T extends ClassConstructor<any>>(c: T, origin: payloadOrigin) =>
  async (req: Request, res: Response, next: NextFunction) => {

    if (origin === "query") {
      queryParamsParser(req[origin])
    }

    const errors = await validateDto(c, req[origin])
    if (errors && errors.length > 0)
      res.status(400).json(mapValidationErrors(errors))
    else {
      req[origin] = plainToInstance(c, req[origin], {
        excludeExtraneousValues: true,
      })
      next()
    }
  }
export const useValidateBodyDto = <T extends ClassConstructor<any>>(c: T) =>
  useValidateDto(c, "body")
export const useValidateQueryDto = <T extends ClassConstructor<any>>(c: T) =>
  useValidateDto(c, "query")
