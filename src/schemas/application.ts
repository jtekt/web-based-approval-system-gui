import { z } from 'zod'
import { Neo4jDateSchema, GroupSchema } from './common'
import { UserSchema } from './user'

export const FieldSchema = z.object({
  label: z.string(),
  type: z.string(),
  value: z.unknown().optional(),
})

export const HankoPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const HankoSchema = z.object({
  file_id: z.string(),
  page_number: z.number(),
  position: HankoPositionSchema,
  scale: z.number().optional(),
  date: z.union([z.string(), z.date()]).optional(),
})

export const ApprovalSchema = z.object({
  _id: z.string().optional(),
  date: Neo4jDateSchema.optional(),
  comment: z.string().optional(),
  attachment_hankos: z.union([z.string(), z.array(HankoSchema)]).optional(),
})

export const RecipientSchema = UserSchema.extend({
  submission: z.object({
    flow_index: z.number(),
    notified: z.boolean().optional(),
  }),
  approval: ApprovalSchema.optional(),
  refusal: ApprovalSchema.optional(),
})

export const ApplicationSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  type: z.string(),
  form_data: z.union([z.string(), z.array(FieldSchema)]).optional(),
  private: z.boolean().optional(),
  applicant: RecipientSchema,
  recipients: z.array(RecipientSchema),
  visibility: z.array(GroupSchema).optional(),
  creation_date: Neo4jDateSchema.optional(),
  forbidden: z.boolean().optional(),
  progress: z.number().optional(),
  current_recipient: RecipientSchema.optional(),
})

export const ApplicationListItemSchema = ApplicationSchema

export type Field = z.infer<typeof FieldSchema>
export type Hanko = z.infer<typeof HankoSchema>
export type Approval = z.infer<typeof ApprovalSchema>
export type Recipient = z.infer<typeof RecipientSchema>
export type Application = z.infer<typeof ApplicationSchema>
