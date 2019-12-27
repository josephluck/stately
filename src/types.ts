export type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? []
  : ((...b: T) => any) extends (a, ...b: infer I) => any
  ? I
  : T;

export type DeepReadonly<T> = T extends {}
  ? {
      readonly [P in keyof T]: T[P] extends {}
        ? DeepReadonly<T[P]>
        : Readonly<T>;
    }
  : Readonly<T>;

export interface StatelyReturn<S> {
  createMutator: <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>) => DeepReadonly<S>;
  createEffect: <Fn extends (state: DeepReadonly<S>, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>) => ReturnType<Fn>;
  createSelector: <Fn extends (state: DeepReadonly<S>, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>) => ReturnType<Fn>;
  subscribe: (
    sub: (prevState: DeepReadonly<S>, newState: DeepReadonly<S>) => any
  ) => () => void;
  getState: () => S;
  replaceState: (state: S) => void;
}
