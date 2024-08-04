/*
  24.08.04 수정사항
  유저와 기업 간 메뉴 활성화 다르게 설정
*/

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { GoHeart, GoPerson } from "react-icons/go";

const Header = () => {
  const [isCompanyLoggedIn, setIsCompanyLoggedIn] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [nickname, setNickname] = useState('');
  const [homeLink, setHomeLink] = useState('/');

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (token) {
      fetch("http://localhost:8080/company/companyname", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => {
        console.log("Company name fetch status:", res.status);
        if (res.ok) {
          return res.text();
        } else {
          throw new Error('Failed to fetch company name');
        }
      })
      .then(res => {
        console.log("Company name response:", res);
        if (res) {
          setIsCompanyLoggedIn(true);
          setNickname(res);
          setHomeLink('/auth/company/homepage');
        } else {
          checkUserLogin(token);
        }
      })
      .catch(error => {
        console.error('Error fetching company name:', error);
        checkUserLogin(token);
      });
    } else {
      setIsCompanyLoggedIn(false);
      setIsUserLoggedIn(false);
    }
  }, []);

  const checkUserLogin = (token) => {
    fetch("http://localhost:8080/user/nickname", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(res => {
      console.log("User nickname fetch status:", res.status);
      if (res.ok) {
        return res.text();
      } else {
        throw new Error('Failed to fetch user nickname');
      }
    })
    .then(resText => {
      console.log("User nickname response (text):", resText);
      try {
        const res = JSON.parse(resText);
        console.log("User nickname response (parsed):", res);
        if (res && res.username) {
          setIsUserLoggedIn(true);
          setNickname(res.username);
          setHomeLink('/');
        } else {
          console.warn('No username found in response');
        }
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        // Assuming the response is plain text in this case
        setIsUserLoggedIn(true);
        setNickname(resText);
        setHomeLink('/');
      }
    })
    .catch(error => {
      console.error('Error fetching user nickname:', error);
    });
  };

  useEffect(() => {
    console.log("Company logged in state:", isCompanyLoggedIn);
    console.log("User logged in state:", isUserLoggedIn);
    console.log("Nickname state:", nickname);
    console.log("Home link state:", homeLink);
  }, [isCompanyLoggedIn, isUserLoggedIn, nickname, homeLink]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsCompanyLoggedIn(false);
    setIsUserLoggedIn(false);
    setNickname('');
    console.log("Logged out, token removed from localStorage");
    window.location.href = "/";
  };

  return (
    <header>
      헤더 부분 표시 <br/>
      메뉴화면, 로그인, 회원가입, 마이페이지 <br/><br/>

      <IoHome />
      <Link className="home" to={homeLink}>홈</Link>
      &nbsp; | &nbsp;

      {isUserLoggedIn && (
        <>
          <GoHeart />
          <Link to="/reservation.details">예약내역</Link>
          &nbsp; | &nbsp;
        </>
      )}

      <GoPerson />
      <Link to="/mypage">마이 페이지</Link>
      &nbsp; | &nbsp;

      <div style={{ display: 'inline-block' }}>
        {isCompanyLoggedIn && (
          <>
            <Link to="/popup.registration">기업 팝업 등록하기</Link>
            &nbsp; | &nbsp;
          </>
        )}
        {isUserLoggedIn || isCompanyLoggedIn ? (
          <div style={{ display: 'inline-block' }}>
            <p className="success-Login" style={{ display: 'inline-block', margin: '0 10px' }}>{nickname}님, 안녕하세요!</p>
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












//// 24.08.04 로그인 별 메뉴버튼 다르게 설정 전
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { IoHome } from "react-icons/io5";
// import { GoHeart, GoPerson } from "react-icons/go";

// const Header = () => {
//   const [isCompanyLoggedIn, setIsCompanyLoggedIn] = useState(false);
//   const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
//   const [nickname, setNickname] = useState('');
//   const [homeLink, setHomeLink] = useState('/');

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     console.log("Token from localStorage:", token); // 로그 추가

//     if (token) {
//       fetch("http://localhost:8080/company/companyname", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then(res => {
//         console.log("Company name fetch status:", res.status); // 응답 상태 코드 로그
//         if (res.ok) {
//           return res.text(); 
//         } else {
//           throw new Error('Failed to fetch company name');
//         }
//       })
//       .then(res => {
//         console.log("Company name response:", res); // 로그 추가
//         if (res) {
//           setIsCompanyLoggedIn(true);
//           setNickname(res);
//           setHomeLink('/auth/company/homepage');
//         } else {
//           checkUserLogin(token);
//         }
//       })
//       .catch(error => {
//         console.error('기업 이름 가져오기 중 오류 발생:', error);
//         checkUserLogin(token);
//       });
//     } else {
//       setIsCompanyLoggedIn(false);
//       setIsUserLoggedIn(false);
//     }
//   }, []);

//   const checkUserLogin = (token) => {
//     fetch("http://localhost:8080/user/nickname", {
//       method: "GET",
//       headers: {
//         "Authorization": `Bearer ${token}`
//       }
//     })
//     .then(res => {
//       console.log("User nickname fetch status:", res.status); // 응답 상태 코드 로그
//       if (res.ok) {
//         return res.json();
//       } else {
//         throw new Error('Failed to fetch user nickname');
//       }
//     })
//     .then(res => {
//       console.log("User nickname response:", res);
//       if (res && res.username) {
//         setIsUserLoggedIn(true);
//         setNickname(res.username);
//         setHomeLink('/');
//       } else {
//         console.warn('No username found in response'); // 사용자 이름이 없을 때 경고
//       }
//     })
//     .catch(error => {
//       console.error('사용자 닉네임 가져오기 중 오류 발생:', error);
//     });
//   };

//   useEffect(() => {
//     console.log("Company logged in state:", isCompanyLoggedIn); // 로그 추가
//     console.log("User logged in state:", isUserLoggedIn); // 로그 추가
//     console.log("Nickname state:", nickname); // 로그 추가
//     console.log("Home link state:", homeLink); // 로그 추가
//   }, [isCompanyLoggedIn, isUserLoggedIn, nickname, homeLink]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsCompanyLoggedIn(false);
//     setIsUserLoggedIn(false);
//     setNickname(''); // Clear nickname on logout
//     console.log("Logged out, token removed from localStorage"); // 로그 추가
//     window.location.href = "/"; // 로그아웃 후 새로고침
//   };

//   return (
//     <header>
//       헤더 부분 표시 <br/>
//       메뉴화면, 로그인, 회원가입, 마이페이지 <br/><br/>

//       <IoHome />
//       <Link className="home" to={homeLink}>홈</Link>
//       &nbsp; | &nbsp;

//       {isUserLoggedIn && (
//         <>
//           <GoHeart />
//           <Link to="/reservation.details">예약내역</Link>
//           &nbsp; | &nbsp;
//         </>
//       )}

//       <GoPerson />
//       <Link to="/mypage">마이 페이지</Link>
//       &nbsp; | &nbsp;

//       <div style={{ display: 'inline-block' }}>
//         {isCompanyLoggedIn && (
//           <>
//             <Link to="/popup.registration">기업 팝업 등록하기</Link>
//             &nbsp; | &nbsp;
//           </>
//         )}
//         {isUserLoggedIn || isCompanyLoggedIn ? (
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