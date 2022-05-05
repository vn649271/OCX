import React from "react";
import AccountService from '../../../service/Account';
import cake from '../assets/images/icons/cake.png';
import DelayButton from '../../common/DelayButton';
import Button from "@material-tailwind/react/Button";
import SwapConfirmScene from '../../common/exchange/SwapConfirmScene';
import DropdownList from "../DropdownList";
import OcxSpinButton from '../../common/OcxSpinButton';
import OcxConfirm from '../../common/OcxConfirm';

const SCENE_IDLE = 0,
    SCENE_CONFIRM_SWAP = 1;
// SCENE_DURING_SWAP = 2,
// SCENE_COMPLETE_SWAP = 3;
var self;
const accountService = new AccountService();

const TOKENS = [
    {
        iconUrl: "images/asset_ETH.svg",
        title: "ETH"
    }, 
    {
        iconUrl: "images/asset_DAI.svg",
        title: "DAI"
    }, 
    {
        iconUrl: "images/UNI.png",
        title: "UNI"
    }, 
    {
        iconUrl: "",
        title: "PNFT"
    }, 
    {
        iconUrl: "",
        title: "OCAT"
    },
];

export default class ExchangeSwap extends React.Component {
    constructor(props) {
        super(props);
        self = this;

        this.state = {
            info: '',
            error: '',
            showModal: false,
            current_scene: SCENE_IDLE,
            sell_token: 'ETH',
            buy_token: 'DAI',
            input: {
                sell_amount: '',
                buy_amount: '',
                slippage: 3,
            },
            confirm_handler: null,
            confirm_text: null,
            show_confirm: false
        }

        this.userToken = props.userToken;
        this.topClass = (props.extraClass ? props.class : "home-card py-10 px-0 w-full h-full");
        this.warning = props.warning;
        this.showToast = props.showToast;

        this.onClickSwap = this.onClickSwap.bind(this);
        this.onClickConfirmSwap = this.onClickConfirmSwap.bind(this);
        this.showConfirm = this.showConfirm.bind(this);
        this.closeConfirm = this.closeConfirm.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.fetchBestBuyAmount = this.fetchBestBuyAmount.bind(this);
        this.onClickCancelReviewSwap = this.onClickCancelReviewSwap.bind(this);
        this.setBuyAmount = this.setBuyAmount.bind(this);
        this.setSellAmount = this.setSellAmount.bind(this);
        this.onSelectSellToken = this.onSelectSellToken.bind(this);
        this.onSelectBuyToken = this.onSelectBuyToken.bind(this);
    }

    componentDidMount = () => {

    }

    componentDidUpdate = prevProps => {
        if (prevProps.userToken !== this.props.userToken) {
            this.userToken = this.props.userToken;
        }
    }

    handleInputChange = ev => {
        let input = this.state.input;
        input[ev.target.name] = ev.target.value;
        this.setState({
            input
        });
        if (ev.target.name == 'sell_amount') {
            this.setBuyAmount('');
            this.fetchBestBuyAmount();
        }
    }

    setSellAmount = amount => {
        let input = this.state.input;
        input.sell_amount = amount;
        this.setState({ input: input });
    }

    setBuyAmount = amount => {
        let input = this.state.input;
        input.buy_amount = amount;
        this.setState({ input: input });
    }

    onClickCancelReviewSwap = () => {
        this.setState({ current_scene: SCENE_IDLE });
    }

    onSelectSellToken = index => {
        this.setState({sell_token: TOKENS[index].title});
    }

    onSelectBuyToken = index => {
        this.setState({buy_token: TOKENS[index].title});
    }
    fetchBestBuyAmount = async () => {
        let ret = await accountService.getBestPrice({
            userToken: this.userToken,
            sellSymbol: this.state.sell_token,
            sellAmount: this.state.input.sell_amount,
            buySymbol: this.state.buy_token,
        });
        if (ret.error !== 0) {
            this.showToast("Failed to get best price: " + ret.data);
            return;
        }
        this.setBuyAmount((ret.data - 0).toFixed(5));
    }
    onClickSwap = async params => {
        this.showConfirm({context: params });
    }
    showConfirm = params => {
        this.setState({confirm_handler: this.onClickConfirmSwap});
        this.setState({confirm_text: 'Are you sure to proceed?'});
        this.confirmContext = params.context ? params.context : null;
        this.setState({show_confirm: true});
    }
    closeConfirm = () => {
        this.setState({show_confirm: false});
        return this.confirmContext;
    }
    onClickConfirmSwap = async retCode => {
        let { stopWait, getExtraData } = this.closeConfirm();
        stopWait();
        if (retCode == 1) { // No
            return;
        }
        if (this.state.sell_token == "" 
        || this.state.input.sell_amount == "" || this.state.input.sell_amount - 0 == 0
        || this.state.buy_token == ""
        || this.state.input.buy_amount == "" || this.state.input.buy_amount - 0 == 0) {
            this.showToast("Invalid parameters for swap");
            return;
        }
        let resp = await accountService.swap({
            userToken: this.userToken,
            sellSymbol: this.state.sell_token,
            sellAmount: this.state.input.sell_amount,
            buySymbol: this.state.buy_token,
            buyAmount: this.state.input.buy_amount,
            slippage: 3, // this.state.input.slippage
            deadline: 600 // this.state.input.deadline
        });

        self.setSellAmount('');
        self.setBuyAmount('');
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

    render = () => {
        return (
            <div className={this.topClass}>
                 <div>
                {
                    this.state.show_confirm ?
                    <OcxConfirm 
                        show={true}
                        onClick={ this.state.confirm_handler }
                    >{ this.state.confirm_text }</OcxConfirm>
                    :<></>
                }
                </div>
               <div className="swap-card_header pb-5 border-b-2 border-gray-200">
                    <p className="main-font font-30 main-color text-center ">Swap</p>
                    <p className="main-font font-16 main-color text-center">Trade tokens in an instant</p>
                </div>
                <div className="swap-card_body px-10 pt-10 xl:pt-20">
                    <div>
                        <DropdownList items={TOKENS} onSelectItem={this.onSelectSellToken}></DropdownList>
                        <div className="w-full mt-5">
                            <input
                                type="text"
                                className="w-full text-right border border-gray-300 main-radius p-5 font-18 main-font focus:outline-none focus-visible:outline-none bg-gray-100"
                                placeholder="0.0"
                                name='sell_amount'
                                value={this.state.input.sell_amount}
                                onChange={this.handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="flex my-5">
                        <p className="mx-auto rounded-full border border-gray-300 p-3 bg-gray-100 cursor-pointer hover-transition">
                            <svg viewBox="0 0 24 24" width="16px" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM ACFFk  rounded-full"><path className="down-arrow" d="M11 5V16.17L6.11997 11.29C5.72997 10.9 5.08997 10.9 4.69997 11.29C4.30997 11.68 4.30997 12.31 4.69997 12.7L11.29 19.29C11.68 19.68 12.31 19.68 12.7 19.29L19.29 12.7C19.68 12.31 19.68 11.68 19.29 11.29C18.9 10.9 18.27 10.9 17.88 11.29L13 16.17V5C13 4.45 12.55 4 12 4C11.45 4 11 4.45 11 5Z"></path></svg>
                        </p>
                    </div>
                    <div>
                        <DropdownList items={TOKENS} onSelectItem={this.onSelectBuyToken}></DropdownList>
                        <div className="w-full mt-5">
                            <input
                                type="text"
                                className="w-full text-right border border-gray-300 main-radius p-5 font-18 main-font focus:outline-none focus-visible:outline-none bg-gray-100"
                                placeholder="0.0"
                                name='buy_amount'
                                value={this.state.input.buy_amount}
                                onChange={this.handleInputChange}
                            />
                        </div>
                    </div>
                </div>
                <div className="review-swap-button-container px-5 pt-10 xl:pt-20">
                    <OcxSpinButton
                        title="Swap"
                        onClick={this.onClickSwap}
                    />
                </div>
            </div >
        );
    }
}