import * as test from "tape";
import stately from "../src/index";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1
  }
};

test("mutations / simple", t => {
  t.plan(4);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  const first = changeA("aa");
  t.equal(first.a, "aa", "state updated for the first time");
  t.equal(
    first.b.c,
    "d",
    "unaffected state remains unchanged for the first time"
  );
  const second = changeA("aaa");
  t.equal(second.a, "aaa", "state updated for the second time");
  t.equal(
    first.b.d,
    1,
    "unaffected state remains unchanged for the second time"
  );
});

test("mutations / repeating mutations depending on the result of the first", t => {
  t.plan(4);
  const store = stately(model);
  const multiplyD = store.createMutator(
    (state, multiplier: number) => (state.b.d = state.b.d * multiplier)
  );
  const first = multiplyD(2);
  t.equal(first.b.d, 2, "state updated correctly for the first time");
  t.equal(
    first.b.c,
    "d",
    "unaffected state remains unchanged for the first time"
  );
  const second = multiplyD(4);
  t.equal(second.b.d, 8, "state updated correctly for the second time");
  t.equal(
    first.b.c,
    "d",
    "unaffected state remains unchanged for the second time"
  );
});

test("effects / simple", t => {
  t.plan(4);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => {
    state.a = a;
    t.pass("mutator called");
  });
  const effectA = store.createEffect((state, a: string) => {
    t.pass("effect called");
    changeA("aa");
    return "Done";
  });
  const returned = effectA("aa");
  t.equal(returned, "Done", "effect returns what the effect returned");
  t.equal(store.getState().a, "aa", "state updated during the effect");
});

test("subscriptions / simple", t => {
  t.plan(3);
  const store = stately(model);
  store.subscribe((prevState, nextState) => {
    t.equal(prevState.a, "a", "previous state remains unchanged");
    t.equal(prevState.b.c, "d", "previous state remains unchanged");
    t.equal(nextState.a, "aa", "next state reflects updated state");
  });
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  changeA("aa");
});

test("subscriptions / adding additional subscriptions", t => {
  let called = 0;
  t.plan(7);
  const store = stately(model);
  store.subscribe((prevState, nextState) => {
    t.pass("first subscriber called");
    if (called === 0) {
      t.equal(
        prevState.a,
        "a",
        "previous state passed unchanged to first subscriber"
      );
      t.equal(
        nextState.a,
        "aa",
        "next state passed changed to first subscriber"
      );
      called++;
    }
  });
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  changeA("aa");
  store.subscribe((prevState, nextState) => {
    t.pass("second subscriber called");
    if (called === 1) {
      t.equal(
        prevState.a,
        "aa",
        "previous state passed unchanged to second subscriber"
      );
      t.equal(
        nextState.a,
        "aaa",
        "next state passed changed to second subscriber"
      );
    }
  });
  changeA("aaa");
});

test("subscriptions / removing subscriptions", t => {
  t.plan(6);
  const store = stately(model);
  const unsubscribe = store.subscribe((prevState, nextState) => {
    t.pass("first subscriber called");
    t.equal(
      prevState.a,
      "a",
      "previous state passed unchanged to first subscriber"
    );
    t.equal(nextState.a, "aa", "next state passed changed to first subscriber");
  });
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  changeA("aa");
  unsubscribe();
  store.subscribe((prevState, nextState) => {
    t.pass("second subscriber called");
    t.equal(
      prevState.a,
      "aa",
      "previous state passed unchanged to second subscriber"
    );
    t.equal(
      nextState.a,
      "aaa",
      "next state passed changed to second subscriber"
    );
  });
  changeA("aaa");
});
