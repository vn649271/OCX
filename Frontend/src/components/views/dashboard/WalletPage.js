import { useEffect, useState } from "react";
import WalletIntroPage from './walletpage/WalletIntroPage';
import WalletActivatePage from './walletpage/WalletActivatePage';
import PasscodeConfirmPage from './walletpage/PasscodeConfirmPage';
import AccountService from '../../../service/Account';
import OcxPageSpinLock from '../../common/OcxPageSpinLock';

const UNKNOWN_USER = -1;
const NEW_USER_0 = 0;
const NEW_USER_1 = 1;
const USER_WITH_ACCOUNT = 2;


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
                setUserLevel(USER_WITH_ACCOUNT);
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
            return <OcxPageSpinLock show={true} />;
        case NEW_USER_0:
            return <WalletIntroPage onActivateWallet={onActivateWallet} />;
        case NEW_USER_1:
            return <WalletActivatePage />;
        case USER_WITH_ACCOUNT: 
            return <PasscodeConfirmPage />;
        default:
            return null;
        }
    }

    const onActivateWallet = () => {
        setUserLevel(NEW_USER_1);
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