import React from "react";
import classNames from "classnames";

const Frame: React.FC<{ open?: boolean; onClose: () => void }> = ({
  additionalClass,
  children,
  open = true,
  onClose
}) => {
  return (
    // overlay: 90% opacity of the bg, `inset-0` to stretch over the entire screen
    <div
      className={classNames(
        "fixed inset-1 z-10 p-18 text-white bg-gray-600/90 main-font font-16 rounded-lg", additionalClass,
        `${open ? "block" : "hidden"}` // control visibility via `open` attribute (or render conditionally)
      )}
    >
      {/* container: `max-w-sm` to make it reasonably narrow, `mx-auto` to center horizontally */}
      <div className="main-font font-16 relative w-max mx-auto mt-8">
        {/* closer in the corner */}
        <button
          className="main-font font-16 absolute -top-2 -right-2 flex justify-center rounded-full h-8 w-8 bg-gray-600 cursor-pointer shadow-xl"
          onClick={() => onClose()}
          title="Close"
        >
			<i
				className="fa fa-close"
			/>
        </button>
        {/* contents */}
        <div className="overflow-hidden bg-gray-800 rounded-lg shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
};

const Head: React.FC = ({ children }) => (
  <div className="block p-5 bg-gray-900 main-font font-16 rounded-lg">
    <h1 className="font-bold font-18">{children}</h1>
  </div>
);

const Footer: React.FC = ({ children }) => (
  <div className="block p-5 bg-gray-900 main-font font-16 lg:flex lg:flex-row-reverse">
    {children}
  </div>
);

const Body: React.FC = ({ children }) => <div className="p-10 pl-20 pr-20 main-font font-16 ">{children}</div>;

const OcxModalComponents = { Frame, Head, Body, Footer };

export default OcxModalComponents;
