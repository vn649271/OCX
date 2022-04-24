import { useEffect, useState } from "react";
import WalletIntroPage from './walletpage/WalletIntroPage';
import WalletActivatePage from './walletpage/WalletActivatePage';
import WalletMainPage from './walletpage/WalletMainPage';
import PasscodeConfirmPage from './walletpage/PasscodeConfirmPage';
import PasscodeResetPage from './walletpage/PasscodeResetPage';
import AccountService from '../../../service/Account';
import OcxPageSpinner from '../../common/OcxPageSpinner';

const UNKNOWN_USER = -1;
const NEW_USER_0 = 0;
const NEW_USER_1 = 1;
const USER_ACCOUNT_LOCKED = 2; // It also means the user has own wallet account already
const USER_ACCOUNT_UNLOCKED = 3;
const PASSCODE_RESET = 4;

const WalletPage = (props) => {

    const { 
        showToast = (level, msg) => {
            console.log(level, msg);
        } 
    } = props;

    const defaultUserToken = localStorage.getItem("userToken");
    const defaultEncryptKey = localStorage.getItem("encryptKey");
    const accountService = new AccountService();

    const [current_page, setCurrentPage] = useState(null);
    const [user_token, setUserToken] = useState(defaultUserToken);
    const [encrypt_key, setEncryptKey] = useState(defaultEncryptKey);
    const [accounts, setAccounts] = useState(null);
    const [user_level, setUserLevel] = useState(UNKNOWN_USER);

    useEffect(async () => {
        // Try to connect to my account
        if (user_level == UNKNOWN_USER) {
            let resp = await accountService.connectAccount({
                userToken: user_token
            });
            let err = resp.error !== undefined ? resp.error : -1;
            if (!err) {
                setAccounts(resp.data.addresses);
                if (resp.data.locked) {
                    setUserLevel(USER_ACCOUNT_LOCKED);
                } else {
                    setUserLevel(USER_ACCOUNT_UNLOCKED);
                }
                return;
            } else if (err == 51 || err == 52) {
                setUserLevel(NEW_USER_0);
                return;
            }
            let errorMsg = resp ? resp.data ? resp.data : "Invalid response" : "Unknown error";
            showToast(1, errorMsg);
        }
    });
    const updateCurrentPage = () => {
        switch (user_level) {
        case UNKNOWN_USER:
            return <OcxPageSpinner show={true} />;
        case NEW_USER_0:
            return <WalletIntroPage onActivateWallet={onActivateWallet} />;
        case NEW_USER_1:
            return <WalletActivatePage userToken={user_token} onRegisteredAccount={onRegisteredAccount} {...props} />;
        case USER_ACCOUNT_LOCKED: 
            return <PasscodeConfirmPage 
                        userToken={user_token} 
                        onUnlockedAccount={onUnlockedAccount} 
                        onResetPasscode={onResetPasscode}
                        {...props} 
                    />;
        case USER_ACCOUNT_UNLOCKED: 
            return <WalletMainPage userToken={user_token} onLockedAccount={onLockedAccount} {...props} />;
        case PASSCODE_RESET: 
            return <PasscodeResetPage userToken={user_token} {...props} />;
        default:
            return null;
        }
    }
    const onActivateWallet = () => {
        setUserLevel(NEW_USER_1);
    }
    const onRegisteredAccount = () => {
        setUserLevel(USER_ACCOUNT_LOCKED); 
    }
    const onResetPasscode = () => {
        setUserLevel(PASSCODE_RESET);
    }
    const onUnlockedAccount = () => {
        setUserLevel(USER_ACCOUNT_UNLOCKED);
    }
    const onLockedAccount = () => {
        setUserLevel(USER_ACCOUNT_LOCKED);
    }
    return (
        <>
            <div>
                { updateCurrentPage() }
            </div>
        </>
    );
};

export default WalletPage;