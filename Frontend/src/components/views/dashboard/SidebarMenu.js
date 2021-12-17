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
        }
        this.setState({ selectedItemId: selectedId });
        this.props.onSelectItem(selectedId);
    }

    render() {
        const { value } = this.state;
        const { title, href } = this.props;

        return (
            <div class="sidebar flex flex-row h-screen bg-white text-gray-800">
                <aside
                    class="dashboard-sidebar md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-main-dark"
                >
                    <div class="sidebar-content pt-40">
                        <ul class="flex flex-col w-full">
                            <SidebarMenuItem id="dashboard-page" title="Dashboard" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="assets-page" title="Assets" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="wallet-page" title="Wallet" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="shop-page" title="Pawn shop" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="payment-page" title="Request payment" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="game-page" title="Game" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="help-page" title="Help" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="chat-page" title="Chat" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="log-page" title="Log" href="#" onClick={this.onClickItem} />
                        </ul>
                    </div>
                </aside>
                <div class="flex flex-col flex-grow -ml-64 md:ml-0 transition-all duration-150 ease-in">
                </div>
            </div>

        );
    }

}

export default SidebarMenu;


