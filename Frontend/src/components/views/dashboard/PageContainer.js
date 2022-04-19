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
        this.setPageTitle = props.setPageTitle;
        this.setSelectedPageTitle = this.setSelectedPageTitle.bind(this);
        this.showToast = this.showToast.bind(this);
        this.hideToast = this.hideToast.bind(this);
        this.toastTimer = null;
    }
    setSelectedPageTitle(_title) {
        if (this.setPageTitle) {
            this.setPageTitle(_title);
        }
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
        if (typeof(_text) != 'string') {
            if (typeof(_text) == 'object') {
                _text = _text.toString();
            }
        }
        this.setState({show_toast: true});
        this.setState({toast_type: _type});
        this.setState({toast_text: _text});
        this.toastTimer = setTimeout(this.hideToast, 10000);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
            switch (this.props.target) {
                case 'dashboard-page':
                    this.setSelectedPageTitle('Dashboard');
                    this.setState({ currentPageComponent: <HomeDashPage showToast={this.showToast} /> });
                    break;
                case 'assets-page':
                    this.setSelectedPageTitle('Assets');
                    this.setState({ currentPageComponent: <AssetsPage showToast={this.showToast} /> });
                    break;
                case 'wallet-page':
                    this.setSelectedPageTitle('Wallet');
                    this.setState({ currentPageComponent: <WalletPage showToast={this.showToast} /> });
                    break;
                case 'log-page':
                    this.setSelectedPageTitle('Log');
                    this.setState({ currentPageComponent: <LogPage showToast={this.showToast} /> });
                    break;
                case 'game-page':
                    this.setSelectedPageTitle('Game');
                    this.setState({ currentPageComponent: <GamePage showToast={this.showToast} /> });
                    break;
                case 'chat-page':
                    this.setSelectedPageTitle('Chat');
                    this.setState({ currentPageComponent: <ChatPage showToast={this.showToast} /> });
                    break;
                case 'help-page':
                    this.setSelectedPageTitle('Help');
                    this.setState({ currentPageComponent: <HelpPage /> });
                    break;
                case 'payment-page':
                    this.setSelectedPageTitle('Payment');
                    this.setState({ currentPageComponent: <PaymentPage showToast={this.showToast} /> });
                    break;
                case 'shop-page':
                    this.setSelectedPageTitle('Pawn Shop');
                    this.setState({ currentPageComponent: <PawnShopPage showToast={this.showToast} /> });
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        return (
            <div className="bg-global main-content-container w-full ml-2 pl-10 pt-32">
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


