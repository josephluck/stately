import test from "tape";
import stately from "..";

const model = {
  a: "a",
  b: {
    c: "d",
    d: 1
  }
};

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
