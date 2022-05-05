import { useState } from "react";
import OcxModalComponents from "./OcxModalComponents";

const OcxConfirm = (props) => {

  const {show = false, children, onClick = () => {}} = props;

  const [_show, setShow] = useState(show);

  const onClickedYesButton = () => {
    setShow(false)
    onClick(2);
  }

  const onClickedNoButton = () => {
    setShow(false)
    onClick(1);
  }

  const onClickedCancelButton = () => {
    setShow(false)
    onClick(0);
  }

  return (
    <div className="confirm-frame z-50 fixed justify-center items-center w-full">
      <OcxModalComponents.Frame
        additionalClass="mt-60"
        open={_show}
        onClose={onClickedCancelButton}
      >
        <OcxModalComponents.Head>Confirm</OcxModalComponents.Head>
        <OcxModalComponents.Body>{children}</OcxModalComponents.Body>
        <OcxModalComponents.Footer>
          <button
            className="border border-grey-light p-1 button-bg focus:outline-none rounded text-white hover-transition font-bold uppercase px-3 shadow hover:shadow-lg focus:outline-none mr-1 mb-1"
            type="button"
            onClick={onClickedYesButton}
          >Yes</button>
          <span className="ml-5"> </span>
          <button
            className="border border-grey-light p-1 rounded hover-transition hover-transition text-red-500 background-transparent font-bold uppercase px-3 focus:outline-none mr-1 mb-1"
            type="button"
            onClick={onClickedNoButton}
          >No</button>
        </OcxModalComponents.Footer>
      </OcxModalComponents.Frame>
    </div>
  );
};

export default OcxConfirm;