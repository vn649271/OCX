import React, { useState, useEffect } from "react";
import classNames from "classnames";

const OcxGlobalSpinner = (props) => {

  const {title = 'Confirm', show = false, onClick, additionalClassName = '', children} = props;
  const [showModal, setShowModal] = useState(show);

  useEffect(() => {
    // Update the document title using the browser API
    setShowModal(showModal);
  });

  return (
    <>
      { showModal ?
      	<>
					<div className="fixed main-font font-16 z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
						<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center lg:block lg:p-0">
						  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
						  <span className="hidden lg:inline-block lg:align-middle lg:h-screen" aria-hidden="true">&#8203;</span>
						  <div className="relative inline-block align-bottom text-center transition-all lg:my-8 lg:align-middle lg:max-w-lg lg:w-full">
						    <div>
						      	<div className="flex justify-center items-center">
									    <div className={classNames("flex justify-center mt-10 mb-10")}>
									        <div style={{'borderTopColor':'transparent'}}
									            className={
									            	classNames(
									            		`w-16 h-16`, 
									            		"border-2", 
									            		`border-white-500`, 
									            		"border-solid rounded-full animate-spin"
									            	)
									            }
									        ></div>
									    </div>
								  	</div>
								</div>
              </div>
						</div>
					</div>
				</>
      : <></>
    }
    </>
  )
};

export default OcxGlobalSpinner;
