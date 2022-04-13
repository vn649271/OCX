import { useState } from "react";
import PasscodeResetPage from "./PasscodeResetPage";
import OcxCard from '../../../common/OcxCard';
import OcxCheckBox from '../../../common/OcxCheckBox';
import OcxButton from '../../../common/OcxButton';
import OcxConfirm from '../../../common/OcxConfirm';

const WalletIntroPage = (props) => {

  const {
  	show = false, 
  	children, 
  	onClick = () => {},
  	onActivateWallet = () => {}
  } = props;

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
    // setActivateWalletShow(true);
    onActivateWallet();
  }
  const onClickActivateColdWallet = () => {

  }
  const onClickActivateWalletConfirm = (ret) => {
    setActivateWalletShow(false);
    onActivateWallet();
  }

  return (
    <>
        {
            show_activate_wallet_confirm ? 
            <OcxConfirm 
                show={true}
                onClick={ onClickActivateWalletConfirm }
            >Are you sure to activate wallet?</OcxConfirm>
            :<></>
        }
        <div className="flex items-stretch">
            <div className="w-8/12">
                <OcxCard title='Important'>
                    <div className="mb-5">
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
                    </div>
                    <hr/>
                    <div className="flex justify-center mt-5">
                        <OcxCheckBox 
                            label="Ready"
                            onCheckChanged={onReadyCheckBoxChanged}
                        />
                    </div>
                </OcxCard>
                <div className="flex justify-end mt-10">
                    <OcxButton 
                        enabled={enable_activate_wallet_button}
                        label="Activate Wallet"
                        onClick={onClickActivateWallet}
                    />
                </div>
            </div>
            <div className="w-4/12 ml-10">
                <OcxCard title='Cold Wallet'>
                    <div className='mb-5'>
                        <p className="main-font font-16">
                            Cold wallet is a offline safe for your crypto assets to store. you can use a old smartphone to be cold wallet for further info please 
                            click link.
                        </p>
                    </div>
                    <div className='flex justify-center mb-5'>
                        <a className='main-font font-16 text-blue-500' href='#'>Click Here</a>
                    </div>
                    <hr/>
                    <div className="flex justify-center mt-5">
                        <OcxButton 
                            label="Download App"
                            onClick={onClickActivateColdWallet}
                        />
                    </div>                    
                </OcxCard>
            </div>
        </div>    
    </>
  );
};

export default WalletIntroPage;