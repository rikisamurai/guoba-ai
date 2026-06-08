import { useCallback, useState } from 'react'

/**
 * Toggle a boolean value.
 *
 * @param initialValue - The initial boolean value (defaults to `false`)
 * @returns A tuple of `[value, toggle]` where `toggle` flips the value or sets it to a specific boolean
 * @example
 * ```ts
 * const [isOpen, toggleOpen] = useToggle()
 * toggleOpen()     // true
 * toggleOpen()     // false
 * toggleOpen(true) // true
 * ```
 */
export function useToggle(initialValue = false): [boolean, (next?: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback((next?: boolean) => {
    setValue(prev => (next === undefined ? !prev : next))
  }, [])
  return [value, toggle]
}
