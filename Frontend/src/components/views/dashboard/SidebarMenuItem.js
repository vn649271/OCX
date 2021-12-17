import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

class SidebarMenuItem extends Component {

    constructor(props) {
        super(props);
        
        this.state = {
            value: '',
        }
        this.onSelect = this.onSelect.bind(this);
    }

    onSelect = ev => {
        ev.target.classList.add('active');
        this.props.onClick(this.props.id);
    }

    render() {
        const { value } = this.state;
        const { title, href } = this.props;

        return (
            <li id={this.props.id} className="my-px block sidebar-menu-item-container" onClick={this.onSelect} >
                <a
                    href={href}
                    className="flex flex-row items-center px-10 py-6 sidebar-items-rounded"
                >
                    <span className="flex items-center justify-center text-white">
                        <svg
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-10 w-10"
                        >
                            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </span>
                    <span className="ml-3 main-font font-20 text-white">{title}</span>
                </a>
            </li>
        );
    }

}

export default SidebarMenuItem;
