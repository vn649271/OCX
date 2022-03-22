import { Component } from "react";


export default class SimpleTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: props.data
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log("SimpleTable.componentWillReceiveProps(): ", nextProps);
        this.setState({data: nextProps.data});
    }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.data != this.props.data) {
    //         this.setState({data: this.props.data});
    //     }
    // }

    render() {
        var trs = [];
        if (this.state.data) {
            for (let r in this.state.data) {
                let rowData = this.state.data[r];
                let cols = [];
                for(let c in rowData.data) {
                    let colData = rowData.data[c];
                    cols.push(<td key={"col-" + c} className="px-6 py-4 text-gray-500">{colData.value}</td>);
                }
                trs.push(<tr 
                            key={rowData.id} 
                            id={"tr" + rowData.id} 
                            className="whitespace-nowrap"
                        >{cols}</tr>)
            }            
        }
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
                                    {trs}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );        
    }
}