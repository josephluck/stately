import immer from "immer";

export type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? []
  : ((...b: T) => any) extends (a, ...b: infer I) => any
  ? I
  : [];

type DeepReadonly<T> = T extends {}
  ? {
      readonly [P in keyof T]: T[P] extends {}
        ? DeepReadonly<T[P]>
        : Readonly<T>;
    }
  : Readonly<T>;

const stately = <S>(state: S) => {
  /** Represents an readonly version of S */
  type IS = DeepReadonly<S>;
  type Unsubscribe = () => any;
  type Subscription = (prevState: IS, newState: IS) => any;

  let _state = state;
  let _subscriptions: Subscription[] = [];

  const notifySubscribers = (prevState: S, newState: S) =>
    _subscriptions.forEach(fn => fn(prevState as IS, newState as IS));

  const createMutator = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<typeof fn>>): IS => {
    const newState = immer(_state, draft => {
      fn(draft as S, ...args);
    });
    notifySubscribers(_state, newState);
    _state = newState;
    return newState as IS;
  };

  const createEffect = <Fn extends (state: IS, ...args: any[]) => any>(
    fn: Fn
  ) => (
    ...args: RemoveFirstFromTuple<Parameters<typeof fn>>
  ): ReturnType<typeof fn> => fn(_state as IS, ...args);

  const createSelector = <Fn extends (state: IS, ...args: any[]) => any>(
    fn: Fn
  ) => (
    ...args: RemoveFirstFromTuple<Parameters<typeof fn>>
  ): ReturnType<typeof fn> => {
    return fn(_state as IS, ...args);
  };

  const subscribe = (sub: Subscription): Unsubscribe => {
    _subscriptions = [..._subscriptions, sub];
    return () => {
      _subscriptions = _subscriptions.filter(
        (_, i) => i !== _subscriptions.indexOf(sub)
      );
    };
  };

  const replaceState = (state: S) => {
    notifySubscribers(_state, state);
    _state = state;
  };

  return {
    createMutator,
    createEffect,
    createSelector,
    subscribe,
    getState: () => _state,
    replaceState
  };
};

export type StatelyReturn = ReturnType<typeof stately>;

export default stately;
