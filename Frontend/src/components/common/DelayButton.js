import React, { Component } from 'react';

var me;

class DelayButton extends Component {


    constructor(props) {
        super(props);
        me = this;

        this.captionOnLoad = props.captionOnLoad;
        this.caption = props.caption;
        this.maxLoadingInterval = props.maxLoadingInterval;
        this.onClickButton = props.onClickButton;
        this.onClickButtonParam = props.onClickButtonParam;

        this.state = {
            value: '',
            is_loading: false,
            loading_interval: this.maxLoadingInterval
        }

        this.onLoad = this.onLoad.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
    }

    stopTimer() {
        this.setState({ is_loading: false });
        this.setState({ loading_interval: this.maxLoadingInterval });
        clearTimeout(this.loadTimer);
    }

    onLoad = (ev) => {
        if (this.state.is_loading && this.state.loading_interval > 0) {
            return;
        }

        this.setState({ is_loading: true });

        /* Start counting for loading data */
        this.loadTimer = setInterval(
            function () {
                let loadingInterval = me.state.loading_interval;
                loadingInterval--;
                if (loadingInterval <= 0) {
                    me.stopTimer();
                } else {
                    me.setState({ loading_interval: loadingInterval });
                }
            },
            1000
        );
        this.onClickButton(this.onClickButtonParam, ev, this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <button
                className="spinner-button border border-grey-light button-bg p-5 hover-transition font-16 main-font focus:outline-none rounded text-white verify-button"
                onClick={this.onLoad}
                disabled={this.state.is_loading}>
                {this.state.is_loading && (
                    <i
                        className="fa od-spinner"
                        style={{ marginRight: "15px" }}
                    >( )</i>
                )}
                {this.state.is_loading && <span>{this.captionOnLoad}({this.state.loading_interval})</span>}
                {!this.state.is_loading && <span>{this.caption}</span>}
            </button>
        );
    }

}

export default DelayButton;