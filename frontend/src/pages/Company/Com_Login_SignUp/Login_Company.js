import React, { useEffect, useState, useRef } from 'react';
// import './Login.css';
import { Link, useNavigate } from "react-router-dom";

export default function Login_Company() {
  const [email, setEmail] = useState('');
  const [password, setPw] = useState('');

  const [emailValid, setEmailValid] = useState(false);
  const [pwValid, setPwValid] = useState(false);
  const [notAllow, setNotAllow] = useState(true);

  const passwordInputRef = useRef(null);
  const confirmButtonRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (emailValid && pwValid) {
      setNotAllow(false);
    } else {
      setNotAllow(true);
    }
  }, [emailValid, pwValid]);

  const handleEmail = (e) => {
    setEmail(e.target.value);
    const regex =
      /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    setEmailValid(regex.test(e.target.value));
  };

  const handlePw = (e) => {
    setPw(e.target.value);
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/;
    setPwValid(regex.test(e.target.value));
  };

  const onClickConfirmButton = () => {
    fetch("http://localhost:8080/auth/company/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("백엔드: ", res);
      console.log(res.data.token);

      if (res.data.token) {
        alert("로그인 되었습니다.");
        window.localStorage.setItem('token', res.data.token);
        window.location.href = '/';  // 로그인 성공 시 '/' 경로로 이동
      } else {
        alert("이메일 또는 비밀번호가 일치하지 않습니다.");
      }
    })
    .catch(error => {
      console.error('백엔드와의 통신 중 오류 발생:', error);
    });
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      passwordInputRef.current.focus();
    }
  };

  const handlePwKeyDown = (e) => {
    if (e.key === 'Enter' && !notAllow) {
      onClickConfirmButton();
    }
  };

  return (
    <div className="loginPage">
      <div className="login-Title">
        LOGIN
      </div>

      <div className="login-Content">
        <div className="login-InputTitle">이메일</div>
        <div className="login-InputWrap">
          <input
            className="loginInput"
            type="text"
            placeholder="test@gmail.com"
            value={email}
            onChange={handleEmail}
            onKeyDown={handleEmailKeyDown}
          />
        </div>
        <div className="login-errorMessage">
          {!emailValid && email.length > 0 && (
            <div>올바른 이메일을 입력해주세요.</div>
          )}
        </div>

        <div style={{ marginTop: "26px" }} className="login-InputTitle">
          비밀번호
        </div>
        <div className="login-InputWrap">
          <input
            className="loginInput"
            type="password"
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            value={password}
            onChange={handlePw}
            onKeyDown={handlePwKeyDown}
            ref={passwordInputRef}
          />
        </div>
        <div className="login-errorMessage">
          {!pwValid && password.length > 0 && (
            <div>영문, 숫자, 특수문자 포함 8자 이상 입력해주세요.</div>
          )}
        </div>
      </div>

      <button onClick={onClickConfirmButton} disabled={notAllow} className="loginConfirm-Button">
        확인
      </button>

      <div className="login-linkContainer">
        <div className="login-link">
          <Link to="/findidpw">
            이메일/비밀번호 찾기
          </Link>
        </div>

        <div className="login-link">
          <Link to="/auth/company/signup">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
