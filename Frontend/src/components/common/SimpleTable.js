import { useState, useEffect } from "react";
import OcxSpinner from './OcxSpinner';

const TableTrs = (props) => {

}

const SimpleTable = props => {

    const {colDef = null, tableData = null} = props;

    // const [_colDef, setColDef] = useState(colDef);
    const [_data, setData] = useState(tableData);
    const [trs, setTRs] = useState([]);

    useEffect(() => {
        setData(tableData);
        var _trs = [];
        return null;
    });

    return (
        <div className="container main-font font-16 w-full mx-auto">
            <div className="flex">
                <div className="w-full">
                    <div className="border-b border-gray-200 shadow">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                {
                                    colDef ? colDef.headers ? colDef.headers.map((v, i) => {
                                        return <th key={i} className="px-6 py-2 main-color text-left">
                                            {v.title}
                                        </th>
                                    }): null : null
                                }
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                           {
                               (_data && _data.status != undefined ?
                                    (_data.status == 1 ?
                                        _data.data.map((r, i) => {
                                            return (<tr 
                                                        key={r.id} 
                                                        id={"tr" + r.id} 
                                                        className="whitespace-nowrap"
                                                    >{
                                                        r.data.map((c, j) => {
                                                            return <td key={"col-" + j} className="px-6 py-4 main-color">{c.value}</td>
                                                        })
                                                    }</tr>)
                                        })
                                    : _data.status == 2 ? // Waiting status
                                        
                                            <tr>
                                                <td colSpan="8" style={{textAlign:'center'}}>
                                                    <OcxSpinner size='16' />
                                                </td>
                                            </tr>
                                        
                                        : null
                                    )
                                : null
                                )
                                
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );        
}

export default SimpleTable;