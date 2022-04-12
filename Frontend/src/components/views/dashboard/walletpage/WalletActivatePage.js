import { useState } from "react";
import randomWords from 'random-words';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { JSEncrypt } from 'jsencrypt'

import { hashCode } from "../../../../service/Utils";
import PasswordChecklistComponent from "../../../common/PasswordChecklistComponent";
import PassphraseImportDialog from '../../../common/PassphraseImportDialog';
import PasscodeConfirmDialog from '../../../common/PasscodeConfirmDialog';
import AccountService from '../../../../service/Account';
import OcxButton from '../../../common/OcxButton';
import SpinButton from '../../../common/SpinButton';

var rsaCrypt = new JSEncrypt();
const accountService = new AccountService();
const eye = <FontAwesomeIcon icon={faEye} />;

const WalletActivatePage = props => {

  const {userToken, showToast, onRegisteredAccount} = props;

  const [show_passcode, setShowPasscode] = useState(false);
  const [hide_passcode_checklist, setHidePasscodeCheckBox] = useState(false);
  const [lock_account, setLockAccount] = useState(true);
  const [accounts, setAccounts] = useState(null);
  const [show_passphrase_import_dialog, setShowPassPhraseImportDialog] = useState(null);

  var passcode = null;
  var passcodeConfirm = null;
  var encryptedPassphrase = null;

  const onGeneratePassphrase = ev => {
      let randomWordList = randomWords(24).join(' ');
      let input = this.state.input;
      input.passphrase = randomWordList;
      this.setState({ input: input });
      encryptedPassphrase = rsaCrypt.encrypt(randomWordList);
  }
  const onChangePasscode = ev => {
    passcode = ev.target.value;
  }
  const onChangePasscodeConfirm = ev => {
    passcodeConfirm = ev.target.value;
  }
  const onLeaveFromPasscodeInput = event => {
      setHidePasscodeCheckBox(true);
  }
  const togglePasscodeVisiblity = () => {
    setShowPasscode(!show_passcode);
  }
  const onClickImportPassphrase = (ev) => {
      setShowPassPhraseImportDialog(true);
  }
  const onCancelPassphraseImportDialog = () => {
      setShowPassPhraseImportDialog(false);
  }
  const onOkPassphraseImportDialog = async (param) => {
      encryptedPassphrase = rsaCrypt.encrypt(param.passphrase);
      console.log("************* onOkPassphraseImportDialog(): param=", param);
      setShowPassPhraseImportDialog(false);
      let resp = await accountService.restoreAccount({
          userToken: userToken,
          password: hashCode(param.password),
          passphrase: encryptedPassphrase
      });
      if (resp.error === 0) {
          console.log("************* restoreAccount(): response=", resp);
          setLockAccount(false);
          setAccounts(resp.data);
          onRegisteredAccount();
          // self.setState({ user_mode: USER_WITH_ACCOUNT });
          return;
      } else if (resp.error === -1000) {
          showToast(1, "Invalid response for creating account");
          return;
      }
      showToast(1, resp.data);
  }
  const onCreateAccont = async (param, ev, btnCmpnt) => {
      let passwordValidation = this.validatePassword(
          this.state.input.password,
          this.state.input.confirm_password
      );
      if (passwordValidation < 0) {
          this.warning("Invalid password");
          return;
      }
      // Perform additional validation for email-phone
      // If required action performed, btnCmpnt.stopTimer() must be called to stop loading
      if (this.userToken === null) {
          this.warning("Error: user token invalid(null)");
          return;
      }
      if (encryptedPassphrase.trim() === "") {
          this.warning("Invalid passphrase");
          return;
      }
      let resp = await accountService.createAccount({
          userToken: this.userToken,
          password: hashCode(this.state.input.password),
          passphrase: encryptedPassphrase
      });
      btnCmpnt.stopTimer();
      if (resp.error === 0) {
          setLockAccount(false);
          setAccounts(resp.data);
          onRegisteredAccount();
          // self.setState({ user_mode: USER_WITH_ACCOUNT });
          return;
      } else if (resp.error === -1000) {
          showToast(1, "Invalid response for creating account");
          return;
      }
      showToast(1, resp.data);
  }

  return (
    <div className="flex justify-center items-center w-full">
        <div className="mb-10">
            <div className="passphrase-container block w-full">
                <textarea
                    className="passphrase-box border border-grey-light bg-gray-100 p-5 font-16 main-font focus:outline-none rounded w-full"
                    name="passphrase"
                    // onChange={this.handleInputChange}
                    // value={this.state.input.passphrase}
                    placeholder="Passphrase" autoComplete="off"
                    disabled={true}
                />
                <OcxButton
                    onClick={onGeneratePassphrase}
                >Generate</OcxButton>
            </div>
            <hr></hr>
            <div className="account-passcode-container block w-full">
                <input
                    type={show_passcode ? "text" : "passcode"}
                    className="passcode-input border border-grey-light bg-gray-100 p-5 font-16 main-font focus:outline-none rounded "
                    name="passcode"
                    // value={this.state.input.passcode}
                    onChange={onChangePasscode}
                    onBlur={onLeaveFromPasscodeInput}
                    placeholder="Passcode" autoComplete="off" />
                <i className="ShowPasswordIcon font-16" onClick={togglePasscodeVisiblity}>{eye}</i>
            </div>
        </div>
        <PasswordChecklistComponent
            passcode={passcode || ""}
            confirmPassword={passcodeConfirm || ""}
            hidden={hide_passcode_checklist} />
        <div className="mb-10">
            <input
                type="passcode"
                className="block border border-grey-light bg-gray-100  w-full p-5 font-16 main-font focus:outline-none rounded "
                name="confirm_passcode"
                // value={passcodeConfirm}
                onChange={onChangePasscodeConfirm}
                placeholder="Confirm Passcode" autoComplete="off" />
        </div>
        <div id="create-account-button-container">
            {/* Send Button */}
            <SpinButton
                title="New Account"
                onClick={onCreateAccont}
                extraData={null} />
        </div>
        <div className="import-passphrase-container">
            <span className="import-passphrase-button" onClick={onClickImportPassphrase}>Import passphrase</span>
        </div>
        <PassphraseImportDialog
            className="passphrase-import-dialog"
            show={show_passphrase_import_dialog}
            onOk={onOkPassphraseImportDialog}
            onCancel={onCancelPassphraseImportDialog}
        />
        <PasscodeConfirmDialog
            className="passcode-confirm-dialog"
            show={this.state.show_passcode_confirm_dialog}
            onOk={this.onOkPasscodeConfirmDialog}
            onCancel={this.onCancelPasscodeConfirmDialog}
        />
    </div>
  );
};

export default WalletActivatePage;