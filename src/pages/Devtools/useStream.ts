import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';

/**
 * Returned from `useStream` before first emit from the provided stream
 */
export const NOT_YET_EMITTED = Symbol('Returned from rxbeach/react:useStream');
export type NOT_YET_EMITTED = typeof NOT_YET_EMITTED;

/**
 * React hook to subscribe to a stream
 *
 * Each emit from the stream will make the component re-render with the new
 * value. Initially, `NOT_YET_EMITTED` is returned, because an `Observable`
 * has no guarantee for when the first emit will happen.
 *
 * If you know the stream will emit immediately upon subscription, you can
 * short-circuit the `NOT_YET_EMITTED` value to make your view return null:
 * ```tsx
 * const Component = () => {
 *   const value = useStream(myStream$);
 *   if (value === NOT_YET_EMITTED) return null;
 *
 *   ...
 * };
 * ```
 *
 * This hook passes the `source$` argument as a dependency to `useEffect`, which
 * means you will need to take care that it is referentially equal between each
 * render (unless you want to resubscribe, of course).
 *
 * For using this hook with streams defined (created, piped, etc.) inside a
 * component, you need to wrap the stream definition in `useMemo`:
 * ```tsx
 * const LatestPayload = ({ action }: { action: ActionWithPayload<any> }) => {
 *   const payload$ = useMemo(() => action$.pipe(
 *     ofType(action),
 *     extractPayload()
 *   ), [action]);
 *   const payload = useStream(payload$);
 *
 *   return <p> Latest payload: { payload } </p>;
 * }
 * ```
 *
 * @param source$ Stream that provides the needed values
 * @see useEffect
 * @see NOT_YET_EMITTED
 */
export const useStream = <T>(source$: Observable<T>): T | NOT_YET_EMITTED => {
  const [value, setValue] = useState<T | NOT_YET_EMITTED>(NOT_YET_EMITTED);

  useEffect(() => {
    const subscription = source$.subscribe(setValue);

    return () => subscription.unsubscribe();
  }, [source$]);

  return value;
};
