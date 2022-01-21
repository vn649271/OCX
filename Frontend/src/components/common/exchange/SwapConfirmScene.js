import { Component } from 'react';
import AccountService from '../../../service/Account';
import DelayButton from '../../common/DelayButton';
import Button from "@material-tailwind/react/Button";

var self;
const accountService = new AccountService();

export default class SwapConfirmScene extends Component {

    constructor(props) {
        super(props);
        self = this;

        this.state = {
            
        }
        this.userToken = props.user_token;
        this.onClickConfirmSwap = this.onClickConfirmSwap.bind(this)
    }

    componentDidUpdate(prevProps) {
    }

    async onClickConfirmSwap(params, ev, btnCmpnt) {
        let resp = await accountService.swap({
            userToken: this.userToken,
            sellSymbol: this.state.sell_token,
            sellAmount: this.state.input.sellAmount,
            buySymbol: this.state.buy_token,
        });
        btnCmpnt.stopTimer();
        self.setSellAmount('');
        var errorMsg = null;
        if (resp.error === 0) {
            self.inform("Swap success: " + resp.data.transactionHash);
            console.log("Swap success: ", resp.data);
            return;
        } else if (resp.error === -1000) {
            errorMsg = "No response for get balance";
        } else if (resp.error !== 0) {
            errorMsg = resp.data
        }
        self.warning(errorMsg);
    }

    render() {
        return (
            <div className="confirm-swap-container">
                <div>
                    <span>From {this.state.sell_amount}</span>:
                    <span>{this.state.sell_token}</span>
                </div>
                <div>
                    <span>To: {this.state.buy_amount}</span>
                    <span>{this.state.buy_token}</span>
                </div>
                <span>
                    <DelayButton
                        captionInDelay="Swapping"
                        caption="Confirm to swap"
                        maxDelayInterval={60}
                        onClickButton={this.onClickConfirmSwap}
                        onClickButtonParam={null} />
                </span>
                <span>
                    <Button
                        className="main-button-type border border-grey-light button-bg p-5 hover-transition main-font focus:outline-none rounded text-white verify-button"
                        onClick={this.props.onClickCancel}
                    >Cancel</Button>
                </span>
            </div>
        );
    }
}