import PasswordChecklist from "react-password-checklist"

export default function PasswordChecklistComponent(props) {
    return (
        <div className="password-checklist-container" hidden={props.hidden}>
			<PasswordChecklist
				rules={["minLength","specialChar","number","capital"]}
				minLength={8}
				value={props.password}
				valueAgain={props.confirmPassword}
				messages={{
					minLength: "The password must be 8 characters or longer.",
					specialChar: "The password must contain at least one special character.",
					number: "The password must contain at least 1 numeric character.",
					capital: "The password must contain at least 1 uppercase alphabetical character.",
				}}
			/>
        </div >
    );
}