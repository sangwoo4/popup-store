import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from "react";

import Home from "./pages/Home/Home";
import DetailInfo from "./pages/DetailInfo/DetailInfo";
import MyPage from "./pages/MyPage/MyPage";
import ReservationDetails from "./pages/Reservation/ReservationDetails";
import PopupRegistration from './pages/PopupRegister/PopupRegister';
import FindIDPW from './pages/Login_Signup/FindIDPW';
import Login from './pages/Login_Signup/Login';
import SignUp from './pages/Login_Signup/SignUp';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/popup.details/:location" element={<DetailInfo/>}/>
        <Route path="/reservation.details" element={<ReservationDetails/>}/>
        <Route path="/mypage" element={<MyPage/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/fintidpw" element={<FindIDPW/>}/>
        <Route path="/popup.registration" element={<PopupRegistration/>}/>
        <Route path='/login' element={<Login/>}/>
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