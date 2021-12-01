import singleLogo from "../../common/assets/images/img/circle-logo.png";


export default function Seconds() {
    return (
        <div className="main-totalstatistic py-20">
            <div className="main-container flex flex-col items-center">
                <div className="mt-10">
                    <p className="main-font  font-40 main-color text-center main-lineheight py-3 capitalize"> Start in seconds.</p>
                </div>
                <div className="mt-10">
                    <p className="main-font font-24 main-color text-center main-lineheight"> We are going to put APP download links here. </p>
                    <p className="main-font font-24 main-color text-center main-lineheight ">IOS and Android apps.</p>
                </div>
                <div className="mt-10">
                    <a href="#" className="font-24 main-font main-color-blue text-center">
                        Learn how to start
                    </a>
                </div>
                <div className="main-btn text-white main-font font-24 button-bg py-3 px-10 my-10 hover-transition">
                    Connect Wallet
                </div>
            </div>
        </div >
    );
}
