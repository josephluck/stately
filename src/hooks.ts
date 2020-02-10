import { useState, useEffect, useRef } from "react";
import { StatelyReturn } from "./types";

const makeUseStately = <S extends StatelyReturn<any>>(store: S) => {
  type State = ReturnType<typeof store["getState"]>;
  type Mapper = (state: State) => any;

  const useStately = <M extends Mapper>(
    mapState: M,
    dependencies: any[] = []
  ): ReturnType<typeof mapState> => {
    /**
     * Ref required to access latest mapState function inside useEffect without
     * cache-busting the effect and recreating the subscription every render.
     * Aka, this is often used as useStore(() => {...}) where the selector is
     * inlined as an anonymous lambda and created every time.
     * NB: If this wasn't done then it's likely to cause infinite loops.
     */
    const mapper = useRef(mapState);
    mapper.current = mapState;

    const [mappedState, setMappedState] = useState(() =>
      mapState(store.getState() as State)
    );

    useEffect(() => {
      const unsubscribe = store.subscribe((_, nextState) => {
        const nextMappedState = mapper.current(nextState as State);
        setMappedState(nextMappedState);
      });

      return unsubscribe;
    }, [setMappedState, ...dependencies]);

    return mappedState;
  };

  return useStately;
};

export default makeUseStately;
