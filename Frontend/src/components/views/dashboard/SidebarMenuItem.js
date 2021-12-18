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
        const { title, icons, href } = this.props;

        return (
            <li id={this.props.id} className="my-px block sidebar-menu-item-container" onClick={this.onSelect} >
                <a
                    href={href}
                    className="flex flex-row items-center px-10 py-14 sidebar-items-rounded"
                >
                    <span className="flex items-center justify-center font-20 mr-2 text-white">
                        <i className={icons} aria-hidden="true"></i>
                    </span>
                    <span className="ml-3 main-font font-14 text-white">{title}</span>
                </a>
            </li>
        );
    }

}

export default SidebarMenuItem;
