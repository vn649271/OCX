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
import PawnShopPage from './PawnShopPage';
import Toast from '../../common/Toast';

class PageContainer extends Component {

    
    constructor(props) {
        super(props);

        this.state = {
            title: null,
            currentPageComponent: null,
            show_toast: false,
            toast_type: 0,
            toast_text: '',
        }
        this.showToast = this.showToast.bind(this);
        this.hideToast = this.hideToast.bind(this);
        this.toastTimer = null;
    }

    hideToast() {
        if (this.toastTimer) {
            this.setState({toast_type: -1});
            this.setState({toast_text: ''});
            this.setState({show_toast: false});
            this.toastTimer = null;
        }
    }

    showToast(_type, _text) {
        this.setState({show_toast: true});
        this.setState({toast_type: _type});
        this.setState({toast_text: _text});
        this.toastTimer = setTimeout(this.hideToast, 10000);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
            switch (this.props.target) {
                case 'dashboard-page':
                    this.setState({ currentPageComponent: <HomeDashPage showToast={this.showToast} /> });
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
                    this.setState({ currentPageComponent: <PawnShopPage showToast={this.showToast} /> });
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        return (
            <div className="main-content-container w-full pl-10 pt-10">
                {
                    this.state.show_toast?
                        <Toast text={this.state.toast_text} type={this.state.toast_type}/> 
                        : <></>
                }
                {this.state.currentPageComponent}
            </div>
        );
    }
}

export default PageContainer;


