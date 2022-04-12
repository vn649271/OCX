import { useState } from 'react';

export default function OcxButton(props) {

    const { label, onClick = null, enabled = 1 } = props;

    const defaultClass = "main-font font-16 border border-grey-light p-3 w-max button-bg focus:outline-none rounded text-white hover-transition cursor-pointer";
    const disabledClass = "main-font font-16 border border-grey-light p-3 w-max button-bg rounded text-white cursor-pointer opacity-50";

    const [buttonClass, setButtonClass] = useState(defaultClass);
    const [status, setStatus] = useState(enabled); // 1: enabled, 0: disabled

    const handleClick = () => {
        if (!enabled) return;
    	if (onClick) onClick();
    };

    const setEnable = (enable) => {
        enabled = enable ? 1: 0;
    }

    return (
        <div
            className={enabled ? buttonClass : disabledClass } 
            onClick={handleClick}
        >{label}</div>
    );
}
