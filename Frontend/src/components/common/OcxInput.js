import { useState } from 'react';

export default function OcxInput(props) {

    const baseClass = "inline-flex block border border-grey-light ml-10 bg-gray-100 w-200 p-3 font-16 main-font focus:outline-none rounded ";

    const [inputClass, setInputClass] = useState(baseClass);

	const handleInputChange = ev => {
		if (props.onChange) {
			props.onChange(ev);
		}
	}

    return (
        <div>
			<input
	            type="text"
                className={inputClass}
				{...props}
				onChange={handleInputChange}
				autoComplete="off"
            /> 
		</div>
    );
}
