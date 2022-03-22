import { Component } from "react";


export default class SimpleTable extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="container main-font font-16 w-full mx-auto">
                <div className="flex">
                    <div className="w-full">
                        <div className="border-b border-gray-200 shadow">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                    {
                                        this.props.def ? this.props.def.headers ? this.props.def.headers.map((v, i) => {
                                            return <th key={i} className="px-6 py-2 text-gray-500 text-left">
                                                {v.title}
                                            </th>
                                        }): null : null
                                    }
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                {
                                    this.props.data ? this.props.data.map((r, i) => {
                                        return <tr key={r.id} id={"tr" + r.id} className="whitespace-nowrap">
                                            {
                                                r.data.map((c, j) => {
                                                    return <td className="px-6 py-4 text-gray-500">{c.value}</td>
                                                })
                                            }
                                        </tr>
                                    }): null
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );        
    }
}