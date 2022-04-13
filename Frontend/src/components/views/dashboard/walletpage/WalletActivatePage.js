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
  const [hide_passcode_checklist, setHidePasscodeCheckBox] = useState(true);
  const [lock_account, setLockAccount] = useState(true);
  const [accounts, setAccounts] = useState(null);
  const [show_passphrase_import_dialog, setShowPassPhraseImportDialog] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [passcode_confirm, setPasscodeConfirm] = useState('');
  const [encrypted_passphrase, setEncryptedPassphrase] = useState('');

  const onGeneratePassphrase = ev => {
    let randomWordList = randomWords(12).join(' ');
    setPassphrase(randomWordList);
    setEncryptedPassphrase(rsaCrypt.encrypt(randomWordList));
  }
  const onChangePasscode = ev => {
    setPasscode(ev.target.value);
  }
  const onChangePasscodeConfirm = ev => {
    setPasscodeConfirm(ev.target.value);
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
      setEncryptedPassphrase(rsaCrypt.encrypt(param.passphrase));
      console.log("************* onOkPassphraseImportDialog(): param=", param);
      setShowPassPhraseImportDialog(false);
      let resp = await accountService.restoreAccount({
          userToken: userToken,
          password: hashCode(param.password),
          passphrase: encrypted_passphrase
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
      if (encrypted_passphrase.trim() === "") {
          this.warning("Invalid passphrase");
          return;
      }
      let resp = await accountService.createAccount({
          userToken: this.userToken,
          password: hashCode(this.state.input.password),
          passphrase: encrypted_passphrase
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
    <div className="justify-center w-full">
        <div className="flex justify-center mb-10">
            <div className="items-start w-1/2">
              <div className="passphrase-container">
                <textarea
                    className="passphrase-box border border-grey-light bg-gray-100 p-5 mb-5 font-16 main-font focus:outline-none rounded w-full"
                    name="passphrase"
                    // onChange={this.handleInputChange}
                    value={passphrase}
                    placeholder="Passphrase" autoComplete="off"
                    disabled={true}
                />
                <div className="flex justify-end w-full">
                  <OcxButton
                    label="Generate"
                    onClick={onGeneratePassphrase}
                  />
                </div>
              </div>
              <hr className="mt-10 mb-10"/>
              <div className="account-passcode-container block w-full mb-5">
                  <input
                    type={show_passcode ? "text" : "passcode"}
                    className="passcode-input border border-grey-light bg-gray-100 w-full p-5 font-16 main-font focus:outline-none rounded "
                    name="passcode"
                    // value={passcode}
                    onChange={onChangePasscode}
                    onBlur={onLeaveFromPasscodeInput}
                    placeholder="Passcode" autoComplete="off" 
                  />
                  <i className="ShowPasswordIcon font-16" onClick={togglePasscodeVisiblity}>{eye}</i>
              </div>
              <PasswordChecklistComponent
                password={passcode || ""}
                confirmPassword={passcode_confirm || ""}
                hidden={hide_passcode_checklist} 
              />
              <div className="mb-10 w-full">
                <input
                  type="passcode"
                  className="block border border-grey-light bg-gray-100 w-full p-5 font-16 main-font focus:outline-none rounded "
                  name="confirm_passcode"
                  // value={passcode_confirm}
                  onChange={onChangePasscodeConfirm}
                  placeholder="Confirm Passcode" autoComplete="off" 
                />
              </div>
              <div id="create-account-button-container" className="flex justify-end w-full">
                  {/* Send Button */}
                  <SpinButton
                      title="New Account"
                      onClick={onCreateAccont}
                      extraData={null} />
              </div>
              <div className="import-passphrase-container flex justify-end mt-5 mb-5">
                  <span className="main-font font-16 link-button" onClick={onClickImportPassphrase}>Import passphrase</span>
              </div>
            </div>
          </div>
          <div>
        </div>
        <PassphraseImportDialog
            className="passphrase-import-dialog"
            show={show_passphrase_import_dialog}
            onOk={onOkPassphraseImportDialog}
            onCancel={onCancelPassphraseImportDialog}
        />
    </div>
  );
};

export default WalletActivatePage;