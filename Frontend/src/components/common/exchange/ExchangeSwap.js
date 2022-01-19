import React from "react";
import AccountService from '../../../service/Account';
import cake from '../assets/images/icons/cake.png';
import SwapConfirmScene from '../../common/exchange/SwapConfirmScene';
import DelayButton from '../../common/DelayButton';

const SCENE_IDLE = 0,
    SCENE_CONFIRM_SWAP = 1;
// SCENE_DURING_SWAP = 2,
// SCENE_COMPLETE_SWAP = 3;
var self;
const accountService = new AccountService();

export default class ExchangeSwap extends React.Component {
    constructor(props) {
        super(props);
        self = this;

        this.state = {
            info: '',
            error: '',
            showModal: false,
            currentScene: SCENE_IDLE,
            sell_token: 'DAI',
            buy_token: 'UNI',
            input: {
                sellAmount: '',
                buyAmount: ''
            },
        }

        this.userToken = props.userToken;
        this.topClass = (props.extraClass ? props.class : "home-card py-10 px-0 w-full h-full");
        this.inform = props.inform;
        this.warning = props.warning;

        this.onClickSwap = this.onClickSwap.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {
        if (prevProps.userToken !== this.props.userToken) {
            this.userToken = this.props.userToken;
        }
    }

    handleInputChange = ev => {
        this.warning('');
        let input = this.state.input;
        input[ev.target.name] = ev.target.value;
        this.setState({
            input
        });
    }

    setSellAmount(amount) {
        let input = this.state.input;
        input.sellAmount = amount;
        this.setState({ input: input });
    }

    onClickSwap(params, ev, btnCmpnt) {
        this.inform("");
        // this.setState({ currentScene: SCENE_CONFIRM_SWAP });
        // this.inform(this.state.input.sellAmount + ", " + this.state.input.buyAmount);
        accountService.swap({
            reqParam: {
                userToken: this.userToken,
                sellSymbol: this.state.sell_token,
                sellAmount: this.state.input.sellAmount,
                buySymbol: this.state.buy_token,
            },
            onComplete: resp => {
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
            },
            onFailed: error => {
                btnCmpnt.stopTimer();
                self.warning(error);
            }
        });
    }

    render() {
        return (
            <div className={this.topClass}>
                <div className={this.state.currentScene === SCENE_IDLE ? "shownBox" : "hiddenBox"}>
                    <div className="swap-card_header pb-5 border-b-2 border-gray-200">
                        <p className="main-font font-30 main-color text-center ">Swap</p>
                        <p className="main-font font-16 main-color text-center">Trade tokens in an instant</p>
                    </div>

                    <div className="swap-card_body px-10 pt-10 xl:pt-20">
                        <div class="flex justify-center">
                            <div>
                                <div class="dropdown relative">
                                    <button
                                        class="dropdown-toggle px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0           active:bg-blue-800 active:shadow-lg active:text-white transition duration-150 ease-in-out flex items-center whitespace-nowrap"
                                        type="button"
                                        id="dropdownMenuButton1"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Dropdown button
                                        <svg
                                            aria-hidden="true"
                                            focusable="false"
                                            data-prefix="fas"
                                            data-icon="caret-down"
                                            class="w-2 ml-2"
                                            role="img"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 320 512"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
                                            ></path>
                                        </svg>
                                    </button>
                                    <ul
                                        class="dropdown-menu min-w-max absolute hidden bg-white text-base z-50 float-left py-2 list-none text-left rounded-lg shadow-lg mt-1 hidden m-0 bg-clip-padding border-none"
                                        aria-labelledby="dropdownMenuButton1"
                                    >
                                        <li>
                                            <a
                                                class="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                                                href="#"
                                            >Action</a
                                            >
                                        </li>
                                        <li>
                                            <a
                                                class="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100" href="#"
                                            >Another action</a
                                            >
                                        </li>
                                        <li>
                                            <a
                                                class="dropdown-item text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 hover:bg-gray-100"
                                                href="#"
                                            >Something else here</a
                                            >
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center hover-transition ml-5 cursor-pointer">
                                <img width="24px" src="https://raw.githubusercontent.com/compound-finance/token-list/master/assets/asset_DAI.svg" color="text" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca">
                                </img>
                                <p className="main-font font-18 main-color mx-3">{this.state.sell_token}</p>
                                <svg viewBox="0 0 24 24" color="text" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca">
                                    <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                                </svg>
                            </div>
                            <div className="w-full mt-5">
                                <input
                                    type="text"
                                    className="w-full text-right border border-gray-300 main-radius p-5 font-18 main-font focus:outline-none focus-visible:outline-none bg-gray-100"
                                    placeholder="0.0"
                                    name='sellAmount'
                                    value={this.state.input.sellAmount}
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
                            <div className="flex items-center hover-transition ml-5 cursor-pointer">
                                <img src={cake} alt="" width={24} />
                                <p className="main-font font-18 main-color mx-3">{this.state.buy_token}</p>
                                <svg viewBox="0 0 24 24" color="text" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca">
                                    <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                                </svg>
                            </div>
                            <div className="w-full mt-5">
                                <input
                                    type="text"
                                    className="w-full text-right border border-gray-300 main-radius p-5 font-18 main-font focus:outline-none focus-visible:outline-none bg-gray-100"
                                    placeholder="0.0"
                                    name='buyAmount'
                                    value={this.state.input.buyAmount}
                                    onChange={this.handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-5 pt-10 xl:pt-20">
                        <DelayButton
                            captionInDelay="Swapping"
                            caption="Swap"
                            maxDelayInterval={60}
                            onClickButton={this.onClickSwap}
                            onClickButtonParam={null} />
                    </div>
                </div>
                <div className={this.state.currentScene === SCENE_CONFIRM_SWAP ? "shownBox" : "hiddenBox"}>
                    <SwapConfirmScene />
                </div>
            </div >
        );
    }
}