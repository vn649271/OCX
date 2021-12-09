import React from "react";

import Header from "../common/Header";
import Footer from "../common/Footer";
import Introduction from "../common/homepage/Introduction";
import TotalStatistic from "../common/homepage/TotalStatistic";
import Trade from "../common/homepage/Trade";
import Earn from "../common/homepage/Earn";
import Games from "../common/homepage/Games";
import Cake from "../common/homepage/Cake";
import Seconds from "../common/homepage/Seconds";
import MobileNav from "../common/MobileNav";


export default function Home() {
    
    return (
        <div>
            <Header />
            <Introduction />
            <TotalStatistic />
            <Trade />
            <Earn />
            <Cake />
            <Seconds />
            <Games />
            <Footer />
            <MobileNav />
        </div>
    );
}
