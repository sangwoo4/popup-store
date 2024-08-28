import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PopupReservation_Confirm_User.css';

const PopupReservation_Confirm_User = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reservationDetails = state?.reservationDetails;

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!reservationDetails) {
    return <div>No reservation details available.</div>;
  }

  return (
    <div className="confirmation-container">
      <h1>사전예약이 완료되었습니다.</h1>
      <div className="confirmation-details">
        <p><strong>제목:</strong> {reservationDetails.title}</p>
        <p><strong>날짜:</strong> {reservationDetails.date}</p>
        <p><strong>시간:</strong> {reservationDetails.startTime}</p>
        <p><strong>참여 인원:</strong> {reservationDetails.numberOfPeople}</p>
        <p><strong>예약 ID:</strong> {reservationDetails.reservationId}</p>
        
        <br/>
        예약한 시간 10분 초과시 자동취소됩니다.<br/>
        현장 상황에 따라 대기가 발생할 수 있으니, 10분 전 현장으로 와주세요.<br/>
        일부 판매 상품은 소진될 수 있습니다.
      </div>
      <button onClick={handleBackToHome}>홈으로 돌아가기</button>
    </div>
  );
};

export default PopupReservation_Confirm_User;
