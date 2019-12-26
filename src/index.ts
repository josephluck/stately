import immer from "immer";

export type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? []
  : ((...b: T) => any) extends (a, ...b: infer I) => any
  ? I
  : [];

const stately = <S>(state: S) => {
  type Unsubscribe = () => any;
  type Subscription = (prevState: S, newState: S) => any;

  let _state = state;
  let _subscriptions: Subscription[] = [];

  const notifySubscribers = (prevState: S, newState: S) =>
    _subscriptions.forEach(fn => fn(prevState, newState));

  const createMutator = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<typeof fn>>): S => {
    const newState = immer(_state, draft => {
      fn(draft as S, ...args);
    });
    notifySubscribers(_state, newState);
    _state = newState;
    return newState;
  };

  const createEffect = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (
    ...args: RemoveFirstFromTuple<Parameters<typeof fn>>
  ): ReturnType<typeof fn> => fn(_state, ...args);

  const createSelector = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (
    ...args: RemoveFirstFromTuple<Parameters<typeof fn>>
  ): ReturnType<typeof fn> => {
    return fn(_state, ...args);
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
