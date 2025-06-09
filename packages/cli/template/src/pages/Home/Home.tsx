import { Link } from "react-router";

const Home = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center ">
      <p className="text-5xl">Hello World</p>
      <Link to="/about">dummy</Link>
    </div>
  );
};

export default Home;
