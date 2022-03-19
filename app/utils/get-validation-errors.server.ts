import { ObjectSchema } from "joi";

type Result<Shape> = {
  fields: Shape;
  errors: { [fieldName: string]: string } | null;
};

export const validate = <Shape>(
  schema: ObjectSchema<Shape>,
  fields: unknown
): Result<Shape> => {
  const result = schema.validate(fields, { abortEarly: false });
  const errors = result.error?.details.reduce((output, field) => {
    output[field.path[0]] = field.message;
    return output;
  }, {} as { [fieldName: string]: string });
  return { fields: result.value as Shape, errors: errors ?? null };
};
