import {
  IsDate as _IsDate,
  IsNumber as _IsNumber,
  IsPositive as _IsPositive,
  Max as _Max,
  Min as _Min,
  IsIn as _IsIn,
  IsBoolean as _IsBoolean,
  IsNumberString as _IsNumberString,
  Length as _Length,
  IsArray as _IsArray,
  IsString as _IsString,
  IsNotEmpty as _IsNotEmpty,
  ArrayNotEmpty as _ArrayNotEmpty,
  IsEmail as _IsEmail,
  ValidationOptions,
  IsNumberOptions,
  registerDecorator,
  ValidationArguments,
} from "class-validator"
import ValidatorJS from "validator"

export const IsNumber = (
  options?: IsNumberOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsNumber(
    { ...options },
    {
      ...validationOptions,
      message: "השדה חייב להיות מספר",
    }
  )

export const IsPositive = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsPositive({
    ...validationOptions,
    message: "השדה חייב להיות מספר חיובי",
  })

export const IsEmail = (
  options?: ValidatorJS.IsEmailOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsEmail(
    {
      ...options,
    },
    {
      ...validationOptions,
      message: "המייל אינו חוקי",
    }
  )

export const IsDate = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsDate({
    ...validationOptions,
    message: "השדה חייב להיות תאריך",
  })

export const Max = (
  maxValue: number,
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _Max(maxValue, {
    ...validationOptions,
    message: `הערך המקסימלי הינו ${maxValue}`,
  })

export const Min = (
  minValue: number,
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _Min(minValue, {
    ...validationOptions,
    message: `הערך המינימלי הינו ${minValue}`,
  })

export const IsIn = (
  values: readonly any[],
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsIn(values, {
    ...validationOptions,
    message: `הערך חייב להיות מתוך רשימת הערכים האפשריים בלבד`,
  })

export const IsBoolean = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsBoolean({
    ...validationOptions,
    message: `הערך חייב להיות בוליאני`,
  })

export const IsNumberString = (
  options?: ValidatorJS.IsNumericOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsNumberString(
    { ...options },
    {
      ...validationOptions,
      message: `הערך חייב להיות מחרוזת המכילה מספרים בלבד`,
    }
  )

export const Length = (
  min: number,
  max?: number,
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _Length(min, max, {
    ...validationOptions,
    message:
      max === min
        ? `האורך חייב להיות בדיוק ${min}`
        : `האורך חייב להיות בין ${min} ל ${max}`,
  })

export const IsArray = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsArray({
    ...validationOptions,
    message: `הערך המתקבל חייב להיות מערך`,
  })

export const IsString = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsString({
    ...validationOptions,
    message: `הערך המתקבל חייב להיות מסוג מחרוזת`,
  })

export const IsNotEmpty = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _IsNotEmpty({
    ...validationOptions,
    message: `השדה לא יכול להיות ריק`,
  })

export const ArrayNotEmpty = (
  validationOptions?: ValidationOptions
): PropertyDecorator =>
  _ArrayNotEmpty({
    ...validationOptions,
    message: `המערך לא יכול להיות ריק`,
  })
