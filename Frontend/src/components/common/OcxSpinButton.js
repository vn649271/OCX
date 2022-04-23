import React, { Component, useStyles } from 'react';
import OcxSpinner from './OcxSpinner';

var me;

export default function OcxSpinButton(props) {

    // renderMode: 0 - flex mode(caption is next by spinner) , 
    //             1 - overlapped mode(spinner is overlapped above the caption)
    const { title, additionalClass, extraData, children, renderMode=0 } = props;

    const baseClass = "ocx-spin-button main-font font-16 items-center border border-grey-light " + 
                    "p-3 w-max button-bg focus:outline-none rounded " +
                    "text-white hover-transition " + (renderMode == 0? "flex justify-center ": "") +
                    (additionalClass ? additionalClass : "");
    const defaultClass = baseClass + " cursor-pointer";
    const disabledClass = baseClass + " spin-button-disabled";

    const [buttonClass, setButtonClass] = React.useState(defaultClass);
    const [status, setStatus] = React.useState(0); // 0: Normal, 1: Pending

    const handleMouseEvent = ev => {
        console.log(ev.type);
    }
    const handleClick = ev => {
        _handleClick();
    };
    const _handleClick = () => {
        if (status) {
            return;
        }
        setStatus(1);
        setButtonClass(disabledClass);
        props.onClick({
            stopWait: stopWait, 
            getExtraData: getExtraData
        });
    };
    const stopWait = () => {
        setButtonClass(defaultClass);
        setStatus(0);        
    }
    const getExtraData = () => {
        return extraData;
    }

    return (
        <div
            id={props.id} 
            className={buttonClass} 
            onClick={handleClick}
            onMouseDown={handleMouseEvent}
            onMouseUp={handleMouseEvent}
        >
            {status?
                renderMode==0?
                    <OcxSpinner size='8' margin='mr-5 mt-1' color='white'/>:
                <OcxSpinner size='8' margin='-mb-9' color='white'/>:
            <></>} 
            {props.title}
        </div>
    );
}
