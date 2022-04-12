import React, { Component, useStyles } from 'react';

var me;

export default function SpinButton(props) {

    const { title, additionalClass, extraData, children } = props;

    const baseClass = "main-font font-16 items-center border border-grey-light p-3 w-fit button-bg focus:outline-none rounded text-white hover-transition " + additionalClass;
    const defaultClass = baseClass + " cursor-pointer";
    const disabledClass = baseClass + " spin-button-disabled";

    const [buttonClass, setButtonClass] = React.useState(defaultClass);
    const [status, setStatus] = React.useState(0); // 0: Normal, 1: Pending

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

    const handleClick = event => {
        _handleClick();
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
        >
        {
            status? (
                <i
                    className="fa fa-spinner mr-2"
                    onClick={handleClick}
                ></i>
            ):  <i 
                    onClick={handleClick}
                ></i>
        }
        {props.title}
        </div>
    );
}
