import stately from "./";
import { useState } from "react";

export const useStately = (store: ReturnType<typeof stately>) => {
  const [state] = useState(() => store.getState());

  return {
    state
  };
};
