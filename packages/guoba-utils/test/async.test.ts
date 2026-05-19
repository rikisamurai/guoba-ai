import { afterEach, describe, expect, it, vi } from 'vitest'
import { sleep } from '../src'

describe('async', () => {
  describe('sleep', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return a Promise', () => {
      expect(sleep(0)).toBeInstanceOf(Promise)
    })

    it('should resolve after the given delay', async () => {
      vi.useFakeTimers()
      const resolved = vi.fn()
      const promise = sleep(100).then(resolved)

      await vi.advanceTimersByTimeAsync(99)
      expect(resolved).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(1)
      await promise
      expect(resolved).toHaveBeenCalledTimes(1)
    })
  })
})
