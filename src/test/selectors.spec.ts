import test from "tape";
import stately from "..";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1
  }
};

test("selectors / selection is memoised when unrelated state is changed", t => {
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

test("selectors / selection is not memoised when state is changed", t => {
  t.plan(1);
  const store = stately(model);
  store.subscribe(console.log);
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

test("selectors / selection with arguments is memoised when arguments are the same", t => {
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

test("selectors / selection with arguments that affect selection is memoised when arguments are the same", t => {
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
