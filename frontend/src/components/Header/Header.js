import React from 'react';
import {Link} from "react-router-dom";

//아이콘 삽입
import { IoHome } from "react-icons/io5"; // 홈아이콘
import { IoSearch } from "react-icons/io5"; //검색 아이콘
import { GoHeart } from "react-icons/go"; //예약내역 아이콘
import { GoPerson } from "react-icons/go"; //마이페이지 아이콘


const Header = () => {
  return (
    <header>
      헤더 부분 표시 <br/>
      메뉴화면, 로그인, 회원가입, 마이페이지 <br/> <br/>

      <IoHome />
      <Link className="home" to="/">홈</Link>
      &nbsp; | &nbsp;

      <GoHeart />
      <Link to="/reservation.details">예약내역</Link>
      &nbsp; | &nbsp;

      <GoPerson />
      <Link to="/mypage">마이 페이지</Link>
      &nbsp; | &nbsp;

      <Link to="/login">로그인/회원가입</Link>
      &nbsp; | &nbsp;

      <Link to="/popup.registration">기업 팝업 등록하기</Link>
      <hr/>
    </header>
  );
};

export default Header;