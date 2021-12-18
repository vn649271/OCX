import React from "react";

export default class DashboardTable extends React.Component {

    render() {
        return (
            <div id="dashboard-table-content h-full">
                <div class="">
                    <p className="table-title font-16 main-font ">
                        Wallet
                    </p>
                    <div class="border-b border-gray-100 shadow">
                        <table class="w-full dashboard-table">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="font-16 text-gray-500">
                                        ID
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Name
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Email
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Created_at
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Edit
                                    </th>
                                    <th class="font-16 text-gray-500">
                                        Delete
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white">
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-gray-500">
                                        1
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-900">
                                            Jon doe
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-500">jhondoe@example.com</div>
                                    </td>
                                    <td class="font-16  text-gray-500">
                                        2021-1-12
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-white bg-blue-400 rounded">Edit</a>
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-white bg-red-400 rounded">Delete</a>
                                    </td>
                                </tr>
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-gray-500">
                                        1
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-900">
                                            Jon doe
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-500">jhondoe@example.com</div>
                                    </td>
                                    <td class="font-16  text-gray-500">
                                        2021-1-12
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-white bg-blue-400 rounded">Edit</a>
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-white bg-red-400 rounded">Delete</a>
                                    </td>
                                </tr>
                                <tr class="whitespace-nowrap">
                                    <td class="font-16  text-gray-500">
                                        1
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-900">
                                            Jon doe
                                        </div>
                                    </td>
                                    <td class="font-16">
                                        <div class=" text-gray-500">jhondoe@example.com</div>
                                    </td>
                                    <td class="font-16  text-gray-500">
                                        2021-1-12
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-white bg-blue-400 rounded">Edit</a>
                                    </td>
                                    <td class="font-16">
                                        <a href="#" class="px-4 py-1  text-white bg-red-400 rounded">Delete</a>
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

