/**
 * @file use-sync-state.ts
 */

import { useState } from 'react'

/**
 * A custom React hook that synchronizes the state with the prop.
 *
 * @template T - The type of the prop.
 * @param prop - The prop to synchronize with the state.
 * @param comparator - Compare current and previous prop value, return true if they are identical.
 * @returns A state variable, and a function to update it.
 *
 * @example
 * const [state, setState] = useSyncState(initialProp);
 */
export function useSyncState<T>(
  prop: T,
  comparator: (pre: T, cur: T) => boolean = (pre, cur) => pre === cur,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState(prop)
  /**
   * use useState instead of useRef, because in React Strict Mode,
   * useRef will cause the initial value not to be rendered correctly.
   * @see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
   * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
   */
  const [prevProp, setPrevProp] = useState(prop)

  if (!comparator(prevProp, prop)) {
    setPrevProp(prop)
    setState(prop)
  }

  return [state, setState]
}
