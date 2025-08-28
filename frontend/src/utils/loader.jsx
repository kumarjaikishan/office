import { GoGear } from "react-icons/go";

const Loader = () => {
  return (
    <div className="relative w-full p-4 flex justify-center items-center">
      <div className="relative">
        <GoGear
          className="animate-spin"
          style={{ animationDuration: "2.5s" }}
          size={60}
          color="teal"
        />
        <GoGear
          className="absolute -bottom-4 left-0 animate-spin"
          style={{ animationDuration: "3s" }}
          size={25}
          color="teal"
        />
      </div>
    </div>
  );
};

export default Loader;
