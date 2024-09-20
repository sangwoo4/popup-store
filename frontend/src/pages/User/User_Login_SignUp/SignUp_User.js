import React, { useEffect, useState } from 'react';
import './SignUp_User.css';
import API_BASE_URL from '../../../URL_API';

export default function SignUp_User() {
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

  const [emailCheckSuccess, setEmailCheckSuccess] = useState(false);
  const [phoneCheckSuccess, setPhoneCheckSuccess] = useState(false);
  const [nicknameCheckSuccess, setNicknameCheckSuccess] = useState(false);

  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [categorySelections, setCategorySelections] = useState([]);
  const [mapx, setMapx] = useState('');
  const [mapy, setMapy] = useState('');
  
  const maxCategories = 5;
  const categories = [ "화장품", "캐릭터", "도서/음반", "패션", "인테리어", "전시/체험", "향수", "음식",
                        "주류", "음료", "문구", "가정", "생활용품", "스포츠", "게임", "전자제품", "인물",
                        "건강/웰빙","자동차", "식물", "여행/레저", "드라마/영화", "가전제품"
                      ];

  useEffect(() => {
    if (
      emailValid &&
      passwordValid &&
      confirmPasswordValid &&
      phoneValid &&
      birthValid &&
      nameValid &&
      nicknameValid &&
      doubleCheckEmail &&
      doubleCheckPhone &&
      doubleCheckNickname
    ) {
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
    setBirthValid(input.length === 8);
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

  const handleDoubleCheckEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 정규 표현식
    if (email.trim().length === 0) {
      alert("이메일을 입력해주세요.");
      setEmailValid(false);
      return;
    }
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      setEmailValid(false);
      return;
    }
    fetch(`${API_BASE_URL}/auth/user/signup/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({ email: email }),
    })
      .then((res) => res.json())
      .then(res => {
        if (res.result) {
          alert("사용 가능한 이메일입니다.");
          setEmailValid(true);
          setEmailCheckSuccess(true);
        } else {
          alert("이미 사용 중인 이메일입니다.");
          setEmailValid(false);
          setEmailCheckSuccess(false);
        }
        setDoubleCheckEmail(true);
      })
      .catch(error => {
        console.error('이메일 중복 확인 중 오류 발생:', error);
        setEmailValid(false);
      });
  };
  
  const handleDoubleCheckPhone = () => {
    const phoneRegex = /^[0-9]{10,11}$/; // 전화번호 형식 정규 표현식
    if (phone.trim().length === 0) {
      alert("전화번호를 입력해주세요.");
      setPhoneValid(false);
      return;
    }
    if (!phoneRegex.test(phone)) {
      alert("전화번호는 10~11자리 숫자로 입력해주세요.");
      setPhoneValid(false);
      return;
    }
    fetch(`${API_BASE_URL}/auth/user/signup/check-phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({ phone: phone }),
    })
      .then((res) => res.json())
      .then(res => {
        if (res.result) {
          alert("사용 가능한 전화번호입니다.");
          setPhoneValid(true);
          setPhoneCheckSuccess(true);
        } else {
          alert("이미 사용 중인 전화번호입니다.");
          setPhoneValid(false);
          setPhoneCheckSuccess(false);
        }
        setDoubleCheckPhone(true);
      })
      .catch(error => {
        console.error('전화번호 중복 확인 중 오류 발생:', error);
        setPhoneValid(false);
      });
  };
  
  const handleDoubleCheckNickname = () => {
    if (nickname.trim().length === 0) {
      alert("닉네임을 입력해주세요.");
      setNicknameValid(false);
      return;
    }
    fetch(`${API_BASE_URL}/auth/user/signup/check-nickname`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;"
      },
      body: JSON.stringify({ nickname: nickname }),
    })
      .then((res) => res.json())
      .then(res => {
        if (res.result) {
          alert("사용 가능한 닉네임입니다.");
          setNicknameValid(true);
          setNicknameCheckSuccess(true);
        } else {
          alert("이미 사용 중인 닉네임입니다.");
          setNicknameValid(false);
          setNicknameCheckSuccess(false);
        }
        setDoubleCheckNickname(true);
      })
      .catch(error => {
        console.error('닉네임 중복 확인 중 오류 발생:', error);
        setNicknameValid(false);
      });
  };

  const onClickConfirmButton = () => {
    // 로그 추가: 버튼 클릭 여부 확인
    console.log("가입하기 버튼이 클릭되었습니다.");
  
    // 중복 확인 상태 출력
    console.log("중복 확인 상태:", {
      doubleCheckEmail,
      doubleCheckPhone,
      doubleCheckNickname
    });
  
    // 중복 확인이 완료되지 않았다면 경고
    if (!doubleCheckEmail || !doubleCheckPhone || !doubleCheckNickname) {
      alert("중복확인을 모두 완료해주세요.");
      return;
    }
  
    // 데이터 준비
    const requestData = {
      email: email,
      password: password,
      username: username,
      gender: gender,
      birth: birth,
      phone: phone,
      nickname: nickname,
      postcode: postcode,
      address: address,
      detailAddress: detailAddress,
      mapx: coordinates.mapx,
      mapy: coordinates.mapy,
      categories: categorySelections.map(cat => ({ category: cat })),
    };
  
    // 데이터 로그
    console.log("서버로 전송할 데이터:", JSON.stringify(requestData, null, 2));

  
    // 서버에 데이터 전송
    fetch(`${API_BASE_URL}/auth/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(requestData),
    })
      .then((res) => res.json())
      .then(res => {
        console.log("백엔드 응답:", res);
  
        if (res.result) {
          alert("회원가입이 정상적으로 되었습니다");
          window.location.href = "http://localhost:3000/auth/user/login";
        } else {
          alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
      })
      .catch(error => {
        console.error('백엔드와의 통신 중 오류 발생:', error);
      });
  };

  // 네이버 지도 좌표 변환 코드 (다음 주소에서 주소를 받아 네이버 api에서 좌표 변환)
  const fetchCoordinates = (address) => {
    if (window.naver && window.naver.maps && window.naver.maps.Service) {
      const geocoder = window.naver.maps.Service;

      geocoder.geocode({ address: address }, (status, response) => {
        console.log('Geocode response:', response); // 응답 객체 전체 출력
        if (status === window.naver.maps.Service.Status.OK) {
          if (response.result && response.result.items && response.result.items.length > 0) {
            const item = response.result.items[0];
            if (item.point) {
              const x = item.point.x;
              const y = item.point.y;
              // 소수점 제거
              const formattedX = x.toString().replace('.', '');
              const formattedY = y.toString().replace('.', '');
              console.log(`좌표 변환 성공: x = ${formattedX}, y = ${formattedY}`);
              setCoordinates({ mapx: formattedX, mapy: formattedY });
            } else {
              console.error('응답에서 좌표 포인트를 찾을 수 없습니다.');
              setCoordinates({ mapx: '', mapy: '' });
            }
          } else {
            console.error('응답에서 항목을 찾을 수 없습니다.');
            setCoordinates({ mapx: '', mapy: '' });
          }
        } else {
          console.error('주소로부터 좌표를 가져오는데 실패했습니다.', status);
          setCoordinates({ mapx: '', mapy: '' });
        }
      });
    } else {
      console.error('네이버 지도 API를 로드하지 못했습니다.');
    }
  };
  

  const handlePostcodeSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = '';
        if (data.userSelectedType === 'R') {
          addr = data.roadAddress;
        } else {
          addr = data.jibunAddress;
        }
        setPostcode(data.zonecode);
        setAddress(addr);
        
        // 여기에서 주소를 좌표로 변환하는 함수를 호출
        fetchCoordinates(addr);
      }
    }).open();
  };
  

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCategorySelection = (category) => {
    if (categorySelections.includes(category)) {
      setCategorySelections(categorySelections.filter(c => c !== category));
    } else if (categorySelections.length < maxCategories) {
      setCategorySelections([...categorySelections, category]);
    }
  };

  return (
    <div className="page">
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
          <div className='check-useremail'>
            <button
              onClick={handleDoubleCheckEmail}
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
          <div className='check-userphone'>
            <button
              onClick={handleDoubleCheckPhone}
              className={`checkButton ${phoneCheckSuccess ? 'success' : ''}`}
            >
              중복확인
            </button>
          </div>
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
          <div className='check-usernickname'>
            <button
              onClick={handleDoubleCheckNickname}
              className={`checkButton ${nicknameCheckSuccess ? 'success' : ''}`}
            >
              중복확인
            </button>
          </div>
        </div>
        {(!nicknameValid && nickname.length > 0) && (
          <div className="errorMessageWrap">닉네임은 10자 이하로 입력해주세요.</div>
        )}

        <div className="inputTitle">성별</div>
        <div className="genderInputs">
          <label>
            <input
              type="radio"
              value="male"
              checked={gender === 'male'}
              onChange={handleGender}
            />
            남성
          </label>
          <label>
            <input
              type="radio"
              value="female"
              checked={gender === 'female'}
              onChange={handleGender}
            />
            여성
          </label>
        </div>

        <div className="inputTitle">우편번호</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="우편번호를 입력해주세요"
            value={postcode}
            readOnly
          />
          <button onClick={handlePostcodeSearch}>우편번호 찾기</button>
        </div>

        <div className="inputTitle">주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="주소를 입력해주세요"
            value={address}
            readOnly
          />
        </div>

        <div className="inputTitle">상세주소</div>
        <div className="inputWrap">
          <input
            className="input"
            type="text"
            placeholder="상세주소를 입력해주세요"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
          />
        </div>

        <div className="inputTitle">선호 카테고리 (최대 5개)</div>
        <div className="categoriesWrap">
          {categories.map((category) => (
            <button
              key={category}
              className={`categoryButton ${categorySelections.includes(category) ? 'selected' : ''}`}
              onClick={() => handleCategorySelection(category)}
            >
              {category}
            </button>
          ))}
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





// // 24.08.04 주소, 카테고리 입력 전
// import React, { useEffect, useState } from 'react';
// import './SignUp.css';

// export default function SignUp() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [emailValid, setEmailValid] = useState(false);
//   const [passwordValid, setPasswordValid] = useState(false);
//   const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

//   const [gender, setGender] = useState('');
//   const [birth, setBirth] = useState('');
//   const [birthValid, setBirthValid] = useState(false);
//   const [phone, setPhone] = useState('');
//   const [phoneValid, setPhoneValid] = useState(false);
//   const [notAllow, setNotAllow] = useState(true);
//   const [nickname, setNickname] = useState('');
//   const [username, setUsername] = useState('');
//   const [nameValid, setNameValid] = useState(false);
//   const [nicknameValid, setNicknameValid] = useState(false);

//   const [doubleCheckEmail, setDoubleCheckEmail] = useState(false);
//   const [doubleCheckPhone, setDoubleCheckPhone] = useState(false);
//   const [doubleCheckNickname, setDoubleCheckNickname] = useState(false);

//   const [emailCheckSuccess, setEmailCheckSuccess] = useState(false);
//   const [phoneCheckSuccess, setPhoneCheckSuccess] = useState(false);
//   const [nicknameCheckSuccess, setNicknameCheckSuccess] = useState(false);

//   useEffect(() => {
//     if (
//       emailValid &&
//       passwordValid && 
//       confirmPasswordValid && 
//       phoneValid && 
//       birthValid && 
//       nameValid && 
//       nicknameValid) {
//       setNotAllow(false);
//     } else {
//       setNotAllow(true);
//     }
//   }, [
//     emailValid, 
//     passwordValid, 
//     confirmPasswordValid, 
//     phoneValid, 
//     birthValid, 
//     nameValid, 
//     nicknameValid, 
//     doubleCheckEmail, 
//     doubleCheckPhone, 
//     doubleCheckNickname]);

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
//       /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/; // 8~20자 영문, 숫자, 특수문자 포함
//     setPasswordValid(regex.test(newPassword));
//     setConfirmPasswordValid(confirmPassword === newPassword);
//   };

//   const handleConfirmPassword = (e) => {
//     const newConfirmPassword = e.target.value;
//     setConfirmPassword(newConfirmPassword);
//     setConfirmPasswordValid(newConfirmPassword === password);
//   };

//   const handleGender = (e) => {
//     setGender(e.target.value);
//   };

//   const handleBirth = (e) => {
//     const input = e.target.value;
//     setBirth(input);
//     setBirthValid(input.length === 8);
//   };

//   const handlePhone = (e) => {
//     const input = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
//     setPhone(input);
//     setPhoneValid(input.length === 11);
//   };

//   const handleNickname = (e) => {
//     const input = e.target.value;
//     setNickname(input);
//     setNicknameValid(input.length <= 10);
//   };

//   const handleUsername = (e) => {
//     const input = e.target.value;
//     setUsername(input);
//     setNameValid(input.length > 0);
//   };

//   const onClickConfirmButton = () => {
//     if (!doubleCheckEmail || !doubleCheckPhone || !doubleCheckNickname) {
//       alert("중복확인을 모두 완료해주세요.");
//       return;
//     }

//     fetch("http://localhost:8080/auth/user/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type":"application/json; charset=utf-8"
//       },
//       body: JSON.stringify({
//         email: email,
//         password: password,
//         username: username,
//         gender: gender,
//         birth: birth,
//         phone: phone,
//         nickname: nickname,
//       }),
//     })
//     .then((res) => res.json())
//     .then(res => {
//       console.log("=============");
//       console.log("백엔드: ", res);
  
//       if (res.result) {
//         alert("회원가입이 정상적으로 되었습니다");
//         window.location.href = "http://localhost:3000/Login";
//       } else {
//         alert("회원가입에 실패했습니다. 다시 시도해주세요.");
//       }
//     })
//     .catch(error => {
//       console.error('백엔드와의 통신 중 오류 발생:', error);
//     });
//   };

//   const handleDoubleCheckEmail = () => {
//     if (email.trim().length === "") {
//       alert("이메일을 입력해주세요.");
//       setEmailValid(false);
//       return;
//     }
//     fetch("http://localhost:8080/auth/user/signup/check-email", {
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
//       setDoubleCheckEmail(true); // API 응답 후에 설정
//     })
//     .catch(error => {
//       console.error('이메일 중복 확인 중 오류 발생:', error);
//       setEmailValid(false);
//     });
//   };
  
//   const handleDoubleCheckPhone = () => {
//     if (phone.trim().length === "") {
//       alert("전화번호를 입력해주세요.");
//       setPhoneValid(false);
//       return;
//     }
//     fetch("http://localhost:8080/auth/user/signup/check-phone", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json;"
//       },
//       body: JSON.stringify({
//         phone: phone
//       }),
//     })
//     .then((res) => res.json())
//     .then(res => {
//       console.log("=============");
//       console.log("전화번호 중복 확인 결과: ", res);
  
//       if (res.result) {
//         alert("사용 가능한 전화번호입니다.");
//         setPhoneValid(true);
//         setPhoneCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
//       } else {
//         alert("이미 사용 중인 전화번호입니다.");
//         setPhoneValid(false);
//         setPhoneCheckSuccess(false); // 중복 확인 성공 시 상태 업데이트
//       }
//       setDoubleCheckPhone(true);
//     })
//     .catch(error => {
//       console.error('전화번호 중복 확인 중 오류 발생:', error);
//       setPhoneValid(false);
//     });
//   };

//   const handleDoubleCheckNickname = () => {
//     if (nickname.trim().length === "") {
//       alert("닉네임을 입력해주세요.");
//       setNicknameValid(false);
//       return;
//     }
//     fetch("http://localhost:8080/auth/user/signup/check-nickname", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json;"
//       },
//       body: JSON.stringify({
//         nickname: nickname
//       }),
//     })
//     .then((res) => res.json())
//     .then(res => {
//       console.log("=============");
//       console.log("닉네임 중복 확인 결과: ", res);
  
//       if (res.result) {
//         alert("사용 가능한 닉네임입니다.");
//         setNicknameValid(true);
//         setNicknameCheckSuccess(true); // 중복 확인 성공 시 상태 업데이트
//       } else {
//         alert("이미 사용 중인 닉네임입니다.");
//         setNicknameValid(false);
//         setNicknameCheckSuccess(false); // 중복 확인 성공 시 상태 업데이트
//       }
//       setDoubleCheckNickname(true);
//     })
//     .catch(error => {
//       console.error('닉네임 중복 확인 중 오류 발생:', error);
//       setNicknameValid(false);
//     });
//   };

//   return (
//     <div className="page">
//       <div className="titleWrap">
//         회원가입
//       </div>

//       <div className="contentWrap">
//         <div className="inputTitle">이메일 주소</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="example@gmail.com"
//             value={email}
//             onChange={handleEmail}
//           />
//           <div className='check-useremail'>
//             <button
//               onClick={handleDoubleCheckEmail}
//               // disabled={!emailValid}
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

//         <div className="inputTitle">이름</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="이름을 입력해주세요"
//             value={username}
//             onChange={handleUsername}
//           />
//         </div>
//         {(!nameValid && username.length > 0) && (
//           <div className="errorMessageWrap">이름을 입력해주세요.</div>
//         )}

//         <div className="inputTitle">생년월일</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="YYYYMMDD"
//             value={birth}
//             onChange={handleBirth}
//           />
//         </div>
//         {(!birthValid && birth.length > 0) && (
//           <div className="errorMessageWrap">생년월일을 정확히 입력해주세요.</div>
//         )}

//         <div className="inputTitle">전화번호</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="전화번호를 입력해주세요"
//             value={phone}
//             onChange={handlePhone}
//           />
//           <div className='check-userphone'>
//             <button
//               onClick={handleDoubleCheckPhone}
//               // disabled={!phoneValid}
//               className={`checkButton ${phoneCheckSuccess ? 'success' : ''}`}
//             >
//               중복확인
//             </button>
//           </div>
//         </div>
//         {(!phoneValid && phone.length > 0) && (
//           <div className="errorMessageWrap">전화번호를 정확히 입력해주세요.</div>
//         )}

//         <div className="inputTitle">닉네임</div>
//         <div className="inputWrap">
//           <input
//             className="input"
//             type="text"
//             placeholder="닉네임을 입력해주세요"
//             value={nickname}
//             onChange={handleNickname}
//           />
//           <div className='check-usernickname'>
//             <button
//               onClick={handleDoubleCheckNickname}
//               // disabled={!nicknameValid}
//               className={`checkButton ${nicknameCheckSuccess ? 'success' : ''}`}
//             >
//               중복확인
//             </button>
//           </div>
//         </div>
//         {(!nicknameValid && nickname.length > 0) && (
//           <div className="errorMessageWrap">닉네임은 10자 이하로 입력해주세요.</div>
//         )}

//         <div className="inputTitle">성별</div>
//         <div className="genderInputs">
//           <label>
//             <input
//               type="radio"
//               value="M"
//               checked={gender === 'M'}
//               onChange={handleGender}
//             />
//             남성
//           </label>
//           <label>
//             <input
//               type="radio"
//               value="F"
//               checked={gender === 'F'}
//               onChange={handleGender}
//             />
//             여성
//           </label>
//         </div>

//         <button
//           className="bottomButton"
//           disabled={notAllow}
//           onClick={onClickConfirmButton}
//         >
//           가입하기
//         </button>
//       </div>
//     </div>
//   );
// }
