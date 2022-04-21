import { useState } from "react";
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


const OcxDropdownControlList = (props) => {

    const { onSelectItem = null, children } = props;
    const [selectedItem, setSelectedItem] = useState(children[0]);

    const onItemClicked = ev => {
        let itemIndex = ev.target.nodeName == "LI" ? ev.target.attributes[0].value - 0: ev.target.parentNode.attributes[0].value - 0;
console.log(itemIndex); return;
        // this.setState({selectedItem: children[itemIndex]})
        // if (this.onSelectItem) {
        //     this.onSelectItem(itemIndex);
        // }
    }

    return (
        <Menu as="div" className="relative inline-block text-left mt-3">
            <div>                
                <Menu.Button className="justify-center w-full shadow-sm pr-2 bg-white main-font font-16 main-color hover:bg-gray-50">
                    <div className="inline-flex" onClick={onItemClicked}>{selectedItem}</div>
                    <ChevronDownIcon className="inline-flex -mr-1 ml-5 h-5 w-5" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Menu.Items className="origin-top-right z-10 absolute mt-2 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                {children.map((child, index) => {
                    return <div key={index} className="">
                        <Menu.Item>
                            {({ active }) => (
                                <li
                                    data={index}
                                    className={classNames(
                                        active ? 'bg-gray-100 main-color' : 'text-lightgray-color',
                                        'block main-font font-18 main-color cursor-pointer'
                                    )}
                                    
                                >
                                    {
                                        child
                                    }
                                </li>
                            )}
                        </Menu.Item>
                    </div>
                })}
            </Menu.Items>
        </Menu>
    )
}

export default OcxDropdownControlList;
