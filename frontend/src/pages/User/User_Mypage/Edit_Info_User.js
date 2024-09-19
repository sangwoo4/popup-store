import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Edit_Info_User = () => {
  const [password, setPassword] = useState(""); // 비밀번호 입력 상태
  const [isPasswordMatched, setIsPasswordMatched] = useState(false); // 비밀번호 일치 여부
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // 비밀번호 확인 요청 함수
  const handlePasswordCheck = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/mypage/matchpwd", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      // 서버 응답 객체에서 result 값 추출
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

  const handleEditInfo = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:8080/mypage/editinfo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("회원정보가 성공적으로 수정되었습니다.");
        navigate("/mypage");
      } else {
        alert("회원정보 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원정보 수정 중 오류 발생:", error);
      alert("회원정보 수정 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div>
      {/* 비밀번호 확인창 */}
      {!isPasswordMatched && (
        <div>
          <h2>비밀번호 확인</h2>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handlePasswordCheck}>비밀번호 확인</button>
        </div>
      )}

      {/* 비밀번호가 일치하면 회원정보 수정 폼을 표시 */}
      {isPasswordMatched && (
        <div>
          <h2>회원정보 수정</h2>
          <input
            type="text"
            name="nickname"
            value={formData.nickname || ""}
            onChange={handleInputChange}
            placeholder="닉네임"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="전화번호"
          />
          <input
            type="text"
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            placeholder="주소"
          />
          <input
            type="text"
            name="detailAddress"
            value={formData.detailAddress || ""}
            onChange={handleInputChange}
            placeholder="상세 주소"
          />
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleInputChange}
            placeholder="새 비밀번호"
          />
          <button onClick={handleEditInfo}>회원정보 수정</button>
        </div>
      )}
    </div>
  );
};

export default Edit_Info_User;
