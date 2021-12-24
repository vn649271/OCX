import React, { Component } from 'react';
import AssetsPage from './AssetsPage';
import WalletPage from './WalletPage';
import LogPage from './LogPage';
// import MyProfilePage from './MyProfilePage';
import ChatPage from './ChatPage';
import HomeDashPage from './HomeDashPage';
import GamePage from './GamePage';
import HelpPage from './HelpPage';
import PaymentPage from './PaymentPage';
import ShopPage from './ShopPage';

class PageContainer extends Component {

    
    constructor(props) {
        super(props);
        this.state = {
            title: null,
            currentPageComponent: null
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
            switch (this.props.target) {
                case 'dashboard-page':
                    this.setState({ currentPageComponent: <HomeDashPage /> });
                    break;
                case 'assets-page':
                    this.setState({ currentPageComponent: <AssetsPage /> });
                    break;
                case 'wallet-page':
                    this.setState({ currentPageComponent: <WalletPage /> });
                    break;
                case 'log-page':
                    this.setState({ currentPageComponent: <LogPage /> });
                    break;
                case 'game-page':
                    this.setState({ currentPageComponent: <GamePage /> });
                    break;
                case 'chat-page':
                    this.setState({ currentPageComponent: <ChatPage /> });
                    break;
                case 'help-page':
                    this.setState({ currentPageComponent: <HelpPage /> });
                    break;
                case 'payment-page':
                    this.setState({ currentPageComponent: <PaymentPage /> });
                    break;
                case 'shop-page':
                    this.setState({ currentPageComponent: <ShopPage /> });
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        return (
            <div className="main-content-container w-full pl-10 pt-10">
                {this.state.currentPageComponent}
            </div>
        );
    }
}

export default PageContainer;


