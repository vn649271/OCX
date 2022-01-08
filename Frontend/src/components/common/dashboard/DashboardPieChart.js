import React from "react";
import ReactApexChart from 'react-apexcharts'

export default class DashboardPieChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

            series: [15, 85],
            options: {
                chart: {
                    width: 300,
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
                    position: 'bottom',
                    horizontalAlign: 'center',
                    formatter: function (val, opts) {
                        return val + " - " + opts.w.globals.series[opts.seriesIndex]
                    }
                },

                responsive: [{
                    breakpoint: 1441,
                    options: {
                        chart: {
                            width: 300
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }, {
                    breakpoint: 769,
                    options: {
                        chart: {
                            width: 400
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                },
                {
                    breakpoint: 415,
                    options: {
                        chart: {
                            width: 350
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
            <div className="chart-body relative">
                <div className="table-title font-16 text-white main-bold">
                    Dount Chart
                </div>
                <div id="piechart">
                    <ReactApexChart options={this.state.options} series={this.state.series} type="donut" width={380} />
                </div>
            </div>
        );
    }
}

