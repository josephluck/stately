import test from "tape";
import stately from "..";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1
  }
};

test("selectors / selection is memoised when state is not changed", t => {
  t.plan(1);
  const store = stately(model);
  const changeA = store.createMutator((state, a: string) => (state.a = a));
  const selectB = store.createSelector((state, a?: string) => state.b);
  const first = selectB();
  changeA("aa");
  const second = selectB();
  t.strictEqual(
    second,
    first,
    "selector returns strict equality compatible selector"
  );
});

test("selectors / selection is not memoised when state is changed", t => {
  t.plan(1);
  const store = stately(model);
  store.subscribe(console.log);
  const changeC = store.createMutator((state, c: string) => (state.b.c = c));
  const selectB = store.createSelector((state, a?: string) => state.b);
  const first = selectB();
  changeC("cc");
  const second = selectB();
  t.notStrictEqual(
    second,
    first,
    "selector returns strict equality compatible selector"
  );
});
