import { useEffect, useState } from "react";
import WalletIntroPage from './walletpage/WalletIntroPage';
import PasscodeConfirmPage from './walletpage/PasscodeConfirmPage';

const WalletPage = (props) => {

    const {} = props;

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(null);

    useEffect(() => {
        // Update the document title using the browser API
        updateCurrentPage(currentPageIndex);
    });

    const updateCurrentPage = () => {
        switch (currentPageIndex) {
        case 0:
            setCurrentPage(<WalletIntroPage onActivateWallet={onActivateWallet} />);
            break;
        case 1: 
            setCurrentPage(<PasscodeConfirmPage />);
            break;
        default:
            break;
        }
    }

    const onActivateWallet = () => {
        setCurrentPageIndex(1);
    }

    return (
        <>{ currentPage }</>
    );
};

export default WalletPage;