import React from "react";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Assets" {...a11yProps(0)} />
                    <Tab label="Transaction" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <div className="rounded-lg dashboard-table-main ">
                    <table className=" rounded-lg dashboard-table-body main-font">
                        <thead className="rounded-lg">
                            <tr>
                                <th className="font-16 text-white">
                                    Transaction Hash
                                </th>
                                <th className="font-16 text-white">
                                    Contract
                                </th>
                                <th className="font-16 text-white">
                                    Action (In / Out/ Swap/ Purchase)
                                </th>
                                <th className="font-16 text-white">
                                    Size
                                </th>
                                <th className="font-16 text-white">
                                    Price
                                </th>
                                <th className="font-16 text-white">
                                    Date time
                                </th>
                                <th className="font-16 text-white">
                                    P/L
                                </th>
                            </tr>
                        </thead>
                        <tbody className=" main-font">
                            <tr className="whitespace-nowrap">
                                <td className="font-16  text-white">
                                    123134561134461
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">
                                        zsdfaetqeradsfq34r5
                                    </div>
                                </td>
                                <td className="font-16">
                                    <a href="#" className="px-4 py-1  text-blue-500 bg-blue-200 rounded-lg">Swap</a>
                                </td>
                                <td className="font-16  text-white">
                                    12
                                </td>
                                <td className="font-16 text-white">
                                    342523
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16">
                                    <a href="#" className="px-4 py-1  text-red-500 bg-red-200 rounded-lg">Paid</a>
                                </td>
                            </tr>
                            <tr className="whitespace-nowrap">
                                <td className="font-16  text-white">
                                    123134561134461
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">
                                        zsdfaetqeradsfq34r5
                                    </div>
                                </td>
                                <td className="font-16">
                                    <a href="#" className="px-4 py-1  text-blue-500 bg-blue-200 rounded-lg">Swap</a>
                                </td>
                                <td className="font-16  text-white">
                                    12
                                </td>
                                <td className="font-16 text-white">
                                    342523
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16">
                                    <a href="#" className="px-4 py-1  text-blue-500 bg-blue-200 rounded-lg">Pendding</a>
                                </td>
                            </tr>
                            <tr className="whitespace-nowrap">
                                <td className="font-16  text-white">
                                    123134561134461
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">
                                        zsdfaetqeradsfq34r5
                                    </div>
                                </td>
                                <td className="font-16">
                                    <a href="#" className="px-4 py-1  text-green-500 bg-green-200 rounded-lg">Pendding</a>
                                </td>
                                <td className="font-16  text-white">
                                    12
                                </td>
                                <td className="font-16 text-white">
                                    342523
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16">
                                    <a href="#" className="px-4 py-1  text-green-500 bg-green-200 rounded-lg">Decline</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TabPanel>
            <TabPanel value={value} index={1}>

                <div className="rounded-lg dashboard-table-main ">
                    <table className=" rounded-lg dashboard-table-body main-font">
                        <thead className="rounded-lg">
                            <tr>
                                <th className="font-16 text-white">
                                    Transaction Hash
                                </th>
                                <th className="font-16 text-white">
                                    Method
                                </th>
                                <th className="font-16 text-white">
                                    Action (In / Out/ Swap/ Purchase)
                                </th>
                                <th className="font-16 text-white">
                                    Block
                                </th>
                                <th className="font-16 text-white">
                                    Dattime
                                </th>
                                <th className="font-16 text-white">
                                    From
                                </th>
                                <th className="font-16 text-white">
                                    To
                                </th>
                                <th className="font-16 text-white">
                                    Value
                                </th>
                                <th className="font-16 text-white">
                                    Gas Fee
                                </th>
                                <th className="font-16 text-white">
                                    Product List
                                </th>
                            </tr>
                        </thead>
                        <tbody className=" main-font">
                            <tr className="whitespace-nowrap">
                                <td className="font-16  text-white">
                                    1
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">
                                        Jon doe
                                    </div>
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">jhondoe@example.com</div>
                                </td>
                                <td className="font-16  text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                            </tr>
                            <tr className="whitespace-nowrap">
                                <td className="font-16  text-white">
                                    1
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">
                                        Jon doe
                                    </div>
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">jhondoe@example.com</div>
                                </td>
                                <td className="font-16  text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                            </tr>
                            <tr className="whitespace-nowrap">
                                <td className="font-16  text-white">
                                    1
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">
                                        Jon doe
                                    </div>
                                </td>
                                <td className="font-16">
                                    <div className=" text-white">jhondoe@example.com</div>
                                </td>
                                <td className="font-16  text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                                <td className="font-16 text-white">
                                    2021-1-12
                                </td>
                            </tr>
                            
                        </tbody>
                    </table>
                </div>
            </TabPanel>
        </Box>
    );
}
