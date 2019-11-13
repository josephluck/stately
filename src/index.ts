import immer from "immer";

type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? undefined
  : ((...b: T) => void) extends (a, ...b: infer I) => void
  ? I
  : [];

export default <S>(state: S) => {
  type Unsubscribe = () => any;
  type Subscription = (prevState: S, newState: S) => any;

  let _state = state;
  let _subscriptions: Subscription[] = [];

  const notifySubscribers = (prevState: S, newState: S) =>
    _subscriptions.forEach(fn => fn(prevState, newState));

  const createMutator = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): S =>
    immer(_state, draft => {
      const newState = fn(draft as S, ...args);
      notifySubscribers(_state, newState);
      return newState;
    });

  const createEffect = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): ReturnType<Fn> =>
    fn(_state, ...args);

  const subscribe = (sub: Subscription): Unsubscribe => {
    _subscriptions = [..._subscriptions, sub];
    return () =>
      _subscriptions.filter((_, i) => i !== _subscriptions.indexOf(sub));
  };

  return {
    createMutator,
    createEffect,
    subscribe
  };
};
