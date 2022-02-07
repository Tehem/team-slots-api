/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable require-jsdoc */

import { z, ZodTypeDef } from 'zod'

export function number<
  Schema extends z.ZodType<number, ZodTypeDef, number | undefined>
>(schema: Schema) {
  return z.preprocess((value) => (value ? Number(value) : value), schema)
}

export function date<
  Schema extends z.ZodType<Date | undefined, ZodTypeDef, Date | undefined>
>(schema: Schema) {
  return z.preprocess(
    (value) => (value ? new Date(value as string) : value),
    schema
  )
}
