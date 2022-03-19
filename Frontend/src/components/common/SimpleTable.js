import { Component } from "react";


export default class SimpleTable extends Component {

    state = {
        def: null,
        data: null
    };

    constructor(props) {
        super(props);
        this.setState({def: this.props.def});
        this.setState({data: this.props.data});
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
        if (prevProps.def !== this.props.def) {
            this.setState({def: this.props.def});
        }
        if (prevProps.data !== this.props.data) {
            this.setState({data: this.props.data});
        }
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
                                        this.state.def ? this.state.def.headers ? this.state.def.headers.map((v, i) => {
                                            return <th className="px-6 py-2 text-gray-500 text-left">
                                                {v.title}
                                            </th>
                                        }): null : null
                                    }
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                {
                                    this.state.data ? this.state.data.map((r, i) => {
                                        return <tr id={"tr" + r.id} className="whitespace-nowrap">
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