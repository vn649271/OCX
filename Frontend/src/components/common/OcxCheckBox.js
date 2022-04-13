import { useState } from "react";

const OcxCheckBox = props => {

    const { label, checked = false, onCheckChanged = null } = props;
    const now = new Date();
    const id = "ocx-checkbox-" + now.valueOf();
    
    const [_label, setLabel] = useState(label);
    const [_checked, setChecked] = useState(checked);

    const onChange = ev => {
        let val = ev.target.checked;
        if (onCheckChanged) {
            onCheckChanged(val);
        }
    }

    return (
        <div className="flex justify-center main-font font-16">
            <div className="flex items-center">
                <input 
                    id={id} 
                    aria-describedby={label}
                    type="checkbox" 
                    className="w-8 h-8 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" 
                    required
                    onChange={onChange}
                />
            </div>
            <div className="ml-3">
                <label 
                    htmlFor={id}
                    className="font-medium main-color dark:text-lightgray-color"
                >{label}</label>
            </div>
        </div>
    );
}

export default OcxCheckBox;