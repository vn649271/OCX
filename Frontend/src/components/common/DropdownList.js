/* This example requires Tailwind CSS v2.0+ */
import React, { Component } from 'react';
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default class DropdownList extends Component {

    constructor(props) {
        super(props);
        
        this.onSelectItem = props.onSelectItem ? props.onSelectItem : null;
        this.state = {
            itemList: props.items,
            selectedItem: null
        }
        this.onItemClicked = this.onItemClicked.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
        if (prevProps.items != this.props.items) {
            this.setState({itemList: this.props.items});
        }
    }

    onItemClicked = ev => {
        let itemIndex = ev.target.nodeName == "LI" ? ev.target.attributes[0].value - 0: ev.target.parentNode.attributes[0].value - 0;
        this.setState({selectedItem: this.state.itemList[itemIndex]})
        if (this.onSelectItem) {
            this.onSelectItem(itemIndex);
        }
    }

    render() {
        let selectedIcon = 
            this.state.selectedItem ? 
                this.state.selectedItem.iconUrl ? 
                    <img 
                        width="24px" 
                        src={this.state.selectedItem.iconUrl} 
                        color="text" 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="inline-block sc-bdnxRM kDWlca"
                    ></img>
                : ""
            : "";
        let selectedText = this.state.selectedItem ? this.state.selectedItem.title: "";
        if (selectedText == "" && this.props.placeholder && this.props.placeholder !== "") {
            selectedText = this.props.placeholder;
        }
        return (
            <Menu as="div" className="relative inline-block text-left mt-3">
                <div>                
                    <Menu.Button className="justify-center w-full shadow-sm px-4 py-2 bg-white main-font font-16 main-color hover:bg-gray-50">
                        {selectedIcon}
                        <p className="inline-flex pl-5 main-font main-color" text-align="right">{selectedText}</p>
                        <ChevronDownIcon className="inline-flex -mr-1 ml-5 h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                </div>
                <Menu.Items className="origin-top-right z-10 absolute mt-2 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                    {this.state.itemList.map((value, index) => {
                        return <div key={index} className="py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <li
                                        data={index}
                                        className={classNames(
                                            active ? 'bg-gray-100 main-color' : 'text-lightgray-color',
                                            'block px-4 py-2 main-font font-18 main-color cursor-pointer'
                                        )}
                                        onClick={this.onItemClicked}
                                    >
                                        {
                                            value.iconUrl?
                                                <img width="24px" src={value.iconUrl} alt={value.title} color="text" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca inline-block"></img>
                                            : ""
                                        }
                                        <p className="inline-block pl-5">{value.title}</p>
                                    </li>
                                )}
                            </Menu.Item>
                        </div>
                    })}
                </Menu.Items>
            </Menu>
        )
    }
}