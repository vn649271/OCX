import { useState } from "react";
import PasscodeResetPage from "./walletpage/PasscodeResetPage";
import OcxCard from '../../common/OcxCard';
import OcxCheckBox from '../../common/OcxCheckBox';
import OcxButton from '../../common/OcxButton';
import OcxConfirm from '../../common/OcxConfirm';

const WalletPage = (props) => {

  const {show = false, children, onClick = () => {}} = props;
  let ready = false;

  const [_show, setShow] = useState(show);
  const [show_activate_wallet_confirm, setActivateWalletShow] = useState(false);
  const [enable_activate_wallet_button, setEnableActivateWalletButton] = useState(false);

  const onClickedYesButton = () => {
    setShow(false)
    onClick(2);
  }

  const onClickedNoButton = () => {
    setShow(false)
    onClick(1);
  }

  const onClickedCancelButton = () => {
    setShow(false)
    onClick(0);
  }

  const onReadyCheckBoxChanged = val => {
    ready = val;
    setEnableActivateWalletButton(ready)
  }

  const onClickActivateWallet = () => {
    setActivateWalletShow(true);
  }

  const onClickActivateWalletConfirm = (ret) => {
    setActivateWalletShow(false)
  }

  return (
    <>
        {
            show_activate_wallet_confirm ? 
            <OcxConfirm 
                show={true}
                onClick={ onClickActivateWalletConfirm }
            >Are you sure to submit?</OcxConfirm>
            :<></>
        }
        <div className="flex items-stretch">
            <div className="py-4 w-8/12">
                <OcxCard title='Important'>
                    <span className="main-font font-16">
                        Please read this message carefully before you processed to active your wallet.
                        <br/>
                        <p>
                        <b className="font-18">First:</b> For your wallet's safety please get your pen and paper ready to record down a passphrase.
                        "A passphrase is an optional password that can added on top of your wallet backup (24-word mnemonic seed). "
                        A passphrase is the only way to restore your wallet when you lost your private/public keys,
                        please keeping your passphrase in a secure place for as long as you can.
                        </p>
                        <p>
                        <b className="font-18">Second:</b> For your securely using your wallet functions that we need you to prepare a passcode
                        </p>
                    </span>
                    <div className="flex justify-center mt-10">
                        <OcxCheckBox 
                            label="Ready?"
                            onCheckChanged={onReadyCheckBoxChanged}
                        />
                    </div>
                </OcxCard>
                <div className="justify-center mt-20">
                    <OcxButton 
                        enabled={enable_activate_wallet_button}
                        label="Activate Wallet"
                        onClick={onClickActivateWallet}
                    />
                </div>
            </div>
            <div className="py-4 w-4/12 ml-10">
                <OcxCard title='Cold Wallet'>
                    <span className="main-font font-16">
                        Cold wallet is a offline safe for your crypto assets to store. you can use a old smartphone to be cold wallet for further info please 
                        click link.
                    </span>
                </OcxCard>
            </div>
        </div>    
    </>
  );
};

export default WalletPage;