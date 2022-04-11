import React, { useState, useEffect } from "react";

const OcxConfirmDialog = (props) => {

  const {title, show = false, onClick, additionalClassName = '', children} = props;
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    // Update the document title using the browser API
    // setShowModal(show);
  });

  const onClickedCancelButton = ev => {
    setShowModal(false);
    onClick(0);
  }

  const OnClickedNoButton = ev => {
    setShowModal(false);
    onClick(1);
  }

  const onClickedYesButton = ev => {
    setShowModal(false);
    onClick(2);
  }

  return (
    <>
      { showModal ?
      <div className={`flex justify-center main-font font-16 items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none` + additionalClassName}>
        <div className="relative w-auto my-6 mx-auto max-w-3xl">
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
              <h3 className="text-3xl font=semibold">{title}</h3>
              <button
                className="bg-transparent border-0 text-black float-right"
                // onClick={() => setShowModal(false)}
                onClick={onClickedCancelButton}
              >
                <i
                    className="fa fa-close"
                    style={{ marginRight: "7px" }}
                />
              </button>
            </div>
            <div className="relative p-6 flex-auto">
              {
                children
              }
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="border border-grey-light p-5 rounded hover-transition hover-transition text-red-500 background-transparent font-bold uppercase px-6 py-3 focus:outline-none mr-1 mb-1"
                type="button"
                onClick={OnClickedNoButton}
              >
                No
              </button>
              <button
                className="border border-grey-light p-5 button-bg focus:outline-none rounded text-white hover-transition font-bold uppercase px-6 py-3 shadow hover:shadow-lg focus:outline-none mr-1 mb-1"
                type="button"
                onClick={onClickedYesButton}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
      : null 
    }
    </>
  )
};

export default OcxConfirmDialog;
