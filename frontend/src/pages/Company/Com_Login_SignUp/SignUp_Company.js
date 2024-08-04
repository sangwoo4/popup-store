/*
  24.07.22 수정 사항
  - 이메일, 사업자번호 중복확인 코드 추가
  - 예정: 다음 주소찾기 api 가져오기 수정 중
*/
import React, { useState, useEffect } from 'react';
import './SignUp_Company.css';
import DaumPostcode from 'react-daum-postcode';

export default function SignUp_Company() {
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [managerName, setManagerName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [companyNameValid, setCompanyNameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [companyIdValid, setCompanyIdValid] = useState(false);
  const [managerNameValid, setManagerNameValid] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [postcodeValid, setPostcodeValid] = useState(false);
  const [detailAddressValid, setDetailAddressValid] = useState(false);

  const [doubleCheckCompanyEmail, setDoubleCheckCompanyEmail] = useState(false);
  const [doubleCheckCompanyId, setDoubleCheckCompanyId] = useState(false);

  const [emailCheckSuccess, setEmailCheckSuccess] = useState(false);
  const [companyIdCheckSuccess, setCompanyIdCheckSuccess] = useState(false);

  const [notAllow, setNotAllow] = useState(true);
  const [showPostcodeModal, setShowPostcodeModal] = useState(false);

  useEffect(() => {
    if (
      companyNameValid &&
      passwordValid &&
      confirmPasswordValid &&
      emailValid &&
      companyIdValid &&
      managerNameValid &&
      addressValid &&
      postcodeValid &&
      detailAddressValid
    ) {
      setNotAllow(false);
    } else {
      setNotAllow(true);
    }
  }, [
    companyNameValid,
    passwordValid,
    confirmPasswordValid,
    emailValid,
    companyIdValid,
    managerNameValid,
    addressValid,
    postcodeValid,
    detailAddressValid,
    doubleCheckCompanyEmail,
    doubleCheckCompanyId
  ]);

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

  const handleDetailAddress = (e) => {
    const input = e.target.value;
    setDetailAddress(input);
    setDetailAddressValid(input.length > 0);
  };

  const handleAddressSearch = () => {
    setShowPostcodeModal(true);
  };

  const handleComplete = (data) => {
    let address = data.address;
    let extraAddress = '';
  
    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      address += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }
  
    setAddress(address);
    setPostcode(data.zonecode);
    
    // 업데이트 후 유효성 검사 상태 설정
    setAddressValid(address.trim().length > 0);
    setPostcodeValid(data.zonecode.trim() !== '');
    
    setShowPostcodeModal(false);
  };

  const onClickConfirmButton = () => {
    // 유효성 검사
    setAddressValid(address.trim().length > 0);
    setPostcodeValid(postcode.trim() !== '');
    setDetailAddressValid(detailAddress.trim().length > 0);
  
    if (addressValid && postcodeValid && detailAddressValid) {
      fetch("http://localhost:8080/auth/company/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          companyName: companyName,
          password: password,
          companyId: companyId,
          managerName: managerName,
          address: address,
          detailAddress: detailAddress,
          postcode: postcode,
          email: email,
        }),
      })
      .then((res) => res.json())
      .then(res => {
        console.log("=============");
        console.log("백엔드: ", res);
  
        if (res.result) {
          alert("회원가입이 정상적으로 되었습니다");
          // 페이지 이동을 위해 window.location.href를 설정합니다.
          window.location.href = "http://localhost:3000/auth/company/login";
        } else {
          console.error("회원가입 실패 사유: ", res.message || "Unknown error");
          alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
      })
      .catch(error => {
        console.error('백엔드와의 통신 중 오류 발생:', error);
      });
    } else {
      alert('모든 필드를 올바르게 입력해 주세요.');
    }
  };

  const handleDoubleCheckCompanyEmail = () => {
    if (!emailValid) {
      alert("유효한 이메일 형식이 아닙니다.");
      return;
    }

    fetch("http://localhost:8080/auth/company/signup/check-email", {
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
        setEmailCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
      } else {
        alert("이미 사용 중인 이메일입니다.");
        setEmailCheckSuccess(false); // 중복 확인 실패 시 상태 업데이트
      }
      setDoubleCheckCompanyEmail(true); // API 응답 후에 설정
    })
    .catch(error => {
      console.error('이메일 중복 확인 중 오류 발생:', error);
    });
  };

  const handleDoubleCheckCompanyId = () => {
    if (!companyIdValid) {
      alert("유효한 사업자번호 형식이 아닙니다.");
      return;
    }

    fetch("http://localhost:8080/auth/company/signup/check-companyid", {
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
        setCompanyIdCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
      } else {
        alert("등록 불가능한 사업자번호입니다.");
        setCompanyIdCheckSuccess(false); // 중복 확인 실패 시 상태 업데이트
      }
      setDoubleCheckCompanyId(true); // API 응답 후에 설정
    })
    .catch(error => {
      console.error('사업자번호 중복 확인 중 오류 발생:', error);
    });
  };

  const handleClosePostcodeModal = () => {
    setShowPostcodeModal(false);
  };

  return (
    <div className="signUp">
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

        <div className="inputTitle">우편번호</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="우편번호"
            value={postcode}
            readOnly
          />
          <button
            onClick={handleAddressSearch}
            className="searchButton"
          >
            주소찾기
          </button>
        </div>
        {(!postcodeValid && postcode.length > 0) && (
          <div className="errorMessageWrap">우편번호를 입력해주세요.</div>
        )}

        <div className="inputTitle">주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="주소"
            value={address}
            readOnly
          />
        </div>
        {(!addressValid && address.length > 0) && (
          <div className="errorMessageWrap">주소를 입력해주세요.</div>
        )}

        <div className="inputTitle">상세주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="상세주소를 입력해주세요"
            value={detailAddress}
            onChange={handleDetailAddress}
          />
        </div>
        {(!detailAddressValid && detailAddress.length > 0) && (
          <div className="errorMessageWrap">상세주소를 입력해주세요.</div>
        )}

        <button
          className="bottomButton"
          disabled={notAllow}
          onClick={onClickConfirmButton}
        >
          가입하기
        </button>
      </div>

      {showPostcodeModal && (
        <div className="postcodeModal">
          <button 
            className="closeButton"
            onClick={handleClosePostcodeModal}
          >
            X
          </button>
          <DaumPostcode onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
}







// // 24.07.22 이메일, 사업자번호 중복확인 코드 추가
// import React, { useState, useEffect } from 'react';
// import './SignUp_Company.css';
// import DaumPostcode from 'react-daum-postcode';

// export default function SignUp_Company() {
//   const [companyName, setCompanyName] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [email, setEmail] = useState('');
//   const [companyId, setCompanyId] = useState('');
//   const [managerName, setManagerName] = useState('');
//   const [address, setAddress] = useState('');
//   const [postcode, setPostcode] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');

//   const [companyNameValid, setCompanyNameValid] = useState(false);
//   const [passwordValid, setPasswordValid] = useState(false);
//   const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
//   const [emailValid, setEmailValid] = useState(false);
//   const [companyIdValid, setCompanyIdValid] = useState(false);
//   const [managerNameValid, setManagerNameValid] = useState(false);
//   const [addressValid, setAddressValid] = useState(false);
//   const [postcodeValid, setPostcodeValid] = useState(false);
//   const [detailAddressValid, setDetailAddressValid] = useState(false);

//   const [doubleCheckCompanyEmail, setDoubleCheckCompanyEmail] = useState(false);
//   const [doubleCheckCompanyId, setDoubleCheckCompanyId] = useState(false);

//   const [emailCheckSuccess, setEmailCheckSuccess] = useState(false);
//   const [companyIdCheckSuccess, setCompanyIdCheckSuccess] = useState(false);

//   const [notAllow, setNotAllow] = useState(true);
//   const [showPostcodeModal, setShowPostcodeModal] = useState(false);

//   useEffect(() => {
//     if (
//       companyNameValid &&
//       passwordValid &&
//       confirmPasswordValid &&
//       emailValid &&
//       companyIdValid &&
//       managerNameValid &&
//       addressValid &&
//       postcodeValid &&
//       detailAddressValid
//     ) {
//       setNotAllow(false);
//     } else {
//       setNotAllow(true);
//     }
//   }, [
//     companyNameValid,
//     passwordValid,
//     confirmPasswordValid,
//     emailValid,
//     companyIdValid,
//     managerNameValid,
//     addressValid,
//     postcodeValid,
//     detailAddressValid,
//     doubleCheckCompanyEmail,
//     doubleCheckCompanyId
//   ]);

//   const handleEmail = (e) => {
//     setEmail(e.target.value);
//     const regex =
//       /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
//     setEmailValid(regex.test(e.target.value));
//   };

//   const handlePassword = (e) => {
//     const newPassword = e.target.value;
//     setPassword(newPassword);
//     const regex =
//       /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/;
//     setPasswordValid(regex.test(newPassword));
//     setConfirmPasswordValid(confirmPassword === newPassword);
//   };

//   const handleConfirmPassword = (e) => {
//     const newConfirmPassword = e.target.value;
//     setConfirmPassword(newConfirmPassword);
//     setConfirmPasswordValid(newConfirmPassword === password);
//   };

//   const handleCompanyName = (e) => {
//     const input = e.target.value;
//     setCompanyName(input);
//     setCompanyNameValid(input.length > 0);
//   };

//   const handleCompanyId = (e) => {
//     const input = e.target.value;
//     setCompanyId(input);
//     setCompanyIdValid(input.length > 0);
//   };

//   const handleManagerName = (e) => {
//     const input = e.target.value;
//     setManagerName(input);
//     setManagerNameValid(input.length > 0);
//   };

//   const handleDetailAddress = (e) => {
//     const input = e.target.value;
//     setDetailAddress(input);
//     setDetailAddressValid(input.length > 0);
//   };

//   const handleAddressSearch = () => {
//     setShowPostcodeModal(true);
//   };

//   const handleComplete = (data) => {
//     let fullAddress = data.address;
//     let extraAddress = '';
  
//     if (data.addressType === 'R') {
//       if (data.bname !== '') {
//         extraAddress += data.bname;
//       }
//       if (data.buildingName !== '') {
//         extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
//       }
//       fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
//     }
  
//     setAddress(fullAddress);
//     setPostcode(data.zonecode);
    
//     // 업데이트 후 유효성 검사 상태 설정
//     setAddressValid(fullAddress.trim().length > 0);
//     setPostcodeValid(data.zonecode.trim() !== '');
    
//     setShowPostcodeModal(false);
//   };
  

//   const onClickConfirmButton = () => {
//     const fullAddress = address + ' ' + detailAddress;
//     setAddressValid(fullAddress.trim().length > 0);

//     if (postcode.trim() === '') {
//       setPostcodeValid(false);
//     }

//     // 디버깅을 위해 요청 전에 데이터 확인
//     console.log({
//     companyName,
//     password,
//     companyId,
//     managerName,
//     address: fullAddress,
//     detailAddress,
//     postcode,
//     email
//     });

//     if (addressValid && postcodeValid && detailAddressValid) {
//       fetch("http://localhost:8080/auth/company/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json; charset=utf-8"
//         },
//         body: JSON.stringify({
//           companyName: companyName,
//           password: password,
//           companyId: companyId,
//           managerName: managerName,
//           address: fullAddress,
//           detailAddress: detailAddress,
//           postcode: postcode,
//           email: email,
//         }),
//       })
//       .then((res) => res.json())
//       .then(res => {
//         console.log("=============");
//         console.log("백엔드: ", res);

//         if (res.result) {
//           alert("회원가입이 정상적으로 되었습니다");
//           window.location.href = "http://localhost:3000/auth/company/login";
//         } else {
//           console.error("회원가입 실패 사유: ", res.message || "Unknown error");
//           alert("회원가입에 실패했습니다. 다시 시도해주세요.");
//         }
//       })
//       .catch(error => {
//         console.error('백엔드와의 통신 중 오류 발생:', error);
//       });
//     } else {
//       alert('모든 필드를 올바르게 입력해 주세요.');
//     }
//     };

//   const handleDoubleCheckCompanyEmail = () => {
//     if (email.trim().length === 0) {
//       alert("이메일을 입력해주세요.");
//       setEmailValid(false);
//       return;
//     }

//     fetch("http://localhost:8080/auth/company/signup/check-email", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json;"
//       },
//       body: JSON.stringify({ 
//         email: email 
//       }),
//     })
//     .then((res) => res.json())
//     .then(res => {
//       console.log("=============");
//       console.log("이메일 중복 확인 결과: ", res);

//       if (res.result) {
//         alert("사용 가능한 이메일입니다.");
//         setEmailValid(true);
//         setEmailCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
//       } else {
//         alert("이미 사용 중인 이메일입니다.");
//         setEmailValid(false);
//         setEmailCheckSuccess(false); // 중복 확인 실패 시 상태 업데이트
//       }
//       setDoubleCheckCompanyEmail(true); // API 응답 후에 설정
//     })
//     .catch(error => {
//       console.error('이메일 중복 확인 중 오류 발생:', error);
//     });
//   };

//   const handleDoubleCheckCompanyId = () => {
//     if (companyId.trim().length === "") {
//       alert("사업자번호를 입력해주세요.");
//       setCompanyIdValid(false);
//       return;
//     }

//     fetch("http://localhost:8080/auth/company/signup/check-companyid", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json;"
//       },
//       body: JSON.stringify({ 
//         companyId: companyId 
//       }),
//     })
//     .then((res) => res.json())
//     .then(res => {
//       console.log("=============");
//       console.log("사업자번호 중복 확인 결과: ", res);

//       if (res.result) {
//         alert("등록 가능한 사업자번호입니다.");
//         setCompanyIdValid(true);
//         setCompanyIdCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
//       } else {
//         alert("등록 불가능한 사업자번호입니다.");
//         setCompanyIdValid(false);
//         setCompanyIdCheckSuccess(false); // 중복 확인 실패 시 상태 업데이트
//       }
//       setDoubleCheckCompanyId(true);
//     })
//     .catch(error => {
//       console.error('사업자번호 중복 확인 중 오류 발생:', error);
//     });
//   };

//   const handleClosePostcodeModal = () => {
//     setShowPostcodeModal(false);
//   };

//   return (
//     <div className="signUp">
//       <div className="titleWrap">
//         기업 회원가입
//       </div>

//       <div className="contentWrap">
//         <div className="inputTitle">회사명</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="회사명을 입력해주세요"
//             value={companyName}
//             onChange={handleCompanyName}
//           />
//         </div>
//         {(!companyNameValid && companyName.length > 0) && (
//           <div className="errorMessageWrap">회사명을 입력해주세요.</div>
//         )}

//         <div className="inputTitle">이메일 주소</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="example@gmail.com"
//             value={email}
//             onChange={handleEmail}
//           />
//           <div className='check-companyEmail'>
//             <button 
//               onClick={handleDoubleCheckCompanyEmail}
//               className={`checkButton ${emailCheckSuccess ? 'success' : ''}`}
//             >
//               중복확인
//             </button>
//           </div>
//         </div>
//         {(!emailValid && email.length > 0) && (
//           <div className="errorMessageWrap">올바른 이메일을 입력해주세요.</div>
//         )}

//         <div className="inputTitle" style={{ marginTop: '26px' }}>비밀번호</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="password"
//             placeholder="영문, 숫자, 특수문자 포함 8자 이상"
//             value={password}
//             onChange={handlePassword}
//           />
//         </div>
//         {(!passwordValid && password.length > 0) && (
//           <div className="errorMessageWrap">영문, 숫자, 특수문자 포함 8자 이상 입력해주세요.</div>
//         )}

//         <div className="inputTitle">비밀번호 확인</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="password"
//             placeholder="비밀번호를 다시 입력해주세요"
//             value={confirmPassword}
//             onChange={handleConfirmPassword}
//           />
//         </div>
//         {(!confirmPasswordValid && confirmPassword.length > 0) && (
//           <div className="errorMessageWrap">비밀번호가 일치하지 않습니다.</div>
//         )}

//         <div className="inputTitle">사업자번호</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="123456789"
//             value={companyId}
//             onChange={handleCompanyId}
//           />
//           <div className='check-companyId'>
//             <button 
//               onClick={handleDoubleCheckCompanyId}
//               className={`checkButton ${companyIdCheckSuccess ? 'success' : ''}`}
//             >
//               중복확인
//             </button>
//           </div>
//         </div>
//         {(!companyIdValid && companyId.length > 0) && (
//           <div className="errorMessageWrap">사업자번호를 입력해주세요.</div>
//         )}

//         <div className="inputTitle">대표자명</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="대표자명을 입력해주세요"
//             value={managerName}
//             onChange={handleManagerName}
//           />
//         </div>
//         {(!managerNameValid && managerName.length > 0) && (
//           <div className="errorMessageWrap">대표자명을 입력해주세요.</div>
//         )}

//         <div className="inputTitle">우편번호</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="우편번호"
//             value={postcode}
//             readOnly
//           />
//           <button 
//             onClick={handleAddressSearch}
//             className="searchButton"
//           >
//             주소찾기
//           </button>
//         </div>
//         {(!postcodeValid && postcode.length > 0) && (
//           <div className="errorMessageWrap">우편번호를 입력해주세요.</div>
//         )}

//         <div className="inputTitle">주소</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="주소"
//             value={address}
//             readOnly
//           />
//         </div>
//         {(!addressValid && address.length > 0) && (
//           <div className="errorMessageWrap">주소를 입력해주세요.</div>
//         )}

//         <div className="inputTitle">상세주소</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="상세주소를 입력해주세요"
//             value={detailAddress}
//             onChange={handleDetailAddress}
//           />
//         </div>
//         {(!detailAddressValid && detailAddress.length > 0) && (
//           <div className="errorMessageWrap">상세주소를 입력해주세요.</div>
//         )}

//         <button
//           className="bottomButton"
//           disabled={notAllow}
//           onClick={onClickConfirmButton}
//         >
//           가입하기
//         </button>
//       </div>

//       {showPostcodeModal && (
//         <div className="postcodeModal">
//           <button 
//             className="closeButton"
//             onClick={handleClosePostcodeModal}
//           >
//             X
//           </button>
//           <DaumPostcode onComplete={handleComplete} />
//         </div>
//       )}
//     </div>
//   );
// }
