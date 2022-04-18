import mainLogo from './assets/images/logo/logo.png';
import userLogo from './assets/images/img/user-avatar.png';
import { Link } from "react-router-dom";
import TextField from '@mui/material/TextField';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
// import DatePicker from '@mui/lab/DatePicker';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import Stack from '@mui/material/Stack';
import {useEffect, useState } from 'react';
// import { style } from '@mui/system';

export default function Header(props) {
    
    const {pageTitle = 'Dashboard'} = props;

    const [value, setValue] = useState(new Date());
    const [_pageTitle, setPageTitle] = useState(pageTitle);

    useEffect(() => {
        setPageTitle(pageTitle);
    });

    return (
        <header className="bg-global main-header py-3">
            <div className='message-part h-10 w-full hidden'>

            </div>
            <div className="flex justify-between main-header-content items-center px-16 ">
                <div className="flex items-center">
                    <Link to="/home">
                        <div className="main-logo flex items-center hover-transition">
                            <div className="mr-5">
                                <img src={mainLogo} alt="main-logo" width="30" />
                            </div>
                            <span className="main-logo_text font-20 main-color logo-font uppercase ">
                                Open Chain
                            </span>
                        </div>
                    </Link>
                    <div className='dashboard_name hidden main-font main-color font-30 pl-12 py-0'>
                        {_pageTitle}
                    </div>
                    <div className="header-navgation flex items-center font-16 main-color main-font ml-20">
                        <Link to="/exchange"> <span className="header-nav_items main-color px-5 py-2">Exchange</span></Link>
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">News</span></Link>
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">About Us</span></Link>
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">Whitepapaer</span></Link>
                        <Link to="#"> <span className="header-nav_items main-color px-5 py-2">Contact</span></Link>
                    </div>
                </div>

                <div className="header-right flex items-center">
                    <div className='user-logo flex items-center hidden'>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Stack spacing={1}>
                                <DesktopDatePicker
                                    disableFuture
                                    value={value}
                                    minDate={new Date('2021-01-01')}
                                    onChange={(newValue) => {
                                        setValue(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Stack>
                        </LocalizationProvider>

                        <div className='user-avatar ml-10'>
                            <img src={userLogo} alt='user-avatar' className='user-avatar' />
                        </div>
                        <div className='user-name font-20 main-font main-color ml-5'>
                            Big-Star
                        </div>
                    </div>
                    <div className="auth-btn_group rounded-full flex">
                        <Link to="/login">   <p className="login-btn capitalize main-font font-14 cursor-pointer m-0 hover-transition px-5  border-2 blue-border main-color-blue ">login</p></Link>
                        <Link to="/register">  <p className="signup-btn capitalize font-14 main-font cursor-pointer  m-0 hover-transition px-5   border-2 blue-border main-color-blue ">sign up</p></Link>
                    </div>
                </div>
            </div>
        </header >
    );
}