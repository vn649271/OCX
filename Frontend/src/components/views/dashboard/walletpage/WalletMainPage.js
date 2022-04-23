import { useState } from "react";

import { hashCode } from "../../../../service/Utils";
import OcxSpinButton from '../../../common/OcxSpinButton';
import AccountService from '../../../../service/Account';
import PageTabBar from '../../../common/PageTabBar';
import QRCode from "react-qr-code";
import ExchangeSwap from '../../../common/exchange/ExchangeSwap';

const accountService = new AccountService();

const IDLE = 0,
      LOCKING = 1,
      SENDING = 2;

const walletPageTabItems = [
    {
        name: 'transfer-tab',
        title: 'Transfer'
    },
    {
        name: 'swap-tab',
        title: 'Swap'
    },
];


const WalletMainPage = props => {

  const {userToken, onLockedAccount, showToast} = props;

  const [locked, setLocked] = useState(false);
  const [accounts, setAccounts] = useState({});
  const [balance, setBalance] = useState({});
  const [price, setPrice] = useState({});
  const [current_tab, setCurrentTab] = useState(0);
  const [to_address, setDestAddress] = useState("");
  const [transfer_amount, setTransferAmount] = useState(0);
  const [show_passcode_confirm, setShowPasscodeConfirm] = useState(false);
  const [temp_storage, setTempStorage] = useState(null);
  const [current_state, setCurrentState] = useState(IDLE);
  const [user_password_to_confirm_tx, setUserPasswordToConfirmTx] = useState(null);
  const [balance_timer, setBalanceTimer] = useState(null);

  const onLockAccont = async (params) => {
    // if (this.state.current_state !== IDLE) {
    //     stopWait();
    //     showToast(1, 'Could not perform the current action during another one');
    //     return;
    // }
    // Try to unlock
    let {stopWait, getExtraData} = params;
    setCurrentState(LOCKING);
    let resp = await accountService.lockAccount({
        userToken: userToken,
    });
    setCurrentState(IDLE);
    stopWait();
    if (balance_timer) {
        clearInterval(balance_timer);
        balance_timer = null;
    }
    if (resp.error === 0) {
        // Display unlocked account page
        setLocked(true);
        onLockedAccount();
        return;
    } else if (resp.error === -1000) {
        showToast(1, "Invalid response for locking account");
        return;
    }
    showToast(1, resp.data);
  }
  const onChangeDestAddress = (ev) => {
    setDestAddress(ev.target.value);
  }
  const onChangeTransferAmount = ev => {
    setTransferAmount(ev.target.value)
  }
  const onSelectTab = tabName => {
      setCurrentTab(tabName);
  }
  const onTransfer = (params) => {
    openPasscodeConfirmDialog(params);
  }
  const openPasscodeConfirmDialog = (params) => {
    setTempStorage({stopWait: params.stopWait, getExtraData: params.getExtraData});
    setShowPasscodeConfirm(true);
  }
  const onOkPasscodeConfirmDialog = userPasswordToConfirmTx => {
      setShowPasscodeConfirm(false);
      setUserPasswordToConfirmTx(userPasswordToConfirmTx);
      let { stopWait, getExtraData } = temp_storage;
      setTempStorage(null);
      _transfer(stopWait, getExtraData);
  }
  const onCancelPasscodeConfirmDialog = () => {
      let { stopWait, getExtraData } = temp_storage;
      setTempStorage(null);
      stopWait();
  }
  const setTransferAmountUI = (_amount) => {

  }
  const _transfer = async (stopWait, getExtraData) => {
      // if (this.state.current_state !== IDLE) {
      //     stopWait();
      //     showToast(1, 'Could not perform the current action during another one');
      //     return;
      // }
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

      let amount = transfer_amount ? transfer_amount : null;
      if (amount === null || amount.trim() === "") {
          stopWait();
          showToast(1, "Please input the amount to send");
          return;
      }

      setCurrentState(SENDING);

      let resp = await accountService.sendCryptoCurrency({
          userToken: userToken,
          toAddress: toAddress,
          amount: amount,
          password: hashCode(user_password_to_confirm_tx)
      });
      setCurrentState(IDLE);
      stopWait();
      if (resp.error === 0) {
          setTransferAmountUI(0);
          showToast(0, "Sending Complete");
          return;
      } else if (resp.error === -1000) {
          showToast(1, "Invalid response for sending token");
      } else {
          showToast(1, resp.data);
      }
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full">
          <div className="account-global-info-container">
              <div className="lock-account-button-container mr-20">
                  {/* Lock Button */}
                  <OcxSpinButton
                    title="Lock"
                    onClick={onLockAccont}
                  />
              </div>
              <div id="my-account-info-container" className="flex justify-start account-info-container help-block main-font font-16 mr-16">
                <div className="balance-area w-5/12 mr-5">
                  <p className="account-address-box help-block main-font text-green-400 font-16">
                      {accounts ?
                          accounts['ETH'] ?
                              accounts['ETH'] ?
                                  accounts['ETH'] :
                                  null :
                              null :
                          null}
                  </p>
                  Balance:
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      {balance['ETH']} ETH
                  </p>
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      {balance['UNI']} UNI
                  </p>
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      {balance['DAI']} DAI
                  </p>
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      {balance['OCAT']} OCAT
                  </p>
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      {balance['PNFT']} PNFT
                  </p>
                </div>
                <div className="current-price-area w-5/12 mr-5">
                  Prices:
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      ETH: ${price['ETH']}
                  </p>
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      UNI: ${price['UNI']}
                  </p>
                  <p className="account-balance-box main-font text-black-400 mb-100 font-20">
                      DAI: ${price['DAI']}
                  </p>
                </div>
              </div>
          </div>
          <div className="pagetabbar-container mb-10">
              <PageTabBar
                  key="transfer-tab"
                  onClickItem={onSelectTab}
                  items={walletPageTabItems}
                  defaultActiveItem='transfer-tab'
              />
          </div>
          <div className={current_tab === 'transfer-tab' ? 'shownBox' : 'hiddenBox'}>
              <div id="qr-account-container">
                  <div id="qr-container">
                      <QRCode value="hey" />
                  </div>
                  <div id="account-info-container">
                      <input
                          type="text"
                          className="block border border-grey-light bg-gray-100  w-full p-5 my-5 font-16 main-font focus:outline-none rounded mb-10"
                          name="to_address"
                          id="to_address"
                          placeholder="To Address"
                          value={to_address}
                          onChange={onChangeDestAddress}
                          autoComplete="off" />
                      <input
                          type="number"
                          className="block border border-grey-light bg-gray-100  w-full p-5 my-5 font-16 main-font focus:outline-none rounded mb-10"
                          name="amount"
                          id="amount"
                          placeholder="Amount"
                          value={transfer_amount}
                          onChange={onChangeTransferAmount}
                          autoComplete="off" />
                  </div>
              </div>
              <div id="send-button-container">
                  {/* Send Button */}
                  <OcxSpinButton
                    title="Send"
                    onClick={onTransfer}
                    extraData={null} 
                  />
              </div>
          </div>
          <div className={current_tab === 'swap-tab' ? 'shownBox' : 'hiddenBox'}>
              <div className="flex w-full justify-center">
                  <ExchangeSwap
                      extraClass="home-card py-10 px-0 w-half h-full"
                      {...props}
                  />
              </div>
          </div>
      </div>
    </div>
  );
};

export default WalletMainPage;