import { z } from 'zod'

export const Neo4jDateSchema = z.object({
  year: z.number(),
  month: z.number(),
  day: z.number(),
})

export const GroupSchema = z.object({
  _id: z.string().optional(),
  identity: z.union([z.number(), z.object({ low: z.number() })]).optional(),
  name: z.string().optional(),
  avatar_src: z.string().optional(),
  properties: z
    .object({
      _id: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
})

export const PagedApplicationsSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    applications: z.array(item),
    count: z.number(),
  })

export type Neo4jDate = z.infer<typeof Neo4jDateSchema>
export type Group = z.infer<typeof GroupSchema>
