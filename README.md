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

# Features

- Powered by functions
- Only a handful of core concepts to learn
- Predictable and immutable state container
- Mutable API powered by [immer](https://github.com/immerjs/immer)
- 100% inferred type-safety
- Subscription-based API for becoming notified of state updates

# Installation

TBC

# Example

Stately is designed to be simple, practical and 100% type-safe without introducing lots of boilerplate!

### Set up a state container

Stately infers the type of your state from what you pass it as it's initial state. State can be of any type.

```typescript
import stately from "../src";

const store = stately({
  a: "a",
  b: {
    c: "c",
    d: 4
  }
});
```

### Mutators

Mutators are functions that change the state of the store. Mutators are powered by immer, so you're able to mutate the state whilst retaining immutability under the hood so previous bindings to the state are not updated.

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

### Effects

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

### Subscriptions

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
