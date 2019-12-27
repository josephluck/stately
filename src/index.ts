import immer from "immer";
import { DeepReadonly, RemoveFirstFromTuple, StatelyReturn } from "./types";

const stately = <S>(initialState: S): StatelyReturn<S> => {
  /** Represents an readonly version of S */
  type IS = DeepReadonly<typeof initialState>;

  /** Types a subscription's removal fn */
  type Unsubscribe = () => void;

  /** Types a subscription */
  type Subscription = (prevState: IS, newState: IS) => any;

  /** Represents the current state of the store */
  let _state = initialState;

  /** Used to keep track of the previous state of the store. NB: used by subscriptions */
  let _previousState = initialState;

  /** Keeps hold of the list of subscriptions to the store */
  let _subscriptions: Subscription[] = [];

  /** Notifies any attached subscribers of state updates */
  const notifySubscribers = () =>
    _subscriptions.forEach(fn => fn(_previousState as IS, _state as IS));

  /** Creates a mutator function that can update the store's state */
  const createMutator = <Fn extends (state: S, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): IS => {
    _previousState = _state;
    const newState = immer(_state, draft => {
      fn(draft as S, ...args);
    });
    _state = newState;
    notifySubscribers();
    return newState as IS;
  };

  /** Creates an effect function that does not update the store's state */
  const createEffect = <Fn extends (state: IS, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): ReturnType<Fn> =>
    fn(_state as IS, ...args);

  /** Creates a selector function for retrieving state from the store */
  const createSelector = <Fn extends (state: IS, ...args: any[]) => any>(
    fn: Fn
  ) => (...args: RemoveFirstFromTuple<Parameters<Fn>>): ReturnType<Fn> =>
    fn(_state as IS, ...args);

  /** Registers a subscription on the store for receiving updates to the state */
  const subscribe = (sub: Subscription): Unsubscribe => {
    _subscriptions = [..._subscriptions, sub];
    return () => {
      _subscriptions = _subscriptions.filter(
        (_, i) => i !== _subscriptions.indexOf(sub)
      );
    };
  };

  /** Retrieves the store's state. NB: This is intended for library authors and should not be used in typical applications. Please use subscriptions or selectors instead! */
  const getState = () => _state;

  /** Replaces the store's state. NB: This is intended for library authors and should not be used in typical applications. Please use mutators instead! */
  const replaceState = (state: S) => {
    _previousState = _state;
    _state = state;
    notifySubscribers();
  };

  return {
    createMutator,
    createEffect,
    createSelector,
    subscribe,
    getState,
    replaceState
  };
};

export default stately;
