import { useState, useEffect } from "react";
import OcxSpinner from './OcxSpinner';

const OcxSimpleTable = props => {

    const {colDef = null, tableData = null} = props;

    const [_colDef, setColDef] = useState(colDef);
    const [_tableData, setData] = useState(tableData);

    useEffect(() => {
        setColDef(colDef);
        setData(tableData);
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
                                    _colDef ? _colDef.headers ? _colDef.headers.map((v, i) => {
                                        return <th key={i} className="px-6 py-2 main-color text-left">
                                            {v.title}
                                        </th>
                                    }): null : null
                                }
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                            {
                               (_tableData && _tableData.status != undefined ?
                                    (_tableData.status == 1 ?
                                        _tableData.data.map((r, i) => {
                                            return <tr 
                                                        key={r.id} 
                                                        id={"tr" + r.id} 
                                                        className="whitespace-nowrap">
                                                    {
                                                        r.data.map((c, j) => {
                                                            return <td key={"col-" + j} className="px-6 py-4 main-color">{c.value}</td>
                                                        })
                                                    }
                                                    </tr>
                                            }
                                        )
                                        : (_tableData.status == 2 ? // Waiting status
                                            <tr className="bg-gray-100"><td colSpan="8" style={{textAlign:'center'}}>
                                                <OcxSpinner size='16' />
                                            </td></tr>
                                            : (_tableData.status == 3 ? // No data
                                                <tr className="bg-gray-100"><td colSpan="8" className="pt-5 pb-5" style={{textAlign:'center'}}>
                                                    <span className="main-font font-16 italic">No data</span>
                                                </td></tr>
                                                : null
                                            )
                                        )
                                    : null)
                                : null)
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );        
}

export default OcxSimpleTable;