import React from "react";
import { withStately, useStately, increment, decrement } from "../store";

const Home = () => {
  const count = useStately(s => s.count);
  return (
    <>
      <h1>Hello, World</h1>
      <button onClick={decrement}>-</button>
      {count}
      <button onClick={increment}>-</button>
    </>
  );
};

Home.getInitialProps = async () => {
  increment();
  return {
    page: "From home page"
  };
};

export default withStately(Home);
