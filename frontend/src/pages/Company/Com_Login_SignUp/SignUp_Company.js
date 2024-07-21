import React, { useEffect, useState } from 'react';
import './SignUp_Company.css';
import { FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function SignUp_Company() {
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [managerName, setManagerName] = useState('');
  const [address, setAddress] = useState('');

  const [companyNameValid, setCompanyNameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [companyIdValid, setCompanyIdValid] = useState(false);
  const [managerNameValid, setManagerNameValid] = useState(false);
  const [addressValid, setAddressValid] = useState(false);

  const [doubleCheckCompanyEmail, setDoubleCheckCompanyEmail] = useState(false);
  const [doubleCheckCompanyId, setDoubleCheckCompanyId] = useState(false);

  // 상태 변수 추가
  const [emailCheckSuccess, setEmailCheckSuccess] = useState(false);
  const [companyIdCheckSuccess, setCompanyIdCheckSuccess] = useState(false);

  const [notAllow, setNotAllow] = useState(true);

  useEffect(() => {
    if (companyNameValid && passwordValid && confirmPasswordValid && emailValid && companyIdValid && managerNameValid && addressValid) {
      setNotAllow(false);
    } else {
      setNotAllow(true);
    }
  }, [companyNameValid, passwordValid, confirmPasswordValid, emailValid, companyIdValid, managerNameValid, addressValid, doubleCheckCompanyEmail, doubleCheckCompanyId]);

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
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/;
    setPasswordValid(regex.test(newPassword));
    setConfirmPasswordValid(confirmPassword === newPassword);
  };

  const handleConfirmPassword = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordValid(newConfirmPassword === password);
  };

  const handleCompanyName = (e) => {
    const input = e.target.value;
    setCompanyName(input);
    setCompanyNameValid(input.length > 0);
  };

  const handleCompanyId = (e) => {
    const input = e.target.value;
    setCompanyId(input);
    setCompanyIdValid(input.length > 0);
  };

  const handleManagerName = (e) => {
    const input = e.target.value;
    setManagerName(input);
    setManagerNameValid(input.length > 0);
  };

  const handleAddress = (e) => {
    const input = e.target.value;
    setAddress(input);
    setAddressValid(input.length > 0);
  };

  const onClickConfirmButton = () => {
    fetch("http://localhost:8080/auth/company/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        companyName: companyName,
        password: password,
        companyId: companyId,
        managerName: managerName,
        address: address,
        email: email,
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("=============");
      console.log("백엔드: ", res);

      if (res.result) {
        alert("회원가입이 정상적으로 되었습니다");
        window.location.href = "http://localhost:3000/auth/company/login";
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    })
    .catch(error => {
      console.error('백엔드와의 통신 중 오류 발생:', error);
    });
  };

  const handleDoubleCheckCompanyEmail = () => {
    if (email.trim().length === 0) {
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
        setEmailCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
      } else {
        alert("이미 사용 중인 이메일입니다.");
        setEmailValid(false);
        setEmailCheckSuccess(false); // 중복 확인 실패 시 상태 업데이트
      }
      setDoubleCheckCompanyEmail(true); // API 응답 후에 설정
    })
    .catch(error => {
      console.error('이메일 중복 확인 중 오류 발생:', error);
    });
  };

  const handleDoubleCheckCompanyId = () => {
    if (companyId.trim().length === "") {
      alert("사업자번호를 입력해주세요.");
      setCompanyIdValid(false);
      return;
    }

    fetch("http://localhost:8080/user/signup/check-nickname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({ 
        companyId: companyId 
      }),
    })
    .then((res) => res.json())
    .then(res => {
      console.log("=============");
      console.log("사업자번호 중복 확인 결과: ", res);

      if (res.result) {
        alert("등록 가능한 사업자번호입니다.");
        setCompanyIdValid(true);
        setCompanyIdCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
      } else {
        alert("등록 불가능한 사업자번호입니다.");
        setCompanyIdValid(false);
        setCompanyIdCheckSuccess(false); // 중복 확인 실패 시 상태 업데이트
      }
      setDoubleCheckCompanyId(true);
    })
    .catch(error => {
      console.error('사업자번호 중복 확인 중 오류 발생:', error);
    });
  };

  return (
    <div className="page">
      <Link to="/auth/company/login">
        <button className="backButton"><FiX /></button>
      </Link>

      <div className="titleWrap">
        기업 회원가입
      </div>

      <div className="contentWrap">
        <div className="inputTitle">회사명</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="회사명을 입력해주세요"
            value={companyName}
            onChange={handleCompanyName}
          />
        </div>
        {(!companyNameValid && companyName.length > 0) && (
          <div className="errorMessageWrap">회사명을 입력해주세요.</div>
        )}

        <div className="inputTitle">이메일 주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="example@gmail.com"
            value={email}
            onChange={handleEmail}
          />
          <div className='check-companyEmail'>
            <button 
              onClick={handleDoubleCheckCompanyEmail}
              className={`checkButton ${emailCheckSuccess ? 'success' : ''}`}
            >
              중복확인
            </button>
          </div>
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

        <div className="inputTitle">사업자번호</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="123456789"
            value={companyId}
            onChange={handleCompanyId}
          />
          <div className='check-companyId'>
            <button 
              onClick={handleDoubleCheckCompanyId}
              className={`checkButton ${companyIdCheckSuccess ? 'success' : ''}`}
            >
              중복확인
            </button>
          </div>
        </div>
        {(!companyIdValid && companyId.length > 0) && (
          <div className="errorMessageWrap">사업자번호를 입력해주세요.</div>
        )}

        <div className="inputTitle">대표자명</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="대표자명을 입력해주세요"
            value={managerName}
            onChange={handleManagerName}
          />
        </div>
        {(!managerNameValid && managerName.length > 0) && (
          <div className="errorMessageWrap">대표자명을 입력해주세요.</div>
        )}

        <div className="inputTitle">주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="주소를 입력해주세요"
            value={address}
            onChange={handleAddress}
          />
        </div>
        {(!addressValid && address.length > 0) && (
          <div className="errorMessageWrap">주소를 입력해주세요.</div>
        )}

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
