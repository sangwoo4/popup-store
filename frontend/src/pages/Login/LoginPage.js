import React from 'react';
import './LoginPage.css';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="selection-page">
      <div className="section left">
        <div className="title">기업</div>
        <div className="subtitle">로그인 또는 회원가입</div>
        <div className="button-group">
          <Link to="/auth/company/login">
            <button className="option-button">기업 로그인</button>
          </Link>
          <Link to="/auth/company/signup">
            <button className="option-button">기업 회원가입</button>
          </Link>
        </div>
      </div>
      <div className="section right">
        <div className="title">고객</div>
        <div className="subtitle">로그인 또는 회원가입</div>
        <div className="button-group">
          <Link to="/auth/user/login">
            <button className="option-button">고객 로그인</button>
          </Link>
          <Link to="/auth/user/signup">
            <button className="option-button">고객 회원가입</button>
          </Link>
        </div>
      </div>
    </div>
  );
}








// import React from 'react';
// import './LoginPage.css';
// import { Link } from 'react-router-dom';

// export default function LoginPage() {
//   return (
//     <div className="selection-page">
//       <div className="title">환영합니다!</div>
//       <div className="subtitle">원하는 옵션을 선택하세요</div>
//       <div className="button-group">
//         <Link to="/auth/company/login">
//           <button className="option-button">기업 로그인</button>
//         </Link>
//         <Link to="/auth/company/signup">
//           <button className="option-button">기업 회원가입</button>
//         </Link>
//         <Link to="/auth/user/login">
//           <button className="option-button">고객 로그인</button>
//         </Link>
//         <Link to="/auth/user/signup">
//           <button className="option-button">고객 회원가입</button>
//         </Link>
//       </div>
//     </div>
//   );
// }
