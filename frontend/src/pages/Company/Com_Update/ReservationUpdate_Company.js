import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationUpdate_Company.css';

const ReservationUpdate_Company = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [popupReservations, setPopupReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [reservationEnabled, setReservationEnabled] = useState(false);

  const convertToLocalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (date) => {
    const selected = new Date(date).toLocaleDateString('en-CA');
    setSelectedDate(selected);

    const filteredTimes = popupReservations
      .filter((reservation) => convertToLocalDate(reservation.date) === selected)
      .sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));

    setAvailableTimes(filteredTimes || []);
    setSelectedTime(''); // 날짜 변경 시 시간 선택 초기화
  };

  const isDateDisabled = (date) => {
    if (!startDate || !endDate || !popupReservations.length) return false;
    const dateStr = new Date(date).toLocaleDateString('en-CA');

    const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

    // 해당 날짜의 모든 시간대가 마감된 경우
    const allTimesFull = popupReservations
      .filter(reservation => convertToLocalDate(reservation.date) === dateStr)
      .every(reservation => reservation.currentReservation >= reservation.totalReservation);

    const isNotOperatingDay = !popupReservations.some(reservation => convertToLocalDate(reservation.date) === dateStr);

    return isOutOfRange || isNotOperatingDay || allTimesFull;
  };

  const handleSetDeadline = async () => {
    if (!selectedDate) {
      alert('날짜를 선택해 주세요.');
      return;
    }

    const response = await fetch(`http://localhost:8080/popup/reservation/deadline?popupStoreId=${id}&date=${selectedDate}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert(`${selectedDate} 전체 예약 마감했습니다.`);
      // 새로고침
      window.location.reload();
    } else {
      alert('예약 마감 처리에 실패했습니다.');
    }
  };

  const handleActivateReservations = async () => {
    if (!selectedDate) {
      alert('날짜를 선택해 주세요.');
      return;
    }

    const response = await fetch(`http://localhost:8080/popup/reservation/activate?popupStoreId=${id}&date=${selectedDate}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      alert(`${selectedDate} 예약이 활성화되었습니다.`);
      // 새로고침
      window.location.reload();
    } else {
      alert('예약 활성화 처리에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (!id) {
      setError('ID parameter is missing.');
      setLoading(false);
      return;
    }

    const fetchPopupData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/popup/detail/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const responseBody = await response.text();
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.data) {
          const { title, startDate, endDate, popupReservations } = data.data;
          setTitle(title || 'No Title');
          setStartDate(convertToLocalDate(startDate));
          setEndDate(convertToLocalDate(endDate));
          setPopupReservations(popupReservations || []);
          setReservationEnabled(true);
        } else {
          setError('No data found');
        }
      } catch (error) {
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchPopupData();
  }, [id]);

  // 예약 현황을 필터링하는 함수
  const getFilteredReservations = () => {
    return popupReservations.filter(reservation => convertToLocalDate(reservation.date) === selectedDate);
  };

  // 날짜가 비활성화된 경우의 CSS 클래스명
  const getTileClassName = ({ date }) => {
    return isDateDisabled(date) ? 'disabled' : null;
  };

  const canSetDeadline = () => {
    return getFilteredReservations().some(reservation => reservation.isReservationEnabled);
  };

  const canActivateReservations = () => {
    return getFilteredReservations().every(reservation => !reservation.isReservationEnabled);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const sortedReservations = getFilteredReservations().sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));

  return (
    <div className="container">
      <h1>팝업스토어 예약 페이지</h1>
      <h2>{title}</h2>
      <p>운영 기간: {startDate} ~ {endDate}</p>

      {reservationEnabled && (
        <>
          <label>날짜 선택:</label>
          <Calendar
            onChange={handleDateChange}
            tileClassName={getTileClassName}
            tileDisabled={({ date }) => isDateDisabled(date)}
            value={selectedDate ? new Date(selectedDate) : null}
          />
        </>
      )}

      <h2>사전예약 현황</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {sortedReservations.map((reservation) => (
          <div key={reservation.id} style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
            <p><strong>날짜:</strong> {new Date(reservation.date).toISOString().split('T')[0]}</p>
            <p><strong>시간:</strong> {reservation.startTime}</p>
            <p><strong>예약 현황:</strong> {reservation.currentReservation}/{reservation.totalReservation}</p>
            <p><strong>전체 예약:</strong> {reservation.totalReservation}</p>
            <p><strong>예약 가능:</strong> {reservation.isReservationEnabled ? '가능' : '불가능'}</p>
          </div>
        ))}
      </div>

      {reservationEnabled && selectedDate && canSetDeadline() && (
        <button className="button deadline" onClick={handleSetDeadline}>
          금일 전체 예약 마감
        </button>
      )}

      {reservationEnabled && selectedDate && canActivateReservations() && (
        <button className="button activate" onClick={handleActivateReservations}>
          예약 활성화
        </button>
      )}
    </div>
  );
};

export default ReservationUpdate_Company;





















// // 예약 마감 버튼 생성
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './ReservationUpdate_Company.css'; // 스타일 파일 import

// const ReservationUpdate_Company = () => {
//   const { id } = useParams(); // URL에서 id를 추출
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [title, setTitle] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState('');
//   const [operatingEndDate, setOperatingEndDate] = useState('');
//   const [operatingDays, setOperatingDays] = useState({
//     월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//   });
//   const [isReservationEnabled, setIsReservationEnabled] = useState(false);
//   const [reservationData, setReservationData] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [reservationStatus, setReservationStatus] = useState('disabled'); // 초기 상태를 'disabled'로 설정

//   useEffect(() => {
//     if (!id) {
//       setError(new Error('ID 파라미터가 없습니다.'));
//       setLoading(false);
//       return;
//     }
  
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setError(new Error('로그인이 필요합니다.'));
//       setLoading(false);
//       return;
//     }
  
//     const fetchPopupData = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/popup/company/detail/${id}`, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         });
  
//         const data = await response.json();
//         console.log('받아온 데이터:', data);

//         if (data.result && data.data) {
//           const popupData = data.data;
//           setTitle(popupData.title || '');
//           setCompanyName(popupData.companyName || '');
//           setOperatingStartDate(new Date(popupData.startDate).toISOString().split('T')[0]);
//           setOperatingEndDate(new Date(popupData.endDate).toISOString().split('T')[0]);
//           setOperatingDays((popupData.storeDays || []).reduce((acc, day) => {
//             acc[day.day] = {
//               startTime: day.openTime,
//               endTime: day.closeTime,
//               isSelected: true
//             };
//             return acc;
//           }, {
//             월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//           }));
//           setIsReservationEnabled((popupData.storeDays || []).length > 0);
//           setReservationData(popupData.popupReservations || []);
  
//           // Check if there are any enabled reservations for the initial selected date
//           const initialDateString = selectedDate.toISOString().split('T')[0];
//           const initialReservation = popupData.popupReservations.find(reservation => 
//             new Date(reservation.date).toISOString().split('T')[0] === initialDateString
//             && reservation.isReservationEnabled
//           );
  
//           setReservationStatus(initialReservation ? 'enabled' : 'disabled');
//         } else {
//           setError(new Error('잘못된 응답 데이터'));
//         }
//       } catch (error) {
//         console.error('팝업 데이터 가져오기 오류:', error);
//         setError(error);
//       }
  
//       setLoading(false);
//     };
  
//     fetchPopupData();
//   }, [id, selectedDate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }

//     const jsonData = {
//       title,
//       startDate: operatingStartDate || '',
//       endDate: operatingEndDate || '',
//       storeDays: Object.keys(operatingDays)
//         .filter(day => operatingDays[day].isSelected)
//         .map(day => ({
//           openTime: operatingDays[day].startTime,
//           closeTime: operatingDays[day].endTime,
//           day
//         })),
//       isReservationEnabled
//     };

//     try {
//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(jsonData)
//       });

//       if (response.ok) {
//         alert('팝업 정보가 성공적으로 업데이트되었습니다.');
//         // 페이지 리다이렉트 등 추가 작업
//       } else {
//         const result = await response.json();
//         alert(`업데이트 실패: ${result.message}`);
//       }
//     } catch (error) {
//       console.error('팝업 업데이트 중 오류 발생:', error);
//       alert('업데이트 중 오류가 발생했습니다.');
//     }
//   };

//   const handleDateChange = (date) => {
//     setSelectedDate(date);
//     const dateString = date.toISOString().split('T')[0];
//     const reservation = reservationData.find(res =>
//       new Date(res.date).toISOString().split('T')[0] === dateString
//       && res.isReservationEnabled
//     );
  
//     setReservationStatus(reservation ? 'enabled' : 'disabled');
//   };
  
//   const handleToggleReservation = async () => {
//     const date = selectedDate.toISOString().split('T')[0];
//     const url = reservationStatus === 'enabled'
//       ? `http://localhost:8080/popup/reservation/deadline?popupStoreId=${id}&date=${date}`
//       : `http://localhost:8080/popup/reservation/activate?popupStoreId=${id}&date=${date}`;
  
//     try {
//       const response = await fetch(url, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
  
//       if (response.ok) {
//         setReservationStatus(reservationStatus === 'enabled' ? 'disabled' : 'enabled');
//         alert(`예약이 ${reservationStatus === 'enabled' ? '마감' : '활성화'}되었습니다.`);
//       } else {
//         // Try to parse the response, but handle non-JSON responses
//         try {
//           const result = await response.json();
//           alert(`오류: ${result.message}`);
//         } catch (err) {
//           const errorText = await response.text();
//           alert(`오류: ${errorText}`);
//         }
//       }
//     } catch (error) {
//       console.error('예약 상태 업데이트 중 오류 발생:', error);
//       alert('예약 상태 업데이트 중 오류가 발생했습니다.');
//     }
//   };
  
  
//   const getTileClassName = ({ date }) => {
//     const dateString = date.toISOString().split('T')[0];
//     const startDate = new Date(operatingStartDate);
//     const endDate = new Date(operatingEndDate);

//     if (date < startDate || date > endDate) {
//       return 'react-calendar__tile--inactive-period'; // 비활성화된 날짜
//     }

//     return 'react-calendar__tile--active-period'; // 활성화된 날짜
//   };

//   // 시간순으로 정렬
//   const sortedReservations = reservationData
//     .filter(reservation => new Date(reservation.date).toDateString() === new Date(selectedDate).toDateString())
//     .sort((a, b) => {
//       return new Date(`1970-01-01T${a.startTime}`) - new Date(`1970-01-01T${b.startTime}`);
//     });

//   if (loading) {
//     return <div>로딩 중...</div>;
//   }

//   if (error) {
//     return <div>오류: {error.message}</div>;
//   }

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>제목:</label>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>운영 시작일:</label>
//           <input
//             type="date"
//             value={operatingStartDate}
//             onChange={(e) => setOperatingStartDate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>운영 종료일:</label>
//           <input
//             type="date"
//             value={operatingEndDate}
//             onChange={(e) => setOperatingEndDate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>운영 요일 및 시간:</label>
//           {Object.keys(operatingDays).map(day => (
//             <div key={day}>
//               <label>{day}:</label>
//               <input
//                 type="time"
//                 value={operatingDays[day].startTime}
//                 onChange={(e) => setOperatingDays(prev => ({
//                   ...prev,
//                   [day]: { ...prev[day], startTime: e.target.value }
//                 }))}
//               />
//               ~
//               <input
//                 type="time"
//                 value={operatingDays[day].endTime}
//                 onChange={(e) => setOperatingDays(prev => ({
//                   ...prev,
//                   [day]: { ...prev[day], endTime: e.target.value }
//                 }))}
//               />
//               <input
//                 type="checkbox"
//                 checked={operatingDays[day].isSelected}
//                 onChange={(e) => setOperatingDays(prev => ({
//                   ...prev,
//                   [day]: { ...prev[day], isSelected: e.target.checked }
//                 }))}
//               /> 운영
//             </div>
//           ))}
//         </div>
//         <div>
//           <label>
//             <input
//               type="checkbox"
//               checked={isReservationEnabled}
//               onChange={(e) => setIsReservationEnabled(e.target.checked)}
//             />
//             사전예약 가능
//           </label>
//         </div>
//         <button type="submit">업데이트</button>
//       </form>

//       <h2>사전예약 현황</h2>
//       <Calendar
//         onChange={handleDateChange}
//         value={selectedDate}
//         tileClassName={getTileClassName}
//       />
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
//         {sortedReservations.map((reservation) => (
//           <div key={reservation.id} style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
//             <p><strong>날짜:</strong> {new Date(reservation.date).toISOString().split('T')[0]}</p>
//             <p><strong>시간:</strong> {reservation.startTime}</p>
//             <p><strong>예약 현황:</strong> {reservation.currentReservation}/{reservation.totalReservation}</p>
//             <p><strong>전체 예약:</strong> {reservation.totalReservation}</p>
//             <p><strong>예약 가능:</strong> {reservation.isReservationEnabled ? '가능' : '불가능'}</p>
//           </div>
//         ))}
//       </div>

//       <div>
//         {reservationStatus === 'enabled' && (
//           <button
//             className="button deadline"
//             onClick={handleToggleReservation}
//           >
//             예약 마감
//           </button>
//         )}
//         {reservationStatus === 'disabled' && (
//           <button
//             className="button activate"
//             onClick={handleToggleReservation}
//           >
//             예약 활성화
//           </button>
//         )}
//       </div>

//     </div>
//   );
// };

// export default ReservationUpdate_Company;
