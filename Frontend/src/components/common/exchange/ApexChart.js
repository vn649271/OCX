// import ApexCharts from 'apexcharts'

// class ApexChart extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             series: [{
//                 name: "STOCK ABC",
//                 data: series.monthDataSeries1.prices
//             }],
//             options: {
//                 chart: {
//                     type: 'area',
//                     height: 350,
//                     zoom: {
//                         enabled: false
//                     }
//                 },
//                 dataLabels: {
//                     enabled: false
//                 },
//                 stroke: {
//                     curve: 'straight'
//                 },
//                 title: {
//                     text: 'Fundamental Analysis of Stocks',
//                     align: 'left'
//                 },
//                 subtitle: {
//                     text: 'Price Movements',
//                     align: 'left'
//                 },
//                 labels: series.monthDataSeries1.dates,
//                 xaxis: {
//                     type: 'datetime',
//                 },
//                 yaxis: {
//                     opposite: true
//                 },
//                 legend: {
//                     horizontalAlign: 'left'
//                 }
//             },
//         };
//     }
//     render() {
//         return (
//             <div id="chart">
//                 <ReactApexChart options={this.state.options} series={this.state.series} type="area" height={350} />
//             </div>
//         );
//     }
// }

// const domContainer = document.querySelector('#app');
// ReactDOM.render(React.createElement(ApexChart), domContainer);
