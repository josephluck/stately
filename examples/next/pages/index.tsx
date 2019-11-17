import React from "react";
import stately from "@josephluck/stately";
import { statelySSR, MakeStatelyCtx } from "@josephluck/stately/lib/next";

interface State {
  count: number;
}

/**
 * Wrap the instantiation of the stately store in a function so
 * that it can be called on both the server and the client.
 */
const makeStore = () => {
  const state: State = {
    count: 0
  };
  const store = stately(state);
  const increment = store.createMutator(state => {
    state.count++;
  });
  const decrement = store.createMutator(state => {
    state.count--;
  });
  return {
    store,
    increment,
    decrement
  };
};

/**
 * Retrieve stately provider and stately hooks from the SSR
 * utility:
 *
 * withStately: used to wrap your next pages that need your store.
 * useStore: used to grab mutators and effects from makeStore().
 * useStoreState: a replacement for useStately, except it works with SSR.
 */
const { withStately, useStore, useStoreState } = statelySSR(makeStore);

/**
 * Used to type getInitialProps for next pages.
 * Makes sure that anything returned from makeStore is inferred and passed
 * down strongly-typed to getInitialProps ctx.
 */
type StatelyCtx = MakeStatelyCtx<ReturnType<typeof makeStore>>;

const Counter = () => {
  const count = useStoreState(s => s.count); // NB: you can't use the standard useStately as it doesn't work with SSR
  const { increment, decrement } = useStore(); // NB: inferred from the return of makeStore()
  return (
    <>
      <button onClick={decrement}>-</button>
      {count}
      <button onClick={increment}>+</button>
    </>
  );
};

/**
 * An example Next page using the SSR version of the stately store.
 */
const Home = () => {
  return (
    <>
      <h1>Hello, World</h1>
      <Counter />
    </>
  );
};

/**
 * getInitialProps receives the return value of makeStore.
 * The type utility MakeStatelyCtx makes sure all the typescript types
 * are inferred.
 */
Home.getInitialProps = async ({ store }: StatelyCtx) => {
  store.increment();
  return {
    page: "This is the home page"
  };
};

export default withStately(Home);
