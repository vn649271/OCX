import React, { Component } from 'react';
import DashboardCandleChart from '../../common/dashboard/DashboardCandleChart';
import DashboardPieChart from '../../common/dashboard/DashboardPieChart';
import DashboardProducts from '../../common/dashboard/DashboardProducts';
import DashboardTable from '../../common/dashboard/DashboardTable';

class HomeDashPage extends Component {

    state = {
        value: '',
        title: null,
    }

    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="dashboardpage-content p-16 w-full">
                <div className='content-top flex w-full'>
                    <div className='candlechart-content w-3/5 mr-20'>
                        <div className='dashboard-card hover-transition w-full bg-green-100'>
                            <DashboardCandleChart />
                        </div>
                    </div>
                    <div className='product-list w-2/5'>
                        <div className='dashboard-card hover-transition bg-pink-100'>
                            <DashboardProducts />
                        </div>
                    </div>
                </div>
                <div className='content-bottom mt-20 flex w-full'>
                    <div className='dashboard-table-content flex-1 mr-20'>
                        <div className='dashboard-card hover-transition w-full bg-gray-100'>
                            <DashboardTable />
                        </div>
                    </div>
                    <div className='dashboard-pichart w-2/8'>
                        <div className='dashboard-card hover-transition w-full bg-yellow-100'>
                            <DashboardPieChart />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default HomeDashPage;


