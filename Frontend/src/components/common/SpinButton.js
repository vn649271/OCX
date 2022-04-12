import React, { Component, useStyles } from 'react';

var me;

export default function SpinButton(props) {

    me = this;

    const defaultClass = "main-font border border-grey-light p-2 w-min button-bg focus:outline-none rounded text-white hover-transition cursor-pointer";
    const { title, extraData, children } = props;

    const [buttonClass, setButtonClass] = React.useState(defaultClass);
    const [status, setStatus] = React.useState(0); // 0: Normal, 1: Pending

    const _handleClick = () => {
        if (status) {
            return;
        }
        setStatus(1);
        setButtonClass(defaultClass.replace("cursor-pointer", "spin-button-disabled"));
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
                    className="fa fa-spinner"
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
