import React from "react";
import ReactApexChart from 'react-apexcharts'

export default class DashboardPieChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            series: [15, 85],
            options: {
                chart: {
                    width: 380,
                    type: 'donut',
                    foreColor: '#ffffff',
                    fontFamily: 'Qualy-Light'
                },
                plotOptions: {
                    pie: {
                        startAngle: 270,
                        endAngle: -90
                    }
                },
                dataLabels: {
                    enabled: true
                },
                fill: {
                    type: 'gradient',
                },
                legend: {
                    formatter: function (val, opts) {
                        return val + " - " + opts.w.globals.series[opts.seriesIndex]
                    }
                },
                title: {
                    text: 'Proffit/Lost'
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            },
        };
    }
    render() {
        return (
            <div id="chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="donut" width={380} />
            </div>
        );
    }
}

