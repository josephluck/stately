import React from "react";
import ReactDOM from "react-dom";

import stately from "stately";
import makeUseStately from "stately/lib/hooks";

// Set up the store:
const store = stately({
  count: 0
});

// Create some mutators (these can be used directly in the component without hooks!):
const increment = store.createMutator(s => s.count++);
const decrement = store.createMutator(s => s.count--);

// Create a custom hook using the stately hook factory:
const useStately = makeUseStately(store);

// Render the app and use the hook:
const App = () => {
  const count = useStately(s => s.count);

  return (
    <>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </>
  );
};

const elm = document.createElement("div");
document.body.appendChild(elm);
ReactDOM.render(<App />, elm);
