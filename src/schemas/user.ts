import { z } from 'zod'

export const UserSchema = z.object({
  _id: z.string().optional(),
  identity: z.union([z.number(), z.object({ low: z.number() })]).optional(),
  username: z.string().optional(),
  preferred_username: z.string().optional(),
  display_name: z.string().optional(),
  name: z.string().optional(),
  last_name: z.string().optional(),
  last_name_kanji: z.string().optional(),
  family_name: z.string().optional(),
  family_name_kanji: z.string().optional(),
  first_name: z.string().optional(),
  first_name_kanji: z.string().optional(),
  full_name: z.string().optional(),
  name_kanji: z.string().optional(),
  email_address: z.string().optional(),
  avatar_src: z.string().optional(),
  isAdmin: z.boolean().optional(),
  administrator: z.boolean().optional(),
  properties: z
    .object({
      isAdmin: z.boolean().optional(),
      administrator: z.boolean().optional(),
      _id: z.string().optional(),
    })
    .optional(),
})

export type User = z.infer<typeof UserSchema>
