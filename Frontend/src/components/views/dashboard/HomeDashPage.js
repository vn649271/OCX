import React, { Component } from 'react';
import DashboardCandleChart from '../../common/dashboard/DashboardCandleChart';
import DashboardPieChart from '../../common/dashboard/DashboardPieChart';
import DashboardProducts from '../../common/dashboard/DashboardProducts';
import DashboardTable from '../../common/dashboard/DashboardTable';

class HomeDashPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            title: props.title,
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="dashboardpage-content p-16 pl-0 w-full">
                {this.state.title}
                <div className='content-top flex w-full'>
                    <div className='candlechart-content w-4/5 mr-12'>
                        <div className='dashboard-card hover-transition w-full dashboard-top-part'>
                            <DashboardCandleChart />
                        </div>
                    </div>
                    <div className='product-list w-1/5'>
                        <div className='dashboard-card hover-transition dashboard-top-part'>
                            <DashboardProducts />
                        </div>
                    </div>
                </div>
                <div className='content-bottom mt-20 flex w-full'>
                    <div className='dashboard-table-content w-3/4 mr-12'>
                        <div className='dashboard-card hover-transition w-full dashboard-table'>
                            <DashboardTable />
                        </div>
                    </div>
                    <div className='content-piechart w-1/4 w-full'>
                        <div className='dashboard-card hover-transition h-full w-full dashboard-pichart'>
                            <DashboardPieChart />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default HomeDashPage;


