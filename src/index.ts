import immer from "immer";
import { DeepReadonly, RemoveFirstFromTuple, StatelyReturn } from "./types";

const stately = <S>(initialState: S): StatelyReturn<S> => {
  /** Represents an readonly version of S */
  type IS = DeepReadonly<typeof initialState>;
  type Unsubscribe = () => void;
  type Subscription = (prevState: IS, newState: IS) => any;

  let _state = initialState;
  let _subscriptions: Subscription[] = [];

  const notifySubscribers = (prevState: S, newState: S) =>
    _subscriptions.forEach(fn => fn(prevState as IS, newState as IS));

  const createMutator = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): IS => {
    const newState = immer(_state, draft => {
      fn(draft as S, ...args);
    });
    notifySubscribers(_state, newState);
    _state = newState;
    return newState as IS;
  };

  const createEffect = <Fn extends (state: IS, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): ReturnType<Fn> =>
    fn(_state as IS, ...args);

  const createSelector = <Fn extends (state: IS, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): ReturnType<Fn> => {
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

export default stately;
