import cake from '../assets/images/icons/cake.png';

export default function ExchangeSwap() {
    return (
        <div className="home-card py-10 px-0 w-full h-full">
            <div className="swap-card_header pb-5 border-b-2 border-gray-200">
                <p className="main-font font-30 main-color text-center ">Swap</p>
                <p className="main-font font-16 main-color text-center">Trade tokens in an instant</p>
            </div>
            <div className="swap-card_body px-10 pt-10 xl:pt-20">
                <div>
                    <div className="flex items-center hover-transition ml-5 cursor-pointer">
                        <svg viewBox="0 0 16 16" width="24px" color="text" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca">
                            <circle cx="8" cy="8" r="8" fill="#F0B90B"></circle>
                            <path d="M5.01656 8.00006L3.79256 9.23256L2.56006 8.00006L3.79256 6.76756L5.01656 8.00006ZM8.00006 5.01656L10.1081 7.12456L11.3406 5.89206L9.23256 3.79256L8.00006 2.56006L6.76756 3.79256L4.66806 5.89206L5.90056 7.12456L8.00006 5.01656ZM12.2076 6.76756L10.9836 8.00006L12.2161 9.23256L13.4401 8.00006L12.2076 6.76756ZM8.00006 10.9836L5.89206 8.87556L4.66806 10.1081L6.77606 12.2161L8.00006 13.4401L9.23256 12.2076L11.3406 10.0996L10.1081 8.87556L8.00006 10.9836ZM8.00006 9.23256L9.23256 8.00006L8.00006 6.76756L6.76756 8.00006L8.00006 9.23256Z" fill="#FFFDFA">
                            </path>
                        </svg>
                        <p className="main-font font-18 main-color mx-3">BNB</p>
                        <svg viewBox="0 0 24 24" color="text" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca">
                            <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                        </svg>
                    </div>
                    <div className="w-full mt-5">
                        <input type="text" className="w-full text-right border border-gray-300 main-radius p-5 font-18 main-font focus:outline-none focus-visible:outline-none bg-gray-100" placeholder="0.0" />
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
                        <p className="main-font font-18 main-color mx-3">BNB</p>
                        <svg viewBox="0 0 24 24" color="text" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdnxRM kDWlca">
                            <path d="M8.11997 9.29006L12 13.1701L15.88 9.29006C16.27 8.90006 16.9 8.90006 17.29 9.29006C17.68 9.68006 17.68 10.3101 17.29 10.7001L12.7 15.2901C12.31 15.6801 11.68 15.6801 11.29 15.2901L6.69997 10.7001C6.30997 10.3101 6.30997 9.68006 6.69997 9.29006C7.08997 8.91006 7.72997 8.90006 8.11997 9.29006Z"></path>
                        </svg>
                    </div>
                    <div className="w-full mt-5">
                        <input type="text" className="w-full text-right border border-gray-300 main-radius p-5 font-18 main-font focus:outline-none focus-visible:outline-none bg-gray-100" placeholder="0.0" />
                    </div>
                </div>
            </div>
            <div className="px-5 pt-10 xl:pt-20">
                <div className="main-btn button-bg text-white py-5 text-center hover-transition mt-5">Connect Wallet</div>
            </div>
        </div >
    );
}
