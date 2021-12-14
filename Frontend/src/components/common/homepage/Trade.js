import mainImg from '../assets/images/img/main-img.png';

export default function Trade() {
    return (
        <div className="main-introduction py-20">
            <div className="small-container flex items-center responsive-col">
                <div className="introduction-left w-1/2 responsive-w-90 responsive-flex-order2 ">
                    <h1 className="intro-title main-color font-40 main-font capitalize">Third party digital ID verification system Making a peace of mind for everyone.</h1>
                    <p className="intro-description main-color font-24 main-font py-16 main-lineheight">
                        We are going to introduce our policies for KYC/AML third party verification system.
                    </p>
                    <div className="intro-bnt_group">
                        <a href='https://www/digitalid.com/developer' className='font-24 main-color-blue'>https://www/digitalid.com/developer</a>
                        {/* <button className="hover-transition  text-white blue-border main-btn button-bg blue-border ">Trade Now</button>
                        <button className="hover-transition main-color-blue main-btn">Learn</button> */}
                    </div>
                </div>
                <div className="introduction-right w-1/2 pl-40 responsive-p-30 responsive-flex-order1 ">
                    <img src={mainImg} alt="main-img" className="rounded-full"></img>
                </div>
            </div>
        </div >
    );
}
