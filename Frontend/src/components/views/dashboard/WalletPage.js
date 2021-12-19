import React, { Component } from 'react';
class WalletPage extends Component {

    render() {
        return (
            <div className="wallet-page pr-20 pt-20">
                <div className='dashboard-card'>
                    <div className='select-crypto'>
                        <div className='select-crypto-header'>
                            <div className='button-group flex justify-end'>
                                <div className='hover-transition cursor-pointer add-crypto-button main-font text-blue-400 font-20 py-3 px-10 mr-5 dashboard-top-part product-card'>Add</div>
                                <div className='hover-transition cursor-pointer delete-crypto-button main-font text-red-400 font-20 py-3 px-10 dashboard-table product-card'>Delete</div>
                            </div>
                        </div>
                        <table class="w-full rounded-lg dashboard-table main-font mt-10">
                            <thead class="bg-gray-50 rounded-lg">
                                <tr>
                                    <th class="font-16 text-gray-500">
                                        Coin Name
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Balance
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Price
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Sent
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Received
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Daily Graph
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white main-font">
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-gray-500 cursor-pointer">
                                        Bitcoin
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-900">
                                            109
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-500">45768</div>
                                    </td>
                                    <td class="font-16  text-gray-500">
                                        54
                                    </td>
                                    <td class="font-16 text-gray-500">
                                        64
                                    </td>
                                    <td class="font-16 text-gray-500">
                                        ----------
                                    </td>

                                </tr>
                                <tr class="whitespace-nowrap cursor-pointer">
                                    <td class="font-16  text-gray-500">
                                        Ethereum
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-900">
                                            109
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-500">45768</div>
                                    </td>
                                    <td class="font-16  text-gray-500">
                                        54
                                    </td>
                                    <td class="font-16 text-gray-500">
                                        64
                                    </td>
                                    <td class="font-16 text-gray-500">
                                        ----------
                                    </td>

                                </tr>
                                <tr class="whitespace-nowrap cursor-pointer">
                                    <td class="font-16  text-gray-500">
                                        Stable Cion
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-900">
                                            109
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-500">45768</div>
                                    </td>
                                    <td class="font-16  text-gray-500">
                                        54
                                    </td>
                                    <td class="font-16 text-gray-500">
                                        64
                                    </td>
                                    <td class="font-16 text-gray-500">
                                        ----------
                                    </td>

                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

}

export default WalletPage;


