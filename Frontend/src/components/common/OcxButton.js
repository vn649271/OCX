import React, { Component, useStyles } from 'react';

var me;

export default function OcxButton(props) {

    const { label, onClick = null } = props;

    const defaultClass = "main-font font-16 border border-grey-light p-3 w-max button-bg focus:outline-none rounded text-white hover-transition cursor-pointer";

    const [buttonClass, setButtonClass] = React.useState(defaultClass);

    const handleClick = () => {
    	if (onClick) onClick();
    };

    return (
        <div
            className={buttonClass} 
            onClick={handleClick}
        >{label}</div>
    );
}
