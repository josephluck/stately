export type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? []
  : ((...b: T) => any) extends (a: any, ...b: infer I) => any
  ? I
  : T;

export interface StatelyReturn<S> {
  /** Creates a mutator function that can update the store's state */
  createMutator: <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>) => S;

  /** Creates an effect function that does not update the store's state */
  createEffect: <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>) => ReturnType<Fn>;

  /** Creates a selector function for retrieving state from the store */
  createSelector: <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>) => ReturnType<Fn>;

  /** Registers a subscription on the store for receiving updates to the state */
  subscribe: (sub: (prevState: S, newState: S) => any) => () => void;

  /** Retrieves the store's state. NB: This is intended for library authors and should not be used in typical applications. Please use subscriptions or selectors instead! */
  getState: () => S;

  /** Replaces the store's state. NB: This is intended for library authors and should not be used in typical applications. Please use mutators instead! */
  replaceState: (state: S) => void;
}
