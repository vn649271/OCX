import React, { Component } from 'react';
import SidebarMenuItem from "./SidebarMenuItem";

class SidebarMenu extends Component {

    state = {
        value: '',
        selectedItemId: null
    }

    constructor (props) {
        super(props);

        this.onClickItem = this.onClickItem.bind(this);
    }

    onClickItem = ev => {
        let activedItems = document.getElementsByClassName('sidebar-items-rounded active');
        if (activedItems.length > 0) {
            activedItems[0].classList.remove('active');
        }
    }

    render() {
        const { value } = this.state;
        const { title, href } = this.props;

        return (
            <div class="flex flex-row h-screen bg-white text-gray-800">
                <aside
                    class="dashboard-sidebar md:shadow transform -translate-x-full md:translate-x-0 transition-transform duration-150 ease-in bg-main-dark"
                >
                    <div class="sidebar-content pt-40">
                        <ul class="flex flex-col w-full">
                            <SidebarMenuItem id="assets" title="Assets" href="#" onClick={this.onClickItem} />
                            <SidebarMenuItem id="Wallet" title="Wallet" href="#"  onClick={this.onClickItem} />
                            <SidebarMenuItem id="Log" title="Log" href="#"  onClick={this.onClickItem} />
                            <SidebarMenuItem id="Profile" title="Profile" href="#"  onClick={this.onClickItem} />
                            <SidebarMenuItem id="Chat" title="Chat" href="#"  onClick={this.onClickItem} />
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


