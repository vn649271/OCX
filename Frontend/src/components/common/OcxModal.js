import { useState } from "react";
import OcxModalComponents from "./OcxModalComponents";

const OcxModal = (props) => {

  const {show = false, title, children} = props;

  const [_show, setShow] = useState(show);

  return (
    <div className="flex justify-center items-center w-full">
      <OcxModalComponents.Frame
        open={_show}
        onClose={() => {
          setShow(false)
        }}
      >
        <OcxModalComponents.Head>{title}</OcxModalComponents.Head>
        <OcxModalComponents.Body>{children}</OcxModalComponents.Body>
      </OcxModalComponents.Frame>
    </div>
  );
};

export default OcxModal;