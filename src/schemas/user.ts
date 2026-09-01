import { z } from 'zod'

export const UserSchema = z.object({
  _id: z.string().optional(),
  username: z.string().optional(),
  display_name: z.string().optional(),
  name: z.string().optional(),
  name_romaji: z.string().optional(),
  name_kanji: z.string().optional(),
  family_name: z.string().optional(),
  family_name_romaji: z.string().optional(),
  family_name_kanji: z.string().optional(),
  first_name: z.string().optional(),
  first_name_romaji: z.string().optional(),
  first_name_kanji: z.string().optional(),
  email_address: z.string().optional(),
  avatar_src: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>
