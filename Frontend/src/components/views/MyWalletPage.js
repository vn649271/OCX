import React, { Component } from 'react';
import DelayButton from '../common/DelayButton';

const MAX_CREATING_DELAY_TIMEOUT = 10

var me;

class MyWalletPage extends Component {

    constructor(props) {
        super(props);
        me = this;

        this.state = {
            is_creating: false,
            creating_interval: MAX_CREATING_DELAY_TIMEOUT,
            address: {
                eth: 0,
                btc: 0,
            }
        }

        this.onCreateAccont = this.onCreateAccont.bind(this);
    }

    onCreateAccont = (param, ev, buttonCmpnt) => {
        // If required action performed, buttonCmpnt.stopTimer() can be called to stop loading
        setTimeout(
            function () {
                buttonCmpnt.stopTimer();
            },
            10000
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.target !== this.props.target) {
        }
    }

    render() {
        return (
            <div className="my-wallet-page">
                {/* Create Account Button */}
                <DelayButton
                    captionInDelay="Creating"
                    caption="Creat Account"
                    maxDelayInterval={30}
                    onClickButton={this.onCreateAccont}
                    onClickButtonParam={null}
                />
                <span className="account-address-box main-font text-red-400 font-14">{this.state.address.eth}</span>
                <div>

                </div>
            </div>
        );
    }

}

export default MyWalletPage;


