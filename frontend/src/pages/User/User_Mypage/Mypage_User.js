import React, { useEffect, useState } from "react";
import "./Mypage_User.css";

// 왼쪽 사이드바 관리
const Sidebar = ({ onSelect }) => {
  return (
    <div className="sidebar">
      <h2>마이페이지</h2>
      <ul className="menu-list">
        <li onClick={() => onSelect("myPage")}>마이페이지</li>
        <li onClick={() => onSelect("myHeart")}>나의 찜 목록</li>
        <li onClick={() => onSelect("myReservation")}>나의 사전예약</li>
        <li onClick={() => onSelect("myReview")}>나의 리뷰</li>
        <li onClick={() => onSelect("editMember")}>회원정보 수정</li>
        <li onClick={() => onSelect("deleteMember")}>회원탈퇴</li>
      </ul>
    </div>
  );
};

// 마이페이지 출력 화면
const Mypage_User = () => {
  const [selectedSection, setSelectedSection] = useState("myPage");

  const renderContent = () => {
    switch (selectedSection) {
      case "myPage":
        return <div>마이페이지</div>;

      case "myHeart":
        return <div>나의 찜 목록</div>;

      case "myReservation":
        return <div>나의 사전예약</div>;

      case "myReview":
        return <div>나의 리뷰</div>;

      case "editMember":
        return <div>회원정보 수정</div>;

      case "deleteMember":
        return <div>회원탈퇴</div>;

      default:
        return <div>유저 마이페이지 화면입니다.</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onSelect={setSelectedSection} />
      <div className="content">
        <h1>마이페이지</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Mypage_User;