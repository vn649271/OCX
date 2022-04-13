import { useEffect, useState } from "react";
import PasswordChecklist from "react-password-checklist"

export default function OcxPasswordChecklist(props) {
	const {hidden, password, confirmPassword} = props;

	const [_hide, setHide] = useState(hidden);

	useEffect(() => {
		setHide(hidden);
	});

	const getBox = () => {
		var box = <></>;
		if (!_hide) {
	        box = <div className="password-checklist-container">
				<PasswordChecklist
					rules={["minLength","specialChar","number","capital"]}
					minLength={8}
					value={password}
					valueAgain={confirmPassword}
					messages={{
						minLength: "The password must be 8 characters or longer.",
						specialChar: "The password must contain at least one special character.",
						number: "The password must contain at least 1 numeric character.",
						capital: "The password must contain at least 1 uppercase alphabetical character.",
					}}
				/>
	        </div>
	    }
		return box;
	}

	const checklist = getBox();
    return (checklist);
}