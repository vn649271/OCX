import { Link } from "react-router-dom";


export default function MobileNav() {
    return (
        <div className="navigation-bg py-3 mobile-nav">
            <div className=" flex items-center justify-center font-20 main-color main-font">
                <Link to="/exchange"> <span className="header-nav_items main-color px-5 py-2">Exchange</span></Link>
                <Link to="#"> <span className="header-nav_items main-color px-5 py-2">News</span></Link>
                <Link to="#"> <span className="header-nav_items main-color px-5 py-2">About Us</span></Link>
                <Link to="#"> <span className="header-nav_items main-color px-5 py-2">Whitepapaer</span></Link>
                <Link to="/signup"> <span className="header-nav_items main-color px-5 py-2">Contact</span></Link>
            </div>
        </div >
    );
}
