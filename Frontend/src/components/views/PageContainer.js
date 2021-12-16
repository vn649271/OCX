import React, { Component } from 'react';
import MyAssetsPage from './MyAssetsPage';
import MyWalletPage from './MyWalletPage';
import LogPage from './LogPage';
import MyProfilePage from './MyProfilePage';
import ChatPage from './ChatPage';

class PageContainer extends Component {

    state = {
        value: '',
        title: null,
        currentPageComponent: null
    }

    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
            switch (this.props.target) {
                case 'assets-page':
                    this.setState({ currentPageComponent: <MyAssetsPage /> });
                    break;
                case 'wallet-page':
                    this.setState({ currentPageComponent: <MyWalletPage /> });
                    break;
                case 'log-page':
                    this.setState({ currentPageComponent: <LogPage /> });
                    break;
                case 'profile-page':
                    this.setState({ currentPageComponent: <MyProfilePage /> });
                    break;
                case 'chat-page':
                    this.setState({ currentPageComponent: <ChatPage /> });
                    break;
                default:
                    break;
            }
        }
    }

    render() {
        return (
            <div className="main-content-container">
                {this.state.currentPageComponent}
            </div>
        );
    }
}

export default PageContainer;


