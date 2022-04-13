import { useState } from "react";

const OcxCard = props => {

    const { title = null, children } = props;
    // const [value, setValue] = React.useState(new Date());

    return (
        <div className="bg-white p-10 rounded-lg shadow-md">
            {
                title ? 
                    <>
                        <h1 className="main-font font-28 mb-5 main-color">{title}</h1>
                        <hr/>
                    </>: <></>
            }
            <div className="mt-5 main-color">
            {children}
            </div>
        </div>
    );
}

export default OcxCard;