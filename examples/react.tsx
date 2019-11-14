import React from "react";
import ReactDOM from "react-dom";

import stately from "../src";
import makeUseStately from "../src/hooks";

const store = stately({
  count: 0
});

const increment = store.createMutator(s => s.count++);
const decrement = store.createMutator(s => s.count--);

const useStately = makeUseStately(store);

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
