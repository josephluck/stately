import React from "react";
import { NextPageContext, NextComponentType } from "next";
import stately, { StatelyReturn } from "@josephluck/stately";
import makeUseStately from "@josephluck/stately/lib/hooks";

export const statelySSR = <S extends any>(defaultState: S) => {
  const isServer = typeof window === "undefined";

  let _store;

  const getHydratedState = (): S => {
    if (isServer && _store) {
      return _store.getState();
    } else if (isServer) {
      return defaultState;
    } else if ((window as any).__NEXT_DATA__.props.pageProps.initialState) {
      return (window as any).__NEXT_DATA__.props.pageProps.initialState;
    } else {
      (window as any).__NEXT_DATA__.props.pageProps.initialState = defaultState;
      return defaultState;
    }
  };

  _store = stately(getHydratedState());

  const withStately = <P extends NextComponentType>(Page: P) => {
    return class WithStately extends React.Component {
      static async getInitialProps(
        ctx: NextPageContext & { store: StatelyReturn }
      ) {
        if (Page.getInitialProps) {
          const pageProps = await Page.getInitialProps.call(Page, ctx);
          const initialState = _store.getState();
          return { pageProps, initialState };
        } else {
          return {};
        }
      }

      render() {
        const { pageProps, initialState, ...props } = this.props as any;
        console.log("Render", { props, pageProps, initialState });
        return (
          <>
            <Page {...props} {...pageProps} />
          </>
        );
      }
    };
  };

  const useStately = makeUseStately(_store);

  return {
    withStately,
    useStately,
    store: _store
  };
};
