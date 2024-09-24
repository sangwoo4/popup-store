
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DaumPostcode from 'react-daum-postcode';
import API_BASE_URL from '../../../URL_API';
import './Edit_Info_User.css';

const Edit_Info_User = () => {
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [password, setPassword] = useState("");
  const [isPasswordMatched, setIsPasswordMatched] = useState(false);

  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [birth, setBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [category, setCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPostcodeModal, setShowPostcodeModal] = useState(false);

  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const maxCategories = 5;
  const [categorySelections, setCategorySelections] = useState([]);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const allCategories = [
    "화장품", "캐릭터", "도서/음반", "패션", "인테리어", "전시/체험", "향수", "음식",
    "주류", "음료", "문구", "가정", "생활용품", "스포츠", "게임", "전자제품", "인물",
    "건강/웰빙", "자동차", "식물", "여행/레저", "드라마/영화", "가전제품"
  ];
  const navigate = useNavigate();

  // 비밀번호 확인 요청 함수
  const handlePasswordCheck = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/mypage/matchpwd`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.result === true) {
        alert("비밀번호가 확인되었습니다.");
        setIsPasswordMatched(true);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
        setIsPasswordMatched(false);
      }
    } catch (error) {
      console.error("비밀번호 확인 중 오류 발생:", error);
      alert("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/mypage/getinfo`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log("Fetched User Data:", data); // Log fetched data

          if (data.result && data.data) {
            const userData = data.data;

            setUserId(userData.userId || '');
            setEmail(userData.email || '');
            setNickname(userData.nickname || '');
            setBirth(userData.birth || '');
            setGender(userData.gender || '');
            setPhone(userData.phone || '');
            setUsername(userData.username || '');
            setPostcode(userData.postcode || '');
            setAddress(userData.address || '');
            setDetailAddress(userData.detailAddress || '');
            setRoadAddress(userData.roadAddress || '');
            setAddress(userData.address || '');

            setCategories(userData.categories.map(cat => cat.category));
            setCoordinates({ mapx: userData.mapx, mapy: userData.mapy });
          }
        } catch (error) {
          console.error('Error fetching popup data:', error);
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);


  const handleEditInfo = async () => {
    const token = localStorage.getItem("token");

    const userData = {
      // userId,
      // email,
      // password,
      nickname,
      // birth,
      // gender,
      phone,
      // username,
      postcode,
      address,
      detailAddress,
      mapx: coordinates.mapx,
      mapy: coordinates.mapy,
      roadAddress,
      // categories: category.map(cat => ({ category: cat.category })),
      categories: categories.map(cat => ({ category: cat })),
    }

    console.log("Data to be sent:", userData);

    try {
      const response = await fetch(`${API_BASE_URL}/mypage/editinfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log("Response status:", response.status); // 상태 코드 로그

      if (response.ok) {
        alert("회원정보가 성공적으로 수정되었습니다.");
        navigate("/auth/user/mypage");
      } else {
        alert("회원정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원정보 수정 중 오류 발생:", error);
      alert("회원정보 수정 중 오류가 발생했습니다.");
    }
  };

  const togglePasswordChange = () => {
    setShowPasswordChange(!showPasswordChange);
  };

  // 새로운 비밀번호 입력 핸들러
  const handleNewPasswordChange = (e) => {
    const newPassword = e.target.value;
    setNewPassword(newPassword);
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/;
    setPasswordValid(regex.test(newPassword));
    setConfirmPasswordValid(confirmPassword === newPassword);
  };

  // 비밀번호 확인 입력 핸들러
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setConfirmPasswordValid(newConfirmPassword === newPassword);
  };

  // 패스워드 변경 체크 수정중----------------------------
  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");

    if (!passwordValid) {
      alert("새 비밀번호 입력이 올바르지 않습니다.");
      return;
    }
    if (!confirmPasswordValid) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/mypage/changepwd`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const result = await response.json();

      if (response.ok && result.result) {
        alert("비밀번호가 변경되었습니다.");
        setShowPasswordChange(false);
      } else {
        alert("현재 비밀번호가 일치하지 않습니다."); // 서버에서의 실패에 대한 메시지
      }
    } catch (error) {
      console.error("비밀번호 변경 중 오류 발생:", error);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };
  // 패스워드 변경 체크 수정중----------------------------
  const handleEditInfoAndPasswordChange = async () => {
    // 일반 회원정보 수정 호출
    await handleEditInfo();

    // 비밀번호가 변경될 경우에만 비밀번호 변경 호출
    if (newPassword && confirmPasswordValid) {
      await handlePasswordChange();
    }
  };



  const handleAddressSearch = (e) => {
    e.preventDefault();
    setShowPostcodeModal(true);
  };

  const handlePostcodeComplete = (data) => {
    const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
    setPostcode(data.zonecode);
    setAddress(data.jibunAddress);
    setRoadAddress(data.roadAddress);
    fetchCoordinates(data.roadAddress);
    setShowPostcodeModal(false);
  };

  const fetchCoordinates = (address) => {
    if (window.naver && window.naver.maps && window.naver.maps.Service) {
      const geocoder = window.naver.maps.Service;

      geocoder.geocode({ address: address }, (status, response) => {
        if (status === window.naver.maps.Service.Status.OK) {
          if (response.result && response.result.items && response.result.items.length > 0) {
            const item = response.result.items[0];
            if (item.point) {
              const x = item.point.x;
              const y = item.point.y;
              const formattedX = x.toString().replace('.', '');
              const formattedY = y.toString().replace('.', '');
              setCoordinates({ mapx: formattedX, mapy: formattedY });
            } else {
              setCoordinates({ mapx: '', mapy: '' });
            }
          } else {
            setCoordinates({ mapx: '', mapy: '' });
          }
        } else {
          setCoordinates({ mapx: '', mapy: '' });
        }
      });
    } else {
      console.error('네이버 지도 API를 로드하지 못했습니다.');
    }
  };

  const toggleCategorySelection = () => {
    setShowCategorySelection(!showCategorySelection);
  };

  const handleCategorySelection = (category) => {
    if (categorySelections.includes(category)) {
      setCategorySelections(categorySelections.filter(c => c !== category));
    } else if (categorySelections.length < 5) {
      setCategorySelections([...categorySelections, category]);
    }
  };

  const handleCategoryChangeComplete = () => {
    console.log("새 카테고리 배열:", categorySelections);
    setCategories(categorySelections); // 카테고리 배열 업데이트
    setShowCategorySelection(false); // 카테고리 선택창 닫기
  };


  return (
    <div>
      {/* 비밀번호 확인창 */}
      {!isPasswordMatched && (
        <div className="modal-password-confirm">
          <h2>비밀번호 확인</h2>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePasswordCheck(); // 엔터키 입력 시 비밀번호 확인 함수 호출
              }
            }}
          />
          <button onClick={handlePasswordCheck}>비밀번호 확인</button>
        </div>
      )}

      {/* 비밀번호가 일치하면 회원정보 수정 폼을 표시 */}
      {isPasswordMatched && (
        <div className="editInfo">
          <h2>회원정보 수정</h2>
          <form onSubmit={handleEditInfo}>
            <label>
              닉네임:
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>
            <label>
              이메일:
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
              />
            </label>


            {/*비밀번호 변경 토글 수정중*/}
            <button type="button" onClick={togglePasswordChange}>비밀번호 변경하기</button>
            {showPasswordChange && (
              <div>
                <label>
                  현재 비밀번호:
                  <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </label>

                <label>
                  새로운 비밀번호:
                  <input
                    className="input"
                    type="password"
                    placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                  />
                </label>
                {(!passwordValid && newPassword.length > 0) && (
                  <div className="errorMessageWrap">영문, 숫자, 특수문자 포함 8자 이상 입력해주세요.</div>
                )}

                <div className="inputTitle">비밀번호 확인</div>
                <div className="inputWrap">
                  <input
                    className="input"
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                </div>
                {(!confirmPasswordValid && confirmPassword.length > 0) && (
                  <div className="errorMessageWrap">비밀번호가 일치하지 않습니다.</div>
                )}
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword.trim()}
                >
                  변경 하기
                </button>
              </div>
            )}
            {/*비밀번호 변경 토글 수정중*/}

            <label>
              생년월일:
              <input
                type="text"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                readOnly
              />
            </label>
            <label>
              성별:
              <input
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                readOnly
              />
            </label>
            <label>
              전화번호:
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly
              />
            </label>

            <label>
              우편번호:
              <div className="postcode-container">
                <input
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  readOnly
                />
                <button
                  onClick={handleAddressSearch}
                  className="searchButton"
                >
                  주소찾기
                </button>
              </div>
            </label>

            <label>
              도로명 주소:
              <input
                type="text"
                value={roadAddress}
                onChange={(e) => setRoadAddress(e.target.value)}
                readOnly
                required
              />
            </label>
            <div className="road-address">
              <label>지번 주소:</label>
              <span>{address} </span>
            </div>
            <label>
              상세 주소:
              <input
                type="text"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                required
              />
            </label>


            <div className="inputTitle">선호 카테고리 (최대 5개)</div>
            <div>
              <h4>선택한 카테고리:</h4>
              {categories.map((cat, index) => (
                <span key={index} style={{ marginRight: '8px' }}>{cat}</span>
              ))}
              <button type="button" onClick={toggleCategorySelection}>카테고리 변경하기</button>
              {showCategorySelection && (
                <div>
                  {allCategories.map((category) => (
                    <div key={category}>
                      <label>
                        <input
                          type="checkbox"
                          checked={categorySelections.includes(category)}
                          onChange={() => handleCategorySelection(category)}
                        />
                        {category}
                      </label>
                    </div>
                  ))}
                  <button type="button" onClick={handleCategoryChangeComplete}>변경 완료</button>
                </div>
              )}
            </div>

            <button type="button" onClick={handleEditInfoAndPasswordChange}>회원정보 수정</button>

          </form>

          {showPostcodeModal && (
            <div className="postcode-modal">
              <div className="postcode-modal-content">
                <DaumPostcode onComplete={handlePostcodeComplete} />
                <button onClick={() => setShowPostcodeModal(false)}>닫기</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Edit_Info_User;
