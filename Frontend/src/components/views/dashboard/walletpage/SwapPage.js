import { useState } from 'react';
import { hashCode } from "../../../../service/Utils";
import PasscodeConfirmDialog from '../../../common/PasscodeConfirmDialog';
import OcxSpinButton from '../../../common/OcxSpinButton';
import OcxInput from '../../../common/OcxInput';
import QRCode from "react-qr-code";

import AccountService from '../../../../service/Account';
const accountService = new AccountService();

const TRANSFER = 1;

const SwapPage = (props) => {

	const {userToken, showToast} = props;

	const [to_address, setDestinationAddress] = useState("");
	const [_amount, _setAmount] = useState("");
	const [_passcode, _setPasscode] = useState("");
	const [show_passcode_confirm, setShowPasscodeConfirm] = useState(false);
	const [confirm_handler, setConfirmHandler] = useState(null);
	const [confirm_text, setConfirmText] = useState("");
	const [confirm_context, setConfirmContext] = useState(null);

	const onChangeDestAddress = (ev) => {
		setDestinationAddress(ev.target.value);
	}
	const onChangeTransferAmount = (ev) => {
		_setAmount(ev.taret.value);
	}
	const onTransfer = (params) => {
		openPasscodeConfirmDialog(params);
        // showConfirm({ id: TRANSFER, context: params });
	}
	const openPasscodeConfirmDialog = (params) => {
        setConfirmContext(params);
		setShowPasscodeConfirm(true);
	}
	const onOkPasscodeConfirmDialog = passcode => {
		setShowPasscodeConfirm(false);
		_setPasscode(passcode);
		let { stopWait, getExtraData } = confirm_context;
		setConfirmContext(null);
		_transfer(stopWait, getExtraData);
	}
	const onCancelPasscodeConfirmDialog = () => {
		let { stopWait, getExtraData } = confirm_context;
		setConfirmContext(null);
		stopWait();
	}
	const _transfer = async (stopWait, getExtraData) => {
		let toAddress = to_address? to_address : null;
		if (toAddress === null) {
		  stopWait();
		  showToast(1, "Please input receiving address");
		  return;
		}
		if (toAddress.trim().length !== 42) {
		  stopWait();
		  showToast(1, "Please input valid receiving address");
		  return;
		}

		let amount = _amount ? _amount : null;
		if (amount === null || amount.trim() === "") {
		  stopWait();
		  showToast(1, "Please input the amount to send");
		  return;
		}

		// setCurrentState(SENDING);

		let resp = await accountService.sendCryptoCurrency({
		  userToken: userToken,
		  toAddress: toAddress,
		  amount: amount,
		  password: hashCode(_passcode)
		});
		// setCurrentState(IDLE);
		stopWait();
		if (resp.error === 0) {
		  _setAmount(0);
		  showToast(0, "Sending Complete");
		  return;
		} else if (resp.error === -1000) {
		  showToast(1, "Invalid response for sending token");
		} else {
		  showToast(1, resp.data);
		}
	}

	return(
      <div id="swap-container" className="w-full">
      	{ 
      		show_passcode_confirm ? 
	      		<PasscodeConfirmDialog 
		      		onOk={onOkPasscodeConfirmDialog} 
		      		onCancel={onCancelPasscodeConfirmDialog} 
	      		/>: <></>
      	}
        <div className="flex justify-start">
          <div id="account-info-container" className="w-9/12 mr-10">
            <OcxInput
                name="to_address"
                id="to_address"
                placeholder="To Address"
                value={to_address}
                onChange={onChangeDestAddress}
                autoComplete="off" />
            <OcxInput
                type="number"
                name="amount"
                id="amount"
                placeholder="Amount"
                value={_amount}
                onChange={onChangeTransferAmount}
                autoComplete="off" />
            <div id="send-button-container" className="flex justify-end">
              {/* Send Button */}
              <OcxSpinButton
                title="Send"
                onClick={onTransfer}
                extraData={null} 
              />
            </div>
          </div>
          <div id="qr-container" className="w-3/12 mt-5">
            <QRCode value="hey" size={125}/>
          </div>
        </div>
      </div>
	);
}

export default SwapPage;