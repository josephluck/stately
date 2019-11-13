const Store = Stately({
  a: "a",
  b: {
    c: "c",
    d: 4
  }
});

/**
 * Single argument mutator
 */
const changeA = Store.reducer((state, a: string) => (state.a = a));
const latestState = changeA("🔥"); // Returns { a: string; b: { c: string; d: number; }; }

/**
 * Invalid mutator
 */
const invalidChangeA = Store.reducer((state, a: number) => (state.a = a)); // Fails: Type 'number' is not assignable to type 'string'. ts(2322)

/**
 * Multi argument mutator
 */
const changeAComplex = Store.reducer(
  (state, a: string, b: string) => (state.a = `${a} stately is ${b}`)
);
changeAComplex("yo", "so 🔥");
changeAComplex("nope"); // Fails: Expected 2 arguments, but got 1. ts(2554)

/**
 * Higher order mutator
 */
const changeAChanger = (a: string) =>
  Store.reducer((state, b: string) => (state.a = `${a} stately is ${b}`));
const aChanger = changeAChanger("yo"); // Returns (b: string) => { a: string; b: { c: string; d: number; }; }
aChanger("so 🔥"); // Returns { a: string; b: { c: string; d: number; }; }

/**
 * Async effects, optional arguments
 */
const asyncChangeA = Store.effect(
  (_state, a: string = "Stately so 🔥") =>
    new Promise<Boolean>(resolve => {
      console.log(`About to change a to ${a}`);
      changeA(a);
      console.log("Changed a");
      resolve(true);
    })
);
asyncChangeA();
asyncChangeA("yup...");
asyncChangeA("nope", "not allowed"); // Fails: Expected 0-1 arguments, but got 2. ts(2554)

/**
 * Mutator updating nested state
 */
const multiplyD = Store.reducer(
  (state, multiplier: number) => (state.b.d = state.b.d * multiplier)
);
multiplyD(10);
multiplyD("ten"); // Argument of type '"ten"' is not assignable to parameter of type 'number'. ts(2345)
