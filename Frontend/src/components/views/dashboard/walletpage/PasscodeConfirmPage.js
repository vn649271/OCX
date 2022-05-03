import { useEffect, useState } from "react";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { JSEncrypt } from 'jsencrypt'
import { hashCode } from "../../../../service/Utils";
import AccountService from '../../../../service/Account';
import OcxSpinButton from '../../../common/OcxSpinButton';
import PassphraseImportDialog from '../../../common/PassphraseImportDialog';
import OcxCard from '../../../common/OcxCard';

var rsaCrypt = new JSEncrypt();
const eye = <FontAwesomeIcon icon={faEye} />;
const accountService = new AccountService();

const PasscodeConfirmPage = props => {

  const {userToken, onUnlockedAccount, onResetPasscode, showToast} = props;

  const [accounts, setAccounts] = useState(null);
  const [lock_account, setLockAccount] = useState(true);
  const [show_passcode, setShowPasscode] = useState(false);
  const [hide_passcode_checklist, setHidePasscodeCheckBox] = useState(false);
  const [show_passphrase_import_dialog, setShowPassPhraseImportDialog] = useState(null);
  const [passcode, setPasscode] = useState('');
  const encryptKey = localStorage.getItem("encryptKey");
  rsaCrypt.setPublicKey(encryptKey);

  const onChangePasscode = ev => {
    setPasscode(ev.target.value);
  }
  const onLeaveFromPasswordInput = ev => {
    setHidePasscodeCheckBox(true);
  }
  const togglePasscodeVisiblity = () => {
    setShowPasscode(!show_passcode);
  }
  const onClickImportPassphrase = (ev) => {
    setShowPassPhraseImportDialog(true);
  }
  const onClickPasscodeReset = ev => {
    onResetPasscode();
  }
  const onCancelPassphraseImportDialog = () => {
    setShowPassPhraseImportDialog(false);
  }
  const onOkPassphraseImportDialog = async (param) => {
    let encryptedPassphrase = rsaCrypt.encrypt(param.passphrase);
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
        // self.setState({ user_mode: USER_WITH_ACCOUNT });
        return;
    } else if (resp.error === -1000) {
        showToast(1, "Invalid response for creating account");
        return;
    }
    showToast(1, resp.data);
  }
  const onUnlockAccont = async (params) => {
      const {stopWait, getExtraData} = params;
      // this.startBalanceMonitor();
      // Try to unlock
      let hashedPasscode = hashCode(passcode);
      let resp = await accountService.unlockAccount({
          userToken: userToken,
          password: hashedPasscode,
      });
      stopWait();
      if (resp.error === 0) {
          // Display unlocked account page
          // self.setPasswordInUI('');
          setLockAccount(false);
          onUnlockedAccount();
          return;
      } else if (resp.error === -1000) {
          showToast(1, "Invalid response for locking account");
          return;
      }
      showToast(1, resp.data);
  }


  return (
    <div className="items-center w-full -ml-5">
      <div className="w-2/3">
        <div className="justify-center w-full">
          <div className="flex justify-center w-full mb-20">
            <div className="account-password-container w-5/12 block">
                <input
                    type={show_passcode ? "text" : "password"}
                    className="password-input border border-grey-light bg-gray-100 p-3 w-full font-16 main-font focus:outline-none rounded "
                    name="password"
                    // value={this.state.input.password}
                    onChange={onChangePasscode}
                    onBlur={onLeaveFromPasswordInput}
                    // onKeyPress={this.onKeyPressedForUnlock}
                    placeholder="Passcode" autoComplete="off" />
                <i className="ShowPasswordIcon font-16" onClick={togglePasscodeVisiblity}>{eye}</i>
            </div>
            {/* Unlock Button */}
            <OcxSpinButton
              additionalClass="ml-8"
              title="Unlock"
              onClick={onUnlockAccont}
              extraData={null} 
            />
          </div>
          <div className="flex justify-center">
            <div className="flex justify-center w-9/12">
              <div className="flex justify-center w-11/12">
                <hr className="w-10/12"/>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center w-full">
          <div className="flex justify-center w-1/3 passcode-reset-container main-font font-16 mt-10">
              <p className="link-button" onClick={onClickPasscodeReset}>Reset Passcode</p>
          </div>
          <div className="flex justify-center w-1/3 import-passphrase-container main-font font-16 mt-10">
              <p className="link-button" onClick={onClickImportPassphrase}>Import passphrase</p>
          </div>
        </div>
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

export default PasscodeConfirmPage;