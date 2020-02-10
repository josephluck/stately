import test from "tape";
import memoize from "memoize-one";
import stately from "..";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1,
    e: {
      f: "f",
      g: 1
    },
    h: {
      f: "f",
      g: 1
    }
  }
};

test("selectors / selection is memoized when unrelated state is changed", t => {
  t.plan(1);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  const selectB = store.createSelector(state => state.b);
  const first = selectB();
  changeA("aa");
  const second = selectB();
  t.strictEqual(
    second,
    first,
    "simple selector returns strict equality compatible selector"
  );
});

test("selectors / selection is memoized when unrelated state under same parent key is changed", t => {
  t.plan(2);
  const store = stately(model);
  const changeH = store.createMutator(
    (state, h: typeof model["b"]["h"]) => (state.b.h = h)
  );
  const selectE = store.createSelector(state => state.b.e);
  const first = selectE();
  changeH({ f: "ff", g: 2 });
  const second = selectE();
  t.deepEqual(
    first,
    { f: "f", g: 1 },
    "first selectors return value remains unchanged after sibling state is changed"
  );
  t.strictEqual(
    second,
    first,
    "selector returns strict equality compatible selector"
  );
});

test("selectors / selection is not memoized when state is changed", t => {
  t.plan(1);
  const store = stately(model);
  const changeC = store.createMutator((state, c: string) => (state.b.c = c));
  const selectB = store.createSelector(state => state.b);
  const first = selectB();
  changeC("cc");
  const second = selectB();
  t.notStrictEqual(
    second,
    first,
    "simple selector returns strict equality compatible selector"
  );
});

test("selectors / selection is not memoized when selector returns new object", t => {
  t.plan(1);
  const store = stately(model);
  const selectorWithNewObj = store.createSelector(state => ({
    newObj: state.b
  }));
  const first = selectorWithNewObj();
  const second = selectorWithNewObj();
  t.notStrictEqual(
    second,
    first,
    "selector that returns new object is not memoized"
  );
});

test("selectors / selection is memoized when selector that returns new object is memoized manually", t => {
  t.plan(1);
  const store = stately(model);
  const memoizedSelectorWithNewObj = store.createSelector(
    memoize((state: typeof model) => ({
      newObj: state.b
    }))
  );
  const first = memoizedSelectorWithNewObj();
  const second = memoizedSelectorWithNewObj();
  t.strictEqual(second, first, "selector that returns new object is memoized");
});

test("selectors / selection is memoized when selector that returns new object (with arguments) is memoized manually", t => {
  t.plan(1);
  const store = stately(model);
  const memoizedSelectorWithNewObj = store.createSelector(
    memoize((state: typeof model, anArgument: any) => ({
      newObj: state.b,
      anArgument
    }))
  );
  const first = memoizedSelectorWithNewObj("an argument");
  const second = memoizedSelectorWithNewObj("an argument");
  t.strictEqual(
    second,
    first,
    "selector with arguments that returns new object is memoized"
  );
});

test("selectors / selection remains immutable when nested state changes", t => {
  t.plan(3);
  const store = stately(model);
  const changeD = store.createMutator((state, d: number) => (state.b.d = d));
  const selectB = store.createSelector(state => state.b);
  const first = selectB();
  t.equal(first.d, 1, "initial selector is correct");
  changeD(10);
  const second = selectB();
  t.equal(first.d, 1, "initial selector is correct after state has changed");
  t.equal(second.d, 10, "second selector is correct after state has changed");
});

test("selectors / selection is correct when used in combination with subscription", t => {
  t.plan(4);
  let count = 0;
  const store = stately(model);
  const changeD = store.createMutator((state, d: number) => (state.b.d = d));
  const selectB = store.createSelector(state => state.b);
  store.subscribe(() => {
    const selected = selectB();
    if (count === 0) {
      t.equal(selected.d, 1, "first selection in subscription is correct");
    } else if (count === 1) {
      t.equal(selected.d, 10, "second selection in subscription is correct");
    } else if (count === 2) {
      t.equal(selected.d, 20, "third selection in subscription is correct");
    } else if (count === 3) {
      t.equal(selected.d, 500, "fourth selection in subscription is correct");
    }
    count++;
  });
  changeD(10);
  changeD(20);
  changeD(500);
});

test("selectors / selection with arguments is memoized when arguments are the same", t => {
  t.plan(2);
  const store = stately(model);
  const selectAndAddToD = store.createSelector(
    (state, d: number) => state.b.d + d
  );
  const first = selectAndAddToD(1);
  t.equal(first, 2, "selector returns state with argument applied");
  const second = selectAndAddToD(1);
  t.strictEqual(
    second,
    first,
    "selector returns strict equality compatible selector"
  );
});

test("selectors / selection with arguments that affect selection is memoized when arguments are the same", t => {
  t.plan(2);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  const selectKey = store.createSelector(
    (state, key: keyof typeof model) => state[key]
  );
  const first = selectKey("b");
  const second = selectKey("a");
  changeA("aa");
  const third = selectKey("b");
  const fourth = selectKey("a");
  t.strictEqual(
    third,
    first,
    "selector returns strict equality compatible selector when state has not changed"
  );
  t.notStrictEqual(
    fourth,
    second,
    "selector returns strict equality compatible selector when state has changed"
  );
});
