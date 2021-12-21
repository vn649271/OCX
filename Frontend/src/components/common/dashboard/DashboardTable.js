import React from "react";

export default class DashboardTable extends React.Component {

    render() {
        return (
            <div id="dashboard-table-content h-full dashboard-table">
                <div class="">
                    <p className="table-title font-16 text-white main-font main-bold mb-5">
                        Assets
                    </p>
                    <div class="rounded-lg dashboard-table-main ">
                        <table class=" rounded-lg dashboard-table-body main-font">
                            <thead class="rounded-lg">
                                <tr>
                                    <th class="font-16 text-white">
                                        Transaction Hash
                                    </th>
                                    <th class="font-16 text-white">
                                        Contract
                                    </th>
                                    <th class="font-16 text-white">
                                        Action (In / Out/ Swap/ Purchase)
                                    </th>
                                    <th class="font-16 text-white">
                                        Size
                                    </th>
                                    <th class="font-16 text-white">
                                        Price
                                    </th>
                                    <th class="font-16 text-white">
                                        Date time
                                    </th>
                                    <th class="font-16 text-white">
                                        P/L
                                    </th>
                                </tr>
                            </thead>
                            <tbody class=" main-font">
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-white">
                                        1
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-white">
                                            Jon doe
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-white">jhondoe@example.com</div>
                                    </td>
                                    <td class="font-16  text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16 text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16 text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-red-500 bg-red-200 rounded-lg">Paid</a>
                                    </td>
                                </tr>
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-white">
                                        1
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-white">
                                            Jon doe
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-white">jhondoe@example.com</div>
                                    </td>
                                    <td class="font-16  text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16 text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16 text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-blue-500 bg-blue-200 rounded-lg">Pendding</a>
                                    </td>
                                </tr>
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-white">
                                        1
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-white">
                                            Jon doe
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-white">jhondoe@example.com</div>
                                    </td>
                                    <td class="font-16  text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16 text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16 text-white">
                                        2021-1-12
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-green-500 bg-green-200 rounded-lg">Decline</a>
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

