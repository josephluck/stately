import test from "tape";
import stately from "..";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1
  }
};

test("subscriptions / subscription is called on set-up", t => {
  t.plan(2);
  const store = stately(model);
  store.subscribe((prevState, nextState) => {
    t.pass("subscription is run initially");
    t.equal(
      prevState.a,
      nextState.a,
      "previous state and next state are equal"
    );
  });
});

test("subscriptions / replace state", t => {
  let ran = 0; // NB: needed to avoid checking initial subscription call
  t.plan(3);
  const store = stately(model);
  store.subscribe((prevState, nextState) => {
    if (ran === 1) {
      t.equal(prevState.a, "a", "previous state remains unchanged");
      t.equal(prevState.b.c, "d", "previous state remains unchanged");
      t.equal(nextState.a, "aa", "next state reflects updated state");
    }
    ran++;
  });
  store.replaceState({ ...model, a: "aa" });
});

test("subscriptions / state and prev state is preserved when multiple subscribers are called", t => {
  let called = 0;
  t.plan(4);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  store.subscribe((prevState, nextState) => {
    if (called === 1) {
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
    } else if (called === 2) {
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
    called++;
  });
  changeA("aa");
  changeA("aaa");
});

test("subscriptions / adding additional subscriptions", t => {
  let called0 = 0;
  let called1 = 0;
  t.plan(6);
  const store = stately(model);
  store.subscribe((prevState, nextState) => {
    if (called0 === 1) {
      t.pass("first subscriber called");
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
    }
    called0++;
  });
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  changeA("aa");
  store.subscribe((prevState, nextState) => {
    if (called1 === 1) {
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
    }
    called1++;
  });
  changeA("aaa");
});

test("subscriptions / removing subscriptions", t => {
  let ran0 = 0; // NB: needed to avoid checking initial subscription call
  let ran1 = 0; // NB: needed to avoid checking initial subscription call
  t.plan(6);
  const store = stately(model);
  const unsubscribe = store.subscribe((prevState, nextState) => {
    if (ran0 === 1) {
      t.pass("first subscriber called");
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
    }
    ran0++;
  });
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  changeA("aa");
  unsubscribe();
  store.subscribe((prevState, nextState) => {
    if (ran1 === 1) {
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
    }
    ran1++;
  });
  changeA("aaa");
});
