import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from "react";

import Home from "./pages/Home/Home";
import DetailInfo from "./pages/DetailInfo/DetailInfo";
import MyPage from "./pages/MyPage/MyPage";
import ReservationDetails from "./pages/Reservation/ReservationDetails";
import PopupRegistration from './pages/Company/Com_PopupRegister/PopupRegister';
import FindIDPW from './pages/Login_Signup/FindIDPW';
import Login from './pages/Login_Signup/Login';
import SignUp from './pages/Login_Signup/SignUp';
import SignUp_Company from './pages/Company/Com_Login_SignUp/SignUp_Company';
import Login_Company from './pages/Company/Com_Login_SignUp/Login_Company';
import LoginPage from './pages/Login/LoginPage';
import Home_Company from './pages/Company/Com_Home/Home_Company';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/popup.details/:location" element={<DetailInfo/>}/>
        <Route path="/reservation.details" element={<ReservationDetails/>}/>
        <Route path="/mypage" element={<MyPage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/fintidpw" element={<FindIDPW/>}/>
        <Route path="/popup.registration" element={<PopupRegistration/>}/>
        <Route path="/auth/company/signup" element={<SignUp_Company/>}/>
        <Route path="/auth/company/login" element={<Login_Company/>}/>
        <Route path="/select/login" element={<LoginPage/>}/>
        <Route path="/auth/company/homepage" element={<Home_Company/>}/>
      </Routes>
  );
}

export default App;


{/*
      <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/popup.details" element={<DetailInfo/>}/>
      <Route path="/reservation.details" element={<ReservationDetails/>}/>
      <Route path="/mypage" element={<MyPage/>}/>
      <Route path="/login" element={<Login/>}/>

    </Routes>
  */}