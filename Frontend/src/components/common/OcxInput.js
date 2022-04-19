import { useState, useEffect } from 'react';

export default function OcxInput(props) {

	const {
		type = 'text',
		additionalClassName = '', 
		readOnly = false,
		name = '',
		id = '',
		placeholder = '',
		value = '',
		autoComplete = 'off',
	} = props;

    const _baseClass = "inline-flex block border border-grey-light ml-10 bg-gray-100 w-200 p-3 font-16 main-font focus:outline-none rounded ";

    const [_class, setClass] = useState(_baseClass);
    const [_value, setValue] = useState(value);
    const [is_change, setChangedFlag] = useState(false);

    useEffect(() => {
    	var className = _baseClass;
    	if (type == 'number') {
			className += 'text-right';
    	}
		className += additionalClassName;
		setClass(className);
		if (!is_change) {
			setValue(value);
		}
    });

	const handleInputChange = ev => {
		setValue(ev.target.value);
		setChangedFlag(true);
		if (props.onChange) {
			props.onChange(ev);
		}
	}

    return (
        <div>
			<input
	            type={type}
	            name={name}
	            id={id}
	            placeholder={placeholder}
	            value={_value}
	            autoComplete={autoComplete}
				readOnly={readOnly}
                className={_class}
				onChange={handleInputChange}
            /> 
		</div>
    );
}
