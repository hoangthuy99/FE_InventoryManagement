import React from "react";

function PageTitle({ children }) {
  return (
    <h1 className="px-4 py-3 my-6 text-base font-semibold text-gray-700 sm:text-2xl dark:text-gray-200">
    {children}
  </h1>
  
  );
}

export default PageTitle;
