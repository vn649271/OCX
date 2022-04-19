import { useState } from 'react';

export default function OcxButton(props) {

    const { label, onClick = null, enabled = 1 } = props;

    const baseClass = "main-font font-16 border border-grey-light p-3 w-max rounded text-white ";
    const defaultClass = baseClass + "cursor-pointer focus:outline-none hover-transition button-bg";
    const mouseDownClass = baseClass + "cursor-pointer bg-green-500 focus:outline-none hover-transition button-mousedown-bg";
    const disabledClass = baseClass + "button-bg spin-button-disabled opacity-50";

    const [buttonClass, setButtonClass] = useState(defaultClass);
    const [status, setStatus] = useState(enabled); // 1: enabled, 0: disabled

    const handleMouseEvent = ev => {
        if (!enabled) {
            return;
        }
        if (ev.type == 'mousedown') {
            setButtonClass(mouseDownClass);
        } else if (ev.type == 'mouseup') {
            setButtonClass(defaultClass);
            if (onClick) {
                onClick();
            }
        }
    }
    const handleBlue = ev => {
        if (!enabled) return;
        setButtonClass(defaultClass);
    }
    const setEnable = (enable) => {
        enabled = enable ? 1: 0;
    }

    return (
        <div
            className={enabled ? buttonClass : disabledClass } 
            // onClick={handleClick}
            onMouseDown={handleMouseEvent}
            onMouseUp={handleMouseEvent}
            onBlur={handleBlue}
        >{label}</div>
    );
}
