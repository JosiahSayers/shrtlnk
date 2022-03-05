import { ObjectSchema, Schema, ValidationResult } from "joi";

export const getErrors = <Shape>(
  schema: ObjectSchema<Shape>,
  fields: unknown
): { [fieldName: string]: string } | null => {
  const result = schema.validate(fields, { abortEarly: false });
  const mapped = result.error?.details.reduce((output, field) => {
    output[field.path[0]] = field.message;
    return output;
  }, {} as { [fieldName: string]: string });
  return mapped ?? null;
};
