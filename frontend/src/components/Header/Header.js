import React from 'react';
import {Link} from "react-router-dom";

const Header = () => {
  return (
    <header>
      헤더 부분 표시 <br/>
      메뉴화면, 로그인, 회원가입, 마이페이지 <br/> <br/>
      
      <Link to="/">홈</Link>
      &nbsp; | &nbsp;
      <Link to="/reservation.details">예약내역</Link>
      &nbsp; | &nbsp;
      <Link to="/mypage">마이 페이지</Link>
      &nbsp; | &nbsp;
      <Link to="/login">로그인/회원가입</Link>
      <hr/>
    </header>
  );
};

export default Header;