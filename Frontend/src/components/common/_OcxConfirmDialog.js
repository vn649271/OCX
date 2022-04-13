import React, { useState, useEffect } from "react";

const _OcxConfirmDialog = (props) => {

  const {title = 'Confirm', show = false, onClick, additionalClassName = '', children} = props;
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
          <div className="fixed main-font font-16 z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center lg:block lg:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden lg:inline-block lg:align-middle lg:h-screen" aria-hidden="true">&#8203;</span>
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all lg:my-8 lg:align-middle lg:max-w-lg lg:w-full">
                <div className="bg-white px-4 pt-5 pb-4 lg:p-6 lg:pb-4">
                  <div className="lg:flex main-font lg:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 lg:mx-0 lg:h-10 lg:w-10">
                      <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center lg:mt-0 lg:ml-4 lg:text-left">
                      <h3 className="leading-6 font-medium main-color" id="modal-title">
                      { title }
                      </h3>
                      <div className="mt-2">
                        <p className="main-color">
                        { children }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 lg:px-6 lg:flex lg:flex-row-reverse">
                  <button
                    className="border border-grey-light p-5 button-bg focus:outline-none rounded text-white hover-transition font-bold uppercase px-6 py-3 shadow hover:shadow-lg focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={onClickedYesButton}
                  >Yes</button>
                  <button
                    className="border border-grey-light p-5 rounded hover-transition hover-transition text-red-500 background-transparent font-bold uppercase px-6 py-3 focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={OnClickedNoButton}
                  >No</button>
                </div>
              </div>
            </div>
          </div>
      : null 
    }
    </>
  )
};

export default _OcxConfirmDialog;
