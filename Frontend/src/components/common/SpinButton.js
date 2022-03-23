import React, { Component, useStyles } from 'react';

var me;

export default function SpinButton(props) {

    const defaultClass = "main-font border border-grey-light p-5 button-bg focus:outline-none rounded text-white hover-transition cursor-pointer";

    const [buttonClass, setButtonClass] = React.useState(defaultClass);
    const [status, setStatus] = React.useState(0); // 0: Normal, 1: Pending

    const handleClick = async (event) => {
        if (status) {
            return;
        }
        setStatus(1);
        setButtonClass(defaultClass.replace("cursor-pointer", "spin-button-disabled"));
        await props.onClick(event);
        setButtonClass(defaultClass);
        setStatus(0);
    };

    return (
        <div
            id={props.id} 
            className={buttonClass} 
            onClick={handleClick}
        >
        {
            status? (
                <i
                    className="fa od-spinner"
                    style={{ marginRight: "7px" }}
                >( )</i>
            ): <i style={{ marginRight: "0px" }}></i>
        }
        {props.title}
        </div>
    );
}
