import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from '../../../URL_API';
import './Delete_Info_User.css';


const Edit_Info_User = () => {
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({});

  const [password, setPassword] = useState("");
  const [isPasswordMatched, setIsPasswordMatched] = useState(false);

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
    const token = localStorage.getItem("token");

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate("/auth/user/login");
      return;
    }

    // 회원정보 조회 (수정 전 get 띄우기)
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mypage/getinfo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json();
        setUserInfo(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // 유저 정보를 가져옵니다
    fetchUserInfo();
  }, [navigate]);

  // 회원 탈퇴 수정중----------------------------
  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/mypage/deleteinfo`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert("회원탈퇴가 완료되었습니다.");
        localStorage.removeItem("token"); // 토큰 삭제
        window.location.href = "/"; // 홈으로 이동 및 새로고침
      } else {
        alert("회원탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원탈퇴 중 오류 발생:", error);
      alert("회원탈퇴 중 오류가 발생했습니다.");
    }
  };

  // 회원탈퇴 수정중----------------------------

  // 회원 탈퇴 버튼 클릭 핸들러
  const handleDeleteClick = () => {
    if (window.confirm("정말 회원탈퇴를 하시겠습니까?")) {
      handleDeleteUser();
    } else {
      alert("회원탈퇴가 취소되었습니다.");
    }
  };

  return (
    <div className="container">
      {/* 비밀번호 확인창 */}
      {!isPasswordMatched && (
        <div className="modal">
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
        <div className="modal">
          <h2>회원정보 탈퇴 구현</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : error ? (
            <p>오류 발생: {error.message}</p>
          ) : (
            <div>
              <p>아이디: {userInfo.username}</p>
              <p>닉네임: {userInfo.nickname}</p>
              <p>이메일: {userInfo.email}</p>
              <p>생년월일: {userInfo.birth}</p>
              <button onClick={handleDeleteClick}>회원 탈퇴</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Edit_Info_User;
