import { z } from 'zod'
import { GroupSchema } from './common'
import { UserSchema } from './user'

export const TemplateFieldSchema = z.object({
  label: z.string(),
  type: z.string(),
  value: z.unknown().optional(),
})

export const TemplateSchema = z.object({
  _id: z.string().optional(),
  label: z.string(),
  description: z.string().optional(),
  fields: z.array(TemplateFieldSchema),
  managers: z.array(UserSchema),
  groups: z.array(GroupSchema),
})

export type TemplateField = z.infer<typeof TemplateFieldSchema>
export type Template = z.infer<typeof TemplateSchema>
