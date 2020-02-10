import { useState, useEffect } from "react";
import { StatelyReturn } from "./types";

const makeUseStately = <S extends StatelyReturn<any>>(store: S) => {
  type State = ReturnType<typeof store["getState"]>;
  type Mapper = (state: State) => any;

  const useStately = <M extends Mapper>(
    mapState: M,
    dependencies: any[] = []
  ): ReturnType<typeof mapState> => {
    const [mappedState, setMappedState] = useState(() =>
      mapState(store.getState() as State)
    );

    useEffect(() => {
      setMappedState(mapState(store.getState() as State));

      const unsubscribe = store.subscribe((_, nextState) => {
        const nextMappedState = mapState(nextState as State);
        setMappedState(nextMappedState);
      });

      return unsubscribe;
    }, [setMappedState, mapState, ...dependencies]);

    return mappedState;
  };

  return useStately;
};

export default makeUseStately;
