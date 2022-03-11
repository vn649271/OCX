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
        
        this.itemList = props.items;
        this.onSelectItem = props.onSelectItem ? props.onSelectItem : null;
        this.state = {
            selectedItem: null
        }
        this.onItemClicked = this.onItemClicked.bind(this);
    }

    onItemClicked = ev => {
        let itemIndex = ev.target.nodeName == "LI" ? ev.target.attributes[0].value - 0: ev.target.parentNode.attributes[0].value - 0;
        this.setState({selectedItem: this.itemList[itemIndex]})
        if (this.onSelectItem) {
            this.onSelectItem(itemIndex);
        }
    }

    render() {
        let selectedIcon = this.state.selectedItem ? this.state.selectedItem.iconUrl: "";
        let selectedText = this.state.selectedItem ? this.state.selectedItem.title: "";
        return (
            <Menu as="div" className="relative inline-block text-left">
                <div>                
                    <Menu.Button className="inline-flex justify-center w-full shadow-sm px-4 py-2 bg-white main-font font-18 main-color text-gray-700 hover:bg-gray-50">
                        <img width="24px" src={selectedIcon} alt={selectedText} color="text" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca"></img>
                        <p className="pl-5">{selectedText}</p>
                        <ChevronDownIcon className="-mr-1 ml-5 mt-3 h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                </div>
                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                    {this.itemList.map((value, index) => {
                        return <div key={index} className="py-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <li
                                        data={index}
                                        className={classNames(
                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                            'block px-4 py-2 main-font font-18 main-color cursor-pointer'
                                        )}
                                        onClick={this.onItemClicked}
                                    >
                                        <img width="24px" src={value.iconUrl} alt={value.title} color="text" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca inline-block"></img>
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