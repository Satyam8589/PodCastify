import React from "react";

const Button = ({ children }) => {
  return (
    <button className="bg-purple-600 text-white px-19 py-3 rounded-md hover:bg-purple-700 transition">
      {children}
    </button>
  );
};

export default Button;
