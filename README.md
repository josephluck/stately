<div align="center">
  <h1>
    <br/>
    <br/>
    🏰
    <br />
    <br />
    Stately
    <br />
    <br />
    <br />
    <br />
  </h1>
  <br />
  <p>
    Functional, immutable state management.
  </p>
  <br />
  <br />
  <br />
  <br />
</div>

# Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Creating a store](#creating-a-store)
- [Changing state](#changing-state)
- [Effects](#effects)
- [Subscribing to changes](#subscribing-to-changes)
- [Replacing entire state](#replacing-entire-state)
- [Logging](#logging)
- [Error handling](#error-handling)
- [Usage with React](#usage-with-react)
- [Usage with Next](#usage-with-next)

# Features

- Only a handful of core concepts to learn
- Powered by functions
- Predictable and immutable state container
- Mutable API powered by [immer](https://github.com/immerjs/immer)
- 100% inferred type-safety
- Subscription-based API for becoming notified of state updates
- Comes with React Hooks bindings out of the box
- Support for server-side-rendering (via Next)

See the accompanying blog post for more information on how Stately came to be: https://josephluck.co.uk/blog/simple-state-management/

# Installation

With yarn:

```bash
yarn add @josephluck/stately
```

With npm:

```bash
npm i --save @josephluck/stately
```

To see how to use Stately with React or Next, see the [examples](/examples).

# How it works

Stately is designed to be simple, practical and 100% type-safe without introducing lots of boilerplate!

## Creating a store

Stately infers the type of your state from what you pass it as it's initial state. State can be of any type.

```typescript
import stately from "@josephluck/stately";

const store = stately({
  a: "a",
  b: {
    c: "c",
    d: 4
  }
});
```

## Changing state

Changing state is done via Mutators. Mutators are functions that change the state of the store. Mutators are powered by immer, so you're able to mutate the state whilst retaining immutability under the hood so previous bindings to the state are not updated.

Creating a mutator returns a function that can be called to mutate the state. This returned function returns the updated state when called.

Mutators receive the latest state as the first argument, and can define any number of additional arguments. State is automatically typed.

When mutators are called, any subscribers that have been added are called with the previous state and the updated state.

```typescript
/**
 * Single argument mutator
 */
const changeA = store.createMutator((state, a: string) => (state.a = a));
const latestState = changeA("🔥"); // Returns { a: string; b: { c: string; d: number; }; }

/**
 * Invalid mutator
 */
const invalidChangeA = store.createMutator((state, a: number) => (state.a = a)); // Fails: Type 'number' is not assignable to type 'string'. ts(2322)

/**
 * Multi argument mutator
 */
const changeAComplex = store.createMutator(
  (state, a: string, b: string) => (state.a = `${a} stately is ${b}`)
);
changeAComplex("yo", "so 🔥");
changeAComplex("nope"); // Fails: Expected 2 arguments, but got 1. ts(2554)

/**
 * Higher order mutator
 */
const changeAChanger = (a: string) =>
  store.createMutator((state, b: string) => (state.a = `${a} stately is ${b}`));
const aChanger = changeAChanger("yo"); // Returns (b: string) => { a: string; b: { c: string; d: number; }; }
aChanger("so 🔥"); // Returns { a: string; b: { c: string; d: number; }; }

/**
 * Mutator updating nested state
 */
const multiplyD = store.createMutator(
  (state, multiplier: number) => (state.b.d = state.b.d * multiplier)
);
multiplyD(10);
multiplyD("ten"); // Argument of type '"ten"' is not assignable to parameter of type 'number'. ts(2345)
```

## Effects

Effects are similar to mutators, except they do not update state and subscribers are not called.

Effects are useful for when a function needs the latest state of the store.

The return of the effect's implementation is returned when it's called.

```typescript
/**
 * Async effects, optional arguments
 */
const asyncChangeA = store.createEffect(
  (_state, a: string = "Stately so 🔥") =>
    new Promise<Boolean>(resolve => {
      console.log(`About to change a to ${a}`);
      changeA(a);
      console.log("Changed a");
      resolve(true);
    })
);
asyncChangeA(); // Returns Promise<Boolean>
asyncChangeA("yup...");
asyncChangeA("nope", "not allowed"); // Fails: Expected 0-1 arguments, but got 2. ts(2554)
```

## Subscribing to changes

A store can be subscribed to. Subscriptions get called when the state of the store changes via mutations. Subscriptions receive the previous state and the updated state of the entire store.

```typescript
/**
 * Adding a subscription
 */
const unsubscribe = store.subscribe((previous, next) => {
  console.log("The state has updated", { previous, next });
});

/**
 * Removing a subscription
 */
unsubscribe();
```

## Replacing entire state

Stately returns a convenience method for replacing the entire store's state:

```typescript
store.replaceState(newStoreState);
```

## Logging

If you want to log every state change, it's as simple as creating a subscriber that logs for you:

```typescript
store.subscribe((previousState, nextState) => {
  console.log("The store has updated", { previousState, nextState });
});
```

## Error handling

Stately makes no assumptions about how you may wish to handle errors that occur, however it's advised that errors are caught when you call mutators and effects:

```typescript
const launchMissiles = store.createEffect(() => {
  throw new Error("💥");
});

// Some time later

try {
  launchMissiles();
} catch (err) {
  console.log("Oh no! ... ", err.message);
}
```

Of course, you can catch errors and then call additional effects, mutations etc if you need to perform any clean-up operations.

# Usage with React

Stately comes with bindings for React out-of-the-box via React Hooks.

See [the react example](./examples/react) for more a complete project.

Pass your stately store to the stately hook factory to create a `useStately` hook that can be used in components. Pass the `useStately` hook a "selector" function to map state from the store in to the component.

See the example below:

```typescript
import stately from "@josephluck/stately";
import makeUseStately from "@josephluck/stately/lib/hooks";

// Set up the store:
const store = stately({
  count: 0
});

// Create some mutators (these can be used directly in the component without hooks!):
const increment = store.createMutator(s => s.count++);
const decrement = store.createMutator(s => s.count--);

// Create a custom hook using the stately hook factory:
const useStately = makeUseStately(store);

// Render the app and use the hook:
const App = () => {
  const count = useStately(s => s.count);

  return (
    <>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </>
  );
};

const elm = document.createElement("div");
document.body.appendChild(elm);
ReactDOM.render(<App />, elm);
```

If your state mapping relies on any external dependencies, you can declare them as a second argument to the `useStately` hook:

```typescript
const myState = useStately(state => state.foo[bar], [bar]);
```

Whenever a dependency in the array of dependencies changes, the state will be re-mapped and the component will re-render.

# Usage with Next

Stately comes with SSR support for Next.js which changes usage of the React example above to support SSR.

First, you need to wrap your store creation in a function that returns the store and anything related to it (mutators, effects etc). This store creation should be passed to `statelySSR` which returns some hooks and higher-order-components that can be used across your next app. This is because a new instance of the stately store is created on every server-side render (to make sure there's no global state shared between users visiting your app!).

Second, you can't use the standard `makeUseStately` hook factory as it doesn't work with SSR. Instead, you must use `useStoreState` hook returned from `statelySSR` to subscribe your components to the store state. This hook works exactly the same as the `useStately` hook from the non-SSR react hooks (but obviously works with SSR). If you wish to access any other returned value (like mutations, effects etc) from your `makeStore`, use the `useStore` hook returned from `statelySSR` - you shouldn't use the `store` property from it though, use the `useStoreState` hook for that instead!

Third, you must wrap your next pages in the `withStately` higher-order-component returned from `useStoreState`. This higher-order-component provides the return value of your `makeStore` function through React's Context feature (which is then used by the other hooks explained above).

See [the next example](./examples/next) for more a complete project.

```typescript
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

/**
 * A simple component using the SSR version of the stately store.
 */
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
```
