import React, { Component } from 'react';

var me;

class DelayButton extends Component {

    constructor(props) {
        super(props);
        me = this;

        this.captionInDelay = props.captionInDelay;
        this.caption = props.caption;
        this.maxDelayInterval = props.maxDelayInterval;
        this.onClickButton = props.onClickButton;
        this.onClickButtonParam = props.onClickButtonParam;

        this.state = {
            value: '',
            in_delay: false,
            delay_interval: this.maxDelayInterval
        }

        this.onClicked = this.onClicked.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
    }

    stopTimer() {
        this.setState({ in_delay: false });
        this.setState({ delay_interval: this.maxDelayInterval });
        clearTimeout(this.delayTimer);
    }

    onClicked = (ev) => {
        if (this.state.in_delay && this.state.delay_interval > 0) {
            return;
        }
        if (ev.target.nodeName == "SPAN") {
            ev.target = ev.target.parentNode;
        }

        this.setState({ in_delay: true });

        /* Start counting for loading data */
        this.delayTimer = setTimeout(
            function () {
                let delayInterval = me.state.delay_interval;
                delayInterval--;
                if (delayInterval <= 0) {
                    me.stopTimer();
                } else {
                    me.setState({ delay_interval: delayInterval });
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
                id={this.props.id}
                className="spinner-button border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                onClick={this.onClicked}
                disabled={this.state.in_delay}>
                {this.state.in_delay && (
                    <i
                        className="fa od-spinner"
                        style={{ marginRight: "15px" }}
                    >( )</i>
                )}
                {this.state.in_delay && <span>{this.captionInDelay}({this.state.delay_interval})</span>}
                {!this.state.in_delay && <span>{this.caption}</span>}
            </button>
        );
    }

}

export default DelayButton;