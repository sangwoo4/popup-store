import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from "react";

import Home from "./pages/Home/Home";
import DetailInfo from "./pages/DetailInfo/DatailInfo";
import MyPage from "./pages/MyPage/MyPage";
import Login from "./pages/Login/Login";
import ReservationDetails from "./pages/Reservation/ReservationDetails";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/popup.details/:location" element={<DetailInfo/>}/>
        <Route path="/reservation.details" element={<ReservationDetails/>}/>
        <Route path="/mypage" element={<MyPage/>}/>
        <Route path="/login" element={<Login/>}/>
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