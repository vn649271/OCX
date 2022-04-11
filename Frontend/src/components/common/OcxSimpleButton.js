import React, { Component, useStyles } from 'react';

export default function OcxSimpleButton(props) {

    const defaultClass = "main-font border border-grey-light p-5 button-bg focus:outline-none rounded text-white hover-transition cursor-pointer";

    const handleClick = async (event) => {
        props.onClick(event);
    };

    return (
        <div
            id={props.id} 
            className={defaultClass} 
            onClick={handleClick}
        >
        {props.title}
        </div>
    );
}
