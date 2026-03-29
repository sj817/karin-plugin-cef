import { vi } from 'vitest'

export const init = vi.fn().mockResolvedValue(undefined)
export const screenshot = vi.fn().mockResolvedValue(Buffer.from('mock-screenshot'))
export const shutdown = vi.fn().mockResolvedValue(undefined)
