import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from "react";

import LoginPage from "./pages/Login/LoginPage";

import Home_User from "./pages/User/User_Home/Home_User";
import DetailInfo_User from "./pages/User/User_DetailInfo/DetailInfo_User";
import SignUp_User from "./pages/User/User_Login_SignUp/SignUp_User";
import Login_User from "./pages/User/User_Login_SignUp/Login_User";
import FindIDPW_User from "./pages/User/User_Login_SignUp/FindIDPW_User";
import MyPage_User from "./pages/User/User_Mypage/Mypage_User";
import ReservationDetails_User from "./pages/User/User_ReservarionDetails/ReservationDetails_User";
import Search_User from './pages/User/User_Search/Search_User';
import PopupReservation_User from './pages/User/User_PopupReservation/PopupReservation_User';
import PopupReservation_Comfirm_User from './pages/User/User_PopupReservation/PopupReservation_Confirm_User';

import Home_Company from "./pages/Company/Com_Home/Home_Company";
import Dashboard_Company from "./pages/Company/Com_Dashboard/Dashboard_Company";
import DetailInfo_Company from "./pages/Company/Com_DetailInfo/DetailInfo_Company";
import Login_Company from "./pages/Company/Com_Login_SignUp/Login_Company";
import SignUp_Company from "./pages/Company/Com_Login_SignUp/SignUp_Company";
import PopupRegister_Company from "./pages/Company/Com_PopupRegister/PopupRegister_Company";
import PopupUpdate_Company from './pages/Company/Com_Update/PopupUpdate_Company';



function App() {
  return (
      <Routes>
        <Route path="/select/login" element={<LoginPage/>}/>

        <Route path="/" element={<Home_User/>}/>
        <Route path="/popup/user/detail/:location" element={<DetailInfo_User/>}/>
        <Route path="/auth/user/signup" element={<SignUp_User/>}/>
        <Route path="/auth/user/login" element={<Login_User/>}/>
        <Route path="/auth/user/findidpw" element={<FindIDPW_User/>}/>
        <Route path="/auth/user/mypage" element={<MyPage_User/>}/>
        <Route path="/popup/my.reservation" element={<ReservationDetails_User/>}/>
        <Route path="/popup/user/search" element={<Search_User/>}/>
        <Route path="/popup/user/popup_pre_reservation/:id" element={<PopupReservation_User/>}/>
        <Route path="/popup/user/popup_reservation/confirm" element={<PopupReservation_Comfirm_User/>}/>

        <Route path="/auth/company/homepage" element={<Home_Company/>}/>
        <Route path="/auth/company/dashboard" element={<Dashboard_Company/>}/>
        <Route path="/popup/company/detail/:location" element={<DetailInfo_Company/>}/>
        <Route path="/auth/company/signup" element={<SignUp_Company/>}/>
        <Route path="/auth/company/login" element={<Login_Company/>}/>
        <Route path="/popup/company/register" element={<PopupRegister_Company/>}/>
        <Route path="/popup/company/update/:id" element={<PopupUpdate_Company/>}/>
      </Routes>
  );
}

export default App;