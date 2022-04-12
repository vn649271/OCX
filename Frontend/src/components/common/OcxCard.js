import { useState } from "react";

const OcxCard = props => {

    const { title, children } = props;
    // const [value, setValue] = React.useState(new Date());

    return (
        <div className="bg-white p-10 rounded-lg shadow-md">
            <h1 className="main-font font-28 mb-10">{title}</h1>
            {children}
        </div>
    );
}

export default OcxCard;