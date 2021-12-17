import React, { Component } from 'react';
import {
  chartInit,
  chartDraw,
  chartDefaultConfig,
  chartThemes
} from "@talkrz/price-chart";

document.getElementById("candlechart").innerHTML = `
  <div id="ChartContent" class="candleChart-content">
    <canvas id="ChartCanvasContent" class="candleChart-canvas">
    </canvas>
    <canvas id="ChartCanvasScale" class="candleChart-canvas-scale">
    </canvas>
  </div>
`;

// fetch test data, then draw the chart
const dataUrl = "https://talkrz.github.io/price-chart-demo/exampleData.json";
fetch(dataUrl)
  .then(response => response.json())
  .then(drawChart);

function drawChart(data) {
  // create HTML elements references
  const content = document.getElementById("ChartContent");
  const base = document.getElementById("ChartCanvasContent");
  const scale = document.getElementById("ChartCanvasScale");

  // set chart dimensions
  const width = content.offsetWidth;
  const height = content.offsetHeight;

  // define drawing layers, minimum 2 layers are required
  // one for drawing price and volume
  // and other for scale
  const layers = {
    base: base,
    scale: scale
  };

  // modify the config objects if you need
  const config = chartDefaultConfig();
  const themeConfig = chartThemes()["light"];

  // prepare chart view
  chartInit(data, layers, {
    width,
    height,
    zoom: 8,
    offset: 0,
    config,
    theme: themeConfig
  });

  // draw chart
  chartDraw();
}

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
            <div className="my-profile-page">
                <div className='' id='candlechart'>

                </div>
            </div>
        );
    }

}

export default HomeDashPage;


