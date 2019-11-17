import { statelySSR } from "./with-stately";

interface State {
  count: number;
}

export const defaultState: State = {
  count: 0
};

const { withStately, useStately, store } = statelySSR(defaultState);

export const increment = store.createMutator(state => {
  state.count++;
});

export const decrement = store.createMutator(state => {
  state.count--;
});

export { withStately, useStately };
