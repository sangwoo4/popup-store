import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PopupReservation_Confirm_User.css';
import API_BASE_URL from '../../../URL_API';

const PopupReservation_Confirm_User = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const reservationDetails = state?.reservationDetails;

  console.log(reservationDetails);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const id = reservationDetails?.Id;  // Id를 id로 변경
        if (!id) {
          alert('예약 ID가 없습니다.');
          return;
        }
  
        const response = await fetch(`${API_BASE_URL}/popup/reservation/user/cancel`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id // Id 대신 id를 전송
          })
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        alert('예약 취소되었습니다.');
        navigate('/'); // 삭제 후 홈으로 이동
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('예약 취소에 실패했습니다.');
      }
    }
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
        <p><strong>예약 ID:</strong> {reservationDetails.Id}</p>
        
        <br/>
        예약한 시간 10분 초과시 자동취소됩니다.<br/>
        현장 상황에 따라 대기가 발생할 수 있으니, 10분 전 현장으로 와주세요.<br/>
        일부 판매 상품은 소진될 수 있습니다.
        시간 변경을 원하시면 취소하고 재예약하면 됩니다.
      </div>
      <button onClick={handleBackToHome}>홈으로 돌아가기</button>
      <button onClick={handleDelete}>사전예약 취소하기</button>
    </div>
  );
};

export default PopupReservation_Confirm_User;











// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import './PopupReservation_Confirm_User.css';

// const PopupReservation_Confirm_User = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const reservationDetails = state?.reservationDetails;

//   const handleBackToHome = () => {
//     navigate('/');
//   };

//   console.log(state);

//   const handleDelete = async () => {
//     if (window.confirm('정말 삭제하시겠습니까?')) {
//       try {
//         const token = localStorage.getItem("token");
  
//         // Ensure id is available
//         const id = reservationDetails?.id;
//         if (!id) {
//           alert('예약 ID가 없습니다.');
//           return;
//         }
  
//         const response = await fetch(`http://localhost:8080/popup/reservation/user/cancel`, {
//           method: 'DELETE',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//           body: JSON.stringify({
//             id // 예약 내역의 id 필드 전송
//           })
//         });
  
//         if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//         }
  
//         alert('예약 취소되었습니다.');
//         navigate('/'); // 삭제 후 홈으로 이동
//       } catch (error) {
//         console.error('Error deleting data:', error);
//         alert('예약 취소에 실패했습니다.');
//       }
//     }
//   };
  
  

//   if (!reservationDetails) {
//     return <div>No reservation details available.</div>;
//   }

//   return (
//     <div className="confirmation-container">
//       <h1>사전예약이 완료되었습니다.</h1>
//       <div className="confirmation-details">
//         <p><strong>제목:</strong> {reservationDetails.title}</p>
//         <p><strong>날짜:</strong> {reservationDetails.date}</p>
//         <p><strong>시간:</strong> {reservationDetails.startTime}</p>
//         <p><strong>참여 인원:</strong> {reservationDetails.numberOfPeople}</p>
//         <p><strong>예약 ID:</strong> {reservationDetails.reservationId}</p>
        
//         <br/>
//         예약한 시간 10분 초과시 자동취소됩니다.<br/>
//         현장 상황에 따라 대기가 발생할 수 있으니, 10분 전 현장으로 와주세요.<br/>
//         일부 판매 상품은 소진될 수 있습니다.
//         시간 변경을 원하시면 취소하고 재예약하면 됩니다.
//       </div>
//       <button onClick={handleBackToHome}>홈으로 돌아가기</button>
//       <button onClick={handleDelete}>사전예약 취소하기</button>
//     </div>
//   );
// };

// export default PopupReservation_Confirm_User;
