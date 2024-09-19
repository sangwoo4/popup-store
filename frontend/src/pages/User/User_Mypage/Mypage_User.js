import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Mypage_User.css';

// 왼쪽 사이드바 관리
const Sidebar = ({ onSelect }) => {
  return (
    <div className="sidebar">
      <h2>마이페이지</h2>
      <ul className="menu-list">
        <li onClick={() => onSelect("myPage")}>마이페이지</li>
        <li onClick={() => onSelect("myHeart")}>나의 찜 목록</li>
        <li onClick={() => onSelect("myReservation")}>나의 사전예약</li>
        <li onClick={() => onSelect("myReview")}>나의 리뷰</li>
        <li onClick={() => onSelect("editMember")}>회원정보 수정</li>
        <li onClick={() => onSelect("deleteMember")}>회원탈퇴</li>
      </ul>
    </div>
  );
};

// 마이페이지 출력 화면
const Mypage_User = () => {
  const [selectedSection, setSelectedSection] = useState("myPage");
  const [groupedReservations, setGroupedReservations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate("/auth/user/login");  // 로그인 페이지로 이동
      return;
    }

    const fetchReservations = async () => {
      try {
        const response = await fetch("http://localhost:8080/popup/reservation/user/list", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reservations. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        const groupedData = data.data.reduce((acc, curr) => {
          if (!acc[curr.title]) {
            acc[curr.title] = [];
          }
          acc[curr.title].push(curr);
          return acc;
        }, {});

        setGroupedReservations(groupedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load reservations.");
        setLoading(false);
      }
    };

    fetchReservations();
  }, [navigate]);

  const handleCardClick = (reservation) => {
    navigate(`/popup/user/popup_reservation/confirm/${reservation.Id}`, {
      state: { reservationDetails: reservation }
    });
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const mypageContent = () => {
    switch (selectedSection) {
      case "myPage":
        return <div>마이페이지</div>;

      case "myHeart":
        return <div>나의 찜 목록</div>;

      case "myReservation":
        return (
          <div className="container">
            <h1>예약내역 페이지</h1>
            {Object.keys(groupedReservations).map((title) => (
              <div key={title} className="popupstore-container">
                <h2 className="popupstore-title">{title}</h2>
                <div className="reservation-cards">
                  {groupedReservations[title].map((reservation) => (
                    <div
                      key={reservation.reservationId}
                      className="reservation-card"
                      onClick={() => handleCardClick(reservation)}
                    >
                      <p><strong>날짜:</strong> {reservation.date}</p>
                      <p><strong>시간:</strong> {reservation.startTime}</p>
                      <p><strong>참여 인원:</strong> {reservation.numberOfPeople}</p>
                      <p><strong>예약 ID:</strong> {reservation.Id}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "myReview":
        return <div>나의 리뷰</div>;

      case "editMember":
        return <div>회원정보 수정</div>;

      case "deleteMember":
        return <div>회원탈퇴</div>;

      default:
        return <div>유저 마이페이지 화면입니다.</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onSelect={setSelectedSection} />
      <div className="content">
        <h1>마이페이지</h1>
        {mypageContent()}
      </div>
    </div>
  );
};

export default Mypage_User;
