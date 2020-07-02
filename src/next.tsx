import React, {
  Component,
  useEffect,
  useState,
  useContext,
  createContext,
} from "react";
import { NextPageContext, NextComponentType } from "next";

import { StatelyReturn } from "./types";

const STORE_KEY = "__STATELY_STORE__";
const isServer = () => typeof window === "undefined";

const initStore = <
  MS extends () => {
    store: StatelyReturn<any>;
  }
>(
  makeStore: MS
): ReturnType<typeof makeStore> => {
  if (isServer()) {
    return makeStore() as any;
  } else if ((window as any)[STORE_KEY]) {
    return (window as any)[STORE_KEY];
  } else {
    (window as any)[STORE_KEY] = makeStore();
    return (window as any)[STORE_KEY];
  }
};

export const statelySSR = <
  MS extends () => {
    store: StatelyReturn<any>;
  }
>(
  makeStore: MS
) => {
  type InferredState = ReturnType<ReturnType<MS>["store"]["getState"]>;

  const StatelyContext = createContext<ReturnType<typeof makeStore>>(
    initStore(makeStore)
  );

  const withStately = <P extends NextComponentType>(Page: P) => {
    return class WithStately extends Component {
      store: any;

      static async getInitialProps(
        ctx: NextPageContext & { store: ReturnType<typeof makeStore> }
      ) {
        const store = initStore(makeStore) as any;
        ctx.store = store;
        if (Page.getInitialProps) {
          const pageProps = await Page.getInitialProps.call(Page, ctx);
          const initialState = ctx.store.store.getState();
          return { pageProps, initialState };
        } else {
          return {};
        }
      }

      constructor(props: any, ctx: any) {
        super(props, ctx);
        this.store = makeStore();
        const { initialState } = props;
        this.store.store.replaceState(initialState);
      }

      render() {
        const { pageProps, initialState, ...props } = this.props as any;

        return (
          <StatelyContext.Provider value={this.store}>
            <Page {...props} {...pageProps} />
          </StatelyContext.Provider>
        );
      }
    };
  };

  const useStore = () => useContext(StatelyContext);

  const useStoreState = <MS extends (state: InferredState) => any>(
    mapState: MS,
    dependencies: any[] = []
  ) => {
    const { store } = useContext(StatelyContext);
    const [state, setState] = useState(mapState(store.getState() as any));

    useEffect(() => {
      const unsubscribe = store.subscribe((_prev, nextState) => {
        setState(mapState(nextState as any));
      });
      return unsubscribe;
    }, dependencies);

    return state as ReturnType<typeof mapState>;
  };

  return {
    withStately,
    useStore,
    useStoreState,
  };
};

export type MakeStatelyCtx<S> = NextPageContext & { store: S };
