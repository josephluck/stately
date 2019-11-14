import { StatelyReturn } from "./";
import { useState, useEffect } from "react";

const makeUseStately = <Store extends StatelyReturn>(store: Store) => {
  type State = ReturnType<typeof store["getState"]>;
  type Mapper = (state: State) => any;

  return <M extends Mapper>(mapState: M): ReturnType<typeof mapState> => {
    const [mappedState, setMappedState] = useState(() =>
      mapState(store.getState() as State)
    );

    useEffect(() => {
      const unsubscribe = store.subscribe((_, nextState) => {
        setMappedState(mapState(nextState as State));
      });
      return unsubscribe;
    }, [mapState]);

    return mappedState;
  };
};

export default makeUseStately;
