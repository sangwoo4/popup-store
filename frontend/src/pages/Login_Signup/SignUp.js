import React, { useEffect, useState } from 'react';
import './SignUp.css';
import { FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  const [gender, setGender] = useState('');
  const [birth, setBirth] = useState('');
  const [birthValid, setBirthValid] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [notAllow, setNotAllow] = useState(true);
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [nameValid, setNameValid] = useState(false);
  const [nicknameValid, setNicknameValid] = useState(false);

  const [doubleCheckEmail, setDoubleCheckEmail] = useState(false);
  const [doubleCheckPhone, setDoubleCheckPhone] = useState(false);
  const [doubleCheckNickname, setDoubleCheckNickname] = useState(false);

  useEffect(() => {
    if (emailValid && passwordValid && confirmPasswordValid && phoneValid && birthValid && nameValid && nicknameValid) {
      setNotAllow(false);
    } else {
      setNotAllow(true);
    }
  }, [emailValid, passwordValid, confirmPasswordValid, phoneValid, birthValid, nameValid, nicknameValid, doubleCheckEmail, doubleCheckPhone, doubleCheckNickname]);

  const handleEmail = (e) => {
    setEmail(e.target.value);
    const regex =
      /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
    setEmailValid(regex.test(e.target.value));
  };

  const handlePassword = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/; // 8~20자 영문, 숫자, 특수문자 포함
    setPasswordValid(regex.test(newPassword));
    setConfirmPasswordValid(confirmPassword === newPassword);
  };

  const handleConfirmPassword = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordValid(newConfirmPassword === password);
  };

  const handleGender = (e) => {
    setGender(e.target.value);
  };

  const handleBirth = (e) => {
    const input = e.target.value;
    setBirth(input);
    setBirthValid(input.length === 10);
  };

  const handlePhone = (e) => {
    const input = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setPhone(input);
    setPhoneValid(input.length === 11);
  };

  const handleNickname = (e) => {
    const input = e.target.value;
    setNickname(input);
    setNicknameValid(input.length <= 10);
  };

  const handleUsername = (e) => {
    const input = e.target.value;
    setUsername(input);
    setNameValid(input.length > 0);
  };

  const onClickConfirmButton = () => {
    if (!doubleCheckEmail || !doubleCheckPhone || !doubleCheckNickname) {
      alert("중복확인을 모두 완료해주세요.");
      return;
    }

    fetch("http://localhost:8080/auth/user/signup", {
      method: "POST",
      headers: {
        "Content-Type":"application/json; charset=utf-8"
      },
      body: JSON.stringify({
        email: email,
        password: password,
        username: username,
        gender: gender,
        birth: birth,
        phone: phone,
        nickname: nickname,
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("=============");
      console.log("백엔드: ", res);
  
      if (res.result) {
        alert("회원가입이 정상적으로 되었습니다");
        window.location.href = "http://localhost:3000/Login";
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    })
    .catch(error => {
      console.error('백엔드와의 통신 중 오류 발생:', error);
    });
  };

  const handleDoubleCheckEmail = () => {
    if (email.trim().length === "") {
      alert("이메일을 입력해주세요.");
      setEmailValid(false);
      return;
    }
    fetch("http://localhost:8080/auth/signup/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({
        email: email
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("=============");
      console.log("이메일 중복 확인 결과: ", res);
  
      if (res.result) {
        alert("사용 가능한 이메일입니다.");
        setEmailValid(true);
      } else {
        alert("이미 사용 중인 이메일입니다.");
        setEmailValid(false);
      }
    })
    .catch(error => {
      console.error('이메일 중복 확인 중 오류 발생:', error);
      setEmailValid(false);
    });
  };
  
  const handleDoubleCheckPhone = () => {
    if (phone.trim().length === "") {
      alert("전화번호를 입력해주세요.");
      setPhoneValid(false);
      return;
    }
    fetch("http://localhost:8080/auth/signup/check-phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({
        phone: phone
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("=============");
      console.log("전화번호 중복 확인 결과: ", res);
  
      if (res.result) {
        alert("사용 가능한 전화번호입니다.");
        setPhoneValid(true);
      } else {
        alert("이미 사용 중인 전화번호입니다.");
        setPhoneValid(false);
      }
    })
    .catch(error => {
      console.error('전화번호 중복 확인 중 오류 발생:', error);
      setPhoneValid(false);
    });
  };

  const handleDoubleCheckNickname = () => {
    if (nickname.trim().length === "") {
      alert("닉네임을 입력해주세요.");
      setNicknameValid(false);
      return;
    }
    fetch("http://localhost:8080/auth/signup/check-nickname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({
        nickname: nickname
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("=============");
      console.log("닉네임 중복 확인 결과: ", res);
  
      if (res.result) {
        alert("사용 가능한 닉네임입니다.");
        setNicknameValid(true);
      } else {
        alert("이미 사용 중인 닉네임입니다.");
        setNicknameValid(false);
      }
    })
    .catch(error => {
      console.error('닉네임 중복 확인 중 오류 발생:', error);
      setNicknameValid(false);
    });
  };

  return (
    <div className="page">
      <Link to="/Login">
        <button className="backButton"><FiX /></button>
      </Link>

      <div className="titleWrap">
        회원가입
      </div>

      <div className="contentWrap">
        <div className="inputTitle">이메일 주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="example@gmail.com"
            value={email}
            onChange={handleEmail}
          />
          <button
            className="check-email"
            onClick={handleDoubleCheckEmail}
            disabled={!emailValid}
          >
            중복확인
          </button>
        </div>
        {(!emailValid && email.length > 0) && (
          <div className="errorMessageWrap">올바른 이메일을 입력해주세요.</div>
        )}

        <div className="inputTitle" style={{ marginTop: '26px' }}>비밀번호</div>
        <div className="inputWrap">
          <input
            className="input"
            type="password"
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            value={password}
            onChange={handlePassword}
          />
        </div>
        {(!passwordValid && password.length > 0) && (
          <div className="errorMessageWrap">영문, 숫자, 특수문자 포함 8자 이상 입력해주세요.</div>
        )}

        <div className="inputTitle">비밀번호 확인</div>
        <div className="inputWrap">
          <input
            className="input"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            value={confirmPassword}
            onChange={handleConfirmPassword}
          />
        </div>
        {(!confirmPasswordValid && confirmPassword.length > 0) && (
          <div className="errorMessageWrap">비밀번호가 일치하지 않습니다.</div>
        )}

        <div className="inputTitle">이름</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="이름을 입력해주세요"
            value={username}
            onChange={handleUsername}
          />
        </div>
        {(!nameValid && username.length > 0) && (
          <div className="errorMessageWrap">이름을 입력해주세요.</div>
        )}

        <div className="inputTitle">생년월일</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="YYYYMMDD"
            value={birth}
            onChange={handleBirth}
          />
        </div>
        {(!birthValid && birth.length > 0) && (
          <div className="errorMessageWrap">생년월일을 정확히 입력해주세요.</div>
        )}

        <div className="inputTitle">전화번호</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="전화번호를 입력해주세요"
            value={phone}
            onChange={handlePhone}
          />
          <button
            className="check-phone"
            onClick={handleDoubleCheckPhone}
            disabled={!phoneValid}
          >
            중복확인
          </button>
        </div>
        {(!phoneValid && phone.length > 0) && (
          <div className="errorMessageWrap">전화번호를 정확히 입력해주세요.</div>
        )}

        <div className="inputTitle">닉네임</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="닉네임을 입력해주세요"
            value={nickname}
            onChange={handleNickname}
          />
          <button
            className="check-nickname"
            onClick={handleDoubleCheckNickname}
            disabled={!nicknameValid}
          >
            중복확인
          </button>
        </div>
        {(!nicknameValid && nickname.length > 0) && (
          <div className="errorMessageWrap">닉네임은 10자 이하로 입력해주세요.</div>
        )}

        <div className="inputTitle">성별</div>
        <div className="genderInputs">
          <label>
            <input
              type="radio"
              value="M"
              checked={gender === 'M'}
              onChange={handleGender}
            />
            남성
          </label>
          <label>
            <input
              type="radio"
              value="F"
              checked={gender === 'F'}
              onChange={handleGender}
            />
            여성
          </label>
        </div>

        <button
          className="bottomButton"
          disabled={notAllow}
          onClick={onClickConfirmButton}
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
