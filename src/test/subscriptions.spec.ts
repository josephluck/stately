import test from "tape";
import stately from "..";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1
  }
};

test("subscriptions / replace state", t => {
  t.plan(3);
  const store = stately(model);
  store.subscribe((prevState, nextState) => {
    t.equal(prevState.a, "a", "previous state remains unchanged");
    t.equal(prevState.b.c, "d", "previous state remains unchanged");
    t.equal(nextState.a, "aa", "next state reflects updated state");
  });
  store.replaceState({ ...model, a: "aa" });
});

test("subscriptions / state and prev state is preserved when multiple subscribers are called", t => {
  let called = 0;
  t.plan(4);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  store.subscribe((prevState, nextState) => {
    if (called === 0) {
      t.equal(
        prevState.a,
        "a",
        "previous state passed unchanged during first mutation"
      );
      t.equal(
        nextState.a,
        "aa",
        "next state passed changed during first mutation"
      );
      called++;
    } else if (called === 1) {
      t.equal(
        prevState.a,
        "aa",
        "previous state passed unchanged during second mutation"
      );
      t.equal(
        nextState.a,
        "aaa",
        "next state passed changed during second mutation"
      );
    }
  });
  changeA("aa");
  changeA("aaa");
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
