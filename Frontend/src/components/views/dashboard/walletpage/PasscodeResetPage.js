import { useState } from "react";
import OcxCard from '../../../common/OcxCard';
import OcxSpinButton from '../../../common/OcxSpinButton';

const PasscodeResetPage = (props) => {

  // const {show = false, children, onClick = () => {}} = props;

  const [message, setMessage] = useState("");
  const [email, setEmail] = useState('');

  const onChangeEmail = (ev) => {
    setEmail(ev.target.value);
  }
  const onSendEmail = () => {
    alert(email);
    setMessage("We will send you a passcode reset link to your email")
  }
  return (
    <div className="flex justify-center items-center w-full">
      <OcxCard>
        <span className="main-font font-16 main-color">Please enter your registered Email address</span>
        <div className="flex justify-center mt-10 mb-20">
          <div>
            <input
              type="email"
              className="password-input border border-grey-light bg-gray-100 p-3 w-full font-16 main-font focus:outline-none rounded "
              name="email"
              onChange={onChangeEmail}
              placeholder="Email" autoComplete="off" 
            />
          </div>
          <OcxSpinButton
            additionalClass="ml-8"
            title="Send"
            onClick={onSendEmail}
            extraData={null} 
          />
        </div>
        <hr/>
        <div className="mt-6">
          <span className="main-font font-16 main-color">{message}</span>
        </div>
      </OcxCard>
    </div>
  );
};

export default PasscodeResetPage;