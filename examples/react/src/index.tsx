import React from "react";
import ReactDOM from "react-dom";
import stately from "@josephluck/stately";
import makeUseStately from "@josephluck/stately/lib/hooks";

// Set up the store:
const store = stately({
  a: {
    name: "Counter A",
    count: 0
  },
  b: {
    name: "Counter B",
    count: 0
  }
});

// Create some selectors to pick out memoised state from the store:
const selectA = store.createSelector(s => s.a);
const selectB = store.createSelector(s => s.b);

// Create some mutators (these can be used directly in the component without hooks!):
const incrementA = store.createMutator(s => s.a.count++);
const decrementA = store.createMutator(s => s.a.count--);
const incrementB = store.createMutator(s => s.b.count++);
const decrementB = store.createMutator(s => s.b.count--);

// Create a custom hook using the stately hook factory:
const useStately = makeUseStately(store);

// Create a memoised component. Counter B should not re-render when Counter A's state changes
interface CounterProps {
  state: { name: string; count: number };
  increment: () => void;
  decrement: () => void;
}
const Counter = React.memo(({ state, increment, decrement }: CounterProps) => {
  console.log(`Rendering counter ${state.name}`);
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>
        {state.name}: {state.count}
      </span>
      <button onClick={increment}>+</button>
    </div>
  );
});

// Render the app and use the hook:
const App = () => {
  const a = useStately(selectA);
  const b = useStately(selectB);
  return (
    <>
      <Counter state={a} increment={incrementA} decrement={decrementA} />
      <Counter state={b} increment={incrementB} decrement={decrementB} />
    </>
  );
};

const elm = document.createElement("div");
document.body.appendChild(elm);
ReactDOM.render(<App />, elm);
