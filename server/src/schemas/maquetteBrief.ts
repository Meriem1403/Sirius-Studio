import { z } from 'zod'

export const maquetteBriefSchema = z
  .object({
    title: z.string().min(3).max(120).optional(),
    type: z.string().min(2).max(80).optional(),
    message: z.string().max(8000),
    needs: z.array(z.string()).min(1).max(12),
    situation: z.enum(['existing', 'idea', 'unknown']),
    website: z.string().max(500).optional(),
    objectives: z.array(z.string()).max(8).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.situation !== 'unknown' && data.message.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Message trop court.',
        path: ['message'],
      })
    }
  })

export function resolveBriefTitle(data: z.infer<typeof maquetteBriefSchema>, company?: string | null) {
  if (data.title?.trim()) return data.title.trim()
  const need = data.needs[0] ?? 'Projet web'
  const co = company?.trim()
  return co ? `${need} — ${co}` : need
}

export function resolveBriefType(data: z.infer<typeof maquetteBriefSchema>) {
  return data.type?.trim() || data.needs[0] || 'Site vitrine'
}
