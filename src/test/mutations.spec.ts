import test from "tape";
import stately from "..";

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
