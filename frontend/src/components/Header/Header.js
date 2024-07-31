/*
  24.07.21 수정사항
  로그인 상태 코드 삽입 중
*/

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { GoHeart } from "react-icons/go";
import { GoPerson } from "react-icons/go";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState(""); // 사용자 역할 상태 추가

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // 사용자 정보 가져오기
      fetch("http://localhost:8080/user/nickname", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then((res) => res.json())
      .then(res => {
        if (res) {
          setCompanyName(res.companyName);
          setRole(res.role);
        }
      })
      .catch(error => {
        console.error('사용자 정보 가져오기 중 오류 발생:', error);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, [window.location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <header>
      헤더 부분 표시 <br/>
      메뉴화면, 로그인, 회원가입, 마이페이지 <br/><br/>

      <IoHome />
      <Link className="home" to="/">홈</Link>
      &nbsp; | &nbsp;

      <GoHeart />
      <Link to="/reservation.details">예약내역</Link>
      &nbsp; | &nbsp;

      <GoPerson />
      <Link to="/mypage">마이 페이지</Link>
      &nbsp; | &nbsp;

      <div style={{ display: 'inline-block' }}>
        {isLoggedIn && (
          <>
            <Link to="/popup.registration">기업 팝업 등록하기</Link>
            &nbsp; | &nbsp;
          </>
        )}
        {isLoggedIn ? (
          <div style={{ display: 'inline-block' }}>
            <p className="success-Login" style={{ display: 'inline-block', margin: '0 10px' }}>{companyName}님, 안녕하세요!</p>
            <button className="logoutButton" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        ) : (
          <Link to="/select/login">로그인</Link>
        )}
      </div>
      <hr/>
    </header>
  );
};

export default Header;




// 24.07.21 닉네임 받아오기 코드 삽입 전
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

// //아이콘 삽입
// import { IoHome } from "react-icons/io5"; // 홈아이콘
// import { GoHeart } from "react-icons/go"; //예약내역 아이콘
// import { GoPerson } from "react-icons/go"; //마이페이지 아이콘

// const Header = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [nickname, setNickname] = useState(""); // 닉네임 상태 추가

//   // 페이지가 로드될 때마다 로컬 스토리지에서 토큰을 확인하여 로그인 상태를 업데이트
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       setIsLoggedIn(true);
//       // 토큰이 있는 경우, 닉네임 가져오기
//       fetch("http://localhost:8080/user/nickname", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then((res) => res.text())
//       .then(res => {
//         if (res) {
//           setNickname(res);
//         }
//       })
//       .catch(error => {
//         console.error('닉네임 가져오기 중 오류 발생:', error);
//       });
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, [window.location.pathname]); // 경로가 변경될 때마다 실행

//   useEffect(() => {
//     // 페이지 로딩 시 로컬 스토리지에서 토큰을 가져와 로그인 상태 확인
//     const token = localStorage.getItem("token");
//     if (token) {
//       setIsLoggedIn(true);
//     }
//   }, []);

//   const handleLogout = () => {
//     // 로그아웃 시 토큰 제거
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//   };

//   return (
//     <header>
//       헤더 부분 표시 <br/>
//       메뉴화면, 로그인, 회원가입, 마이페이지 <br/> <br/>

//       <IoHome />
//       <Link className="home" to="/">홈</Link>
//       &nbsp; | &nbsp;

//       <GoHeart />
//       <Link to="/reservation.details">예약내역</Link>
//       &nbsp; | &nbsp;

//       <GoPerson />
//       <Link to="/mypage">마이 페이지</Link>
//       &nbsp; | &nbsp;

//       <div style={{ display: 'inline-block' }}>
//         <Link to="/popup.registration">기업 팝업 등록하기</Link>
//         &nbsp; | &nbsp;
//         {isLoggedIn ? (
//           <div style={{ display: 'inline-block' }}>
//             <p className="success-Login" style={{ display: 'inline-block', margin: '0 10px' }}>{nickname}님, 안녕하세요!</p>
//             <button className="logoutButton" onClick={handleLogout}>
//               로그아웃
//             </button>
//           </div>
//         ) : (
//           <Link to="/select/login">로그인</Link>
//         )}
//       </div>
//       <hr/>
//     </header>
//   );
// };

// export default Header;