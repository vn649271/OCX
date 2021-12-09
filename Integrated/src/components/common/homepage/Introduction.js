import mainImg from '../../common/assets/images/img/main-img.png';

export default function Introduction() {
    return (
        <div className="main-introduction py-20">
            <div className="main-container flex justify-between items-center flex-reverse responsive-part">
                <div className="introduction-left w-1/2 responsive-full responsive-flex-order2">
                    <h1 className="intro-title main-color font-58 main-font  capitalize">The Chain is made of Open Hearts.</h1>
                    <p className="intro-description main-color font-24 main-font py-16 main-lineheight">
                        The Gateway to infinite possibilities <br />
                        Link, Convert and Create your paradigm with OpenChain DEX.
                    </p>
                    <div className="intro-bnt_group">
                        <button className="hover-transition button-bg blue-border   text-white blue-border main-btn">Connect Wallet</button>
                        <button className="hover-transition blue-border main-color-blue main-btn">Trade Now</button>
                    </div>
                </div>
                <div className="introduction-right introduction-right-img w-1/2 p-40 responsive-flex-order1 responsive-p-30 ">
                    <img src={mainImg} alt="main-img" className="rounded-full"></img>
                </div>
            </div>
        </div >
    );
}
