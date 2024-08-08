import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoHome } from "react-icons/io5";
import { GoHeart, GoPerson } from "react-icons/go";
import './Header.css'; // CSS 파일을 import

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
    <header className="header">
      <nav className="nav-bar">
        <Link className="nav-link home" to={homeLink}><IoHome className="icon" />홈</Link>
        {isUserLoggedIn && (
          <>
            <Link className="nav-link" to="/popup/my.reservation"><GoHeart className="icon" />예약내역</Link>
          </>
        )}
        <Link className="nav-link" to="/auth/user/mypage"><GoPerson className="icon" />마이 페이지</Link>
        {isCompanyLoggedIn && (
          <Link className="nav-link" to="/popup/company/register">기업 팝업 등록하기</Link>
        )}
        {isUserLoggedIn || isCompanyLoggedIn ? (
          <div className="user-info">
            <p className="welcome-message">{nickname}님, 안녕하세요!</p>
            <button className="logout-button" onClick={handleLogout}>로그아웃</button>
          </div>
        ) : (
          <Link className="nav-link login-link" to="/select/login">로그인</Link>
        )}
      </nav>
      <hr />
    </header>
  );
};

export default Header;












//// 24.08.08 로그인 별 권한부여 설정
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
//     console.log("Token from localStorage:", token);

//     if (token) {
//       fetch("http://localhost:8080/company/companyname", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then(res => {
//         console.log("Company name fetch status:", res.status);
//         if (res.ok) {
//           return res.text();
//         } else {
//           throw new Error('Failed to fetch company name');
//         }
//       })
//       .then(res => {
//         console.log("Company name response:", res);
//         if (res) {
//           setIsCompanyLoggedIn(true);
//           setNickname(res);
//           setHomeLink('/auth/company/homepage');
//         } else {
//           checkUserLogin(token);
//         }
//       })
//       .catch(error => {
//         console.error('Error fetching company name:', error);
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
//       console.log("User nickname fetch status:", res.status);
//       if (res.ok) {
//         return res.text();
//       } else {
//         throw new Error('Failed to fetch user nickname');
//       }
//     })
//     .then(resText => {
//       console.log("User nickname response (text):", resText);
//       try {
//         const res = JSON.parse(resText);
//         console.log("User nickname response (parsed):", res);
//         if (res && res.username) {
//           setIsUserLoggedIn(true);
//           setNickname(res.username);
//           setHomeLink('/');
//         } else {
//           console.warn('No username found in response');
//         }
//       } catch (error) {
//         console.error('Error parsing JSON response:', error);
//         // Assuming the response is plain text in this case
//         setIsUserLoggedIn(true);
//         setNickname(resText);
//         setHomeLink('/');
//       }
//     })
//     .catch(error => {
//       console.error('Error fetching user nickname:', error);
//     });
//   };

//   useEffect(() => {
//     console.log("Company logged in state:", isCompanyLoggedIn);
//     console.log("User logged in state:", isUserLoggedIn);
//     console.log("Nickname state:", nickname);
//     console.log("Home link state:", homeLink);
//   }, [isCompanyLoggedIn, isUserLoggedIn, nickname, homeLink]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setIsCompanyLoggedIn(false);
//     setIsUserLoggedIn(false);
//     setNickname('');
//     console.log("Logged out, token removed from localStorage");
//     window.location.href = "/";
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
//           <Link to="/popup/my.reservation">예약내역</Link>
//           &nbsp; | &nbsp;
//         </>
//       )}

//       <GoPerson />
//       <Link to="/mypage">마이 페이지</Link>
//       &nbsp; | &nbsp;

//       <div style={{ display: 'inline-block' }}>
//         {isCompanyLoggedIn && (
//           <>
//             <Link to="/popup/company/register">기업 팝업 등록하기</Link>
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