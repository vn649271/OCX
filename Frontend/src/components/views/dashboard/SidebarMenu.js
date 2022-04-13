import React, { Component } from 'react';
import SidebarMenuItem from "./SidebarMenuItem";

class SidebarMenu extends Component {


    constructor(props) {
        super(props);

        this.state = {
            value: '',
            selectedItemId: null
        }
        this.onClickItem = this.onClickItem.bind(this);
    }

    onClickItem = selectedId => {
        if (this.state.selectedItemId !== null) {
            let oldSelectedItem = document.getElementById(this.state.selectedItemId);
            oldSelectedItem.children[0].classList.remove('active');
            oldSelectedItem.children[1].classList.add('hidden');
        }
        this.setState({ selectedItemId: selectedId });
        this.props.onSelectItem(selectedId);
    }

    render() {

        return (
            <div className="sidebar flex flex-row bg-global main-color border-none">
                <aside
                    className="dashboard-sidebar md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in dashboard-table"
                >
                    <div className="sidebar-content py-40 md:py-28">
                        <ul className="flex flex-col w-full">
                            <SidebarMenuItem icons="fa fa-tachometer" className="active" id="dashboard-page" title="Dashboard" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-btc" id="assets-page" title="Assets" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-google-wallet" id="wallet-page" title="Wallet" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-shopping-cart" id="shop-page" title="Pawn shop" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-money" id="payment-page" title="Payment" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-gamepad" id="game-page" title="Game" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-star" id="help-page" title="Help" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-weixin" id="chat-page" title="Chat" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-sticky-note" id="log-page" title="Log" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem icons="fa fa-sign-out" id="logout-btn" title="Logout" href="#" />
                        </ul>
                    </div>
                </aside>
            </div>

        );
    }

}

export default SidebarMenu;


