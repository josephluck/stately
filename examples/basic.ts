import stately from "../src";

const store = stately({
  a: "a",
  b: {
    c: "c",
    d: 4
  }
});

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

/**
 * Simple selector
 */
const selectA = store.createSelector(state => state.a);
const a = selectA(); // Returns "a"

/**
 * Selectors are immutable
 */
const selectB = store.createSelector(state => state.b);
const firstB = selectB(); // Returns { c: "c", d: 4 }
multiplyD(10);
const secondB = selectB(); // Returns { c: "c", d: 40 }
firstB.d === 4; // Returns true
secondB.d === 40; // Returns true

/**
 * Selectors take arguments
 */
const selectAndAddToD = store.createSelector(
  (state, add: number) => state.b.d + add
);
const firstAdditionToD = selectAndAddToD(10); // Returns 14
const secondAdditionToD = selectAndAddToD(100); // Returns 104
selectAndAddToD(); // Expected 1 arguments, but got 0. ts(2554)
selectAndAddToD("ten"); // Argument of type '"ten"' is not assignable to parameter of type 'number'. ts(2345)

/**
 * Selectors that return new objects are not memoized (or equal)
 */
const selectorWithNewObj = store.createSelector(state => ({ newObj: state.b }));
const firstNewObjSelection = selectorWithNewObj();
const secondNewObjSelection = selectorWithNewObj();
firstNewObjSelection === secondNewObjSelection; // Returns false

/**
 * Selectors that return new objects that implement memoization are memoized
 */
import memoize from "memoize-one";
const memoizedSelectorWithNewObj = store.createSelector(
  memoize(state => ({ newObj: state.b }))
);
const firstMemoizedNewObjSelection = memoizedSelectorWithNewObj();
const secondMemoizedNewObjSelection = memoizedSelectorWithNewObj();
firstMemoizedNewObjSelection === secondMemoizedNewObjSelection; // Returns true

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
