import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './PopupReservation_User.css';

const PopupReservation_User = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [locationInfo, setLocationInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [popupReservationId, setPopupReservationId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservationEnabled, setReservationEnabled] = useState(false);

  const convertToLocalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!id) {
      setError('ID parameter is missing.');
      setLoading(false);
      return;
    }

    const fetchLocationInfo = async () => {
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
        console.log(data);

        if (data && data.data) {
          const { id, title, startDate, endDate, popupReservations } = data.data;

          const convertToLocalDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-CA');
          };

          const startDateLocal = convertToLocalDate(startDate);
          const endDateLocal = convertToLocalDate(endDate);

          const dateMap = new Map();
          popupReservations.forEach(reservation => {
            const { date, day, isReservationEnabled } = reservation;
            if (!dateMap.has(date)) {
              dateMap.set(date, { day, isReservationEnabled });
            }
          });

          const dateList = Array.from(dateMap.entries())
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, { day, isReservationEnabled }]) => ({
              date: convertToLocalDate(date),
              dayOfWeek: day,
              isReservationEnabled
            }));

          setLocationInfo({
            id,
            title: title || 'No Title',
            startDate: startDateLocal,
            endDate: endDateLocal,
            popupReservations: popupReservations || [],
            dateList,
          });
          setReservationEnabled(true);
        } else {
          setLocationInfo(null);
        }

        setLoading(false);
      } catch (error) {
        setError(error.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchLocationInfo();
  }, [id]);

  const handleDateChange = (date) => {
    const selected = new Date(date).toLocaleDateString('en-CA');
    setSelectedDate(selected);

    const filteredTimes = locationInfo?.popupReservations
      .filter((reservation) => convertToLocalDate(reservation.date) === selected)
      .sort((a, b) => {
        return new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`);
      });

    setAvailableTimes(filteredTimes || []);
    setSelectedTime(''); // 날짜 변경 시 시간 선택 초기화
    setPopupReservationId(null); // 날짜 변경 시 예약 ID 초기화
  };


  const handleTimeChange = (time) => {
    const selectedSlot = availableTimes.find((slot) => slot.startTime === time);
    setSelectedTime(time);
    setPopupReservationId(selectedSlot ? selectedSlot.id : null);
  };


  const handlePeopleChange = (people) => {
    setNumberOfPeople(people);
  };

  const isPeopleButtonDisabled = (num) => {
    return getRemainingSpots() < num;
  };

  const handleReservation = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:8080/popup/reservation/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          popupReservationId: popupReservationId,
          numberOfPeople: numberOfPeople,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 서버 응답에서 pk와 reservationId를 별도로 저장
        const { id: id } = data.data;
        setPopupReservationId(id); // 삭제 시 사용할 pk 저장
        alert('예약이 성공적으로 완료되었습니다!');
        // 예약 성공 시
        navigate(`/popup/user/popup_reservation/confirm/${data.data.id}`, { state: { reservationDetails: data.data } });
      } else {
        throw new Error('예약에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약 중 오류 발생:', error);
      alert('예약에 실패했습니다.');
    }
  };

  const isDateDisabled = (date) => {
    if (!locationInfo) return false;
    const { startDate, endDate, popupReservations } = locationInfo;
    const dateStr = new Date(date).toLocaleDateString('en-CA');

    const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

    // 해당 날짜의 모든 시간대가 마감된 경우
    const allTimesFull = popupReservations
      .filter(reservation => convertToLocalDate(reservation.date) === dateStr)
      .every(reservation => reservation.currentReservation >= reservation.totalReservation);

    const isNotOperatingDay = !popupReservations.some(reservation => convertToLocalDate(reservation.date) === dateStr);

    // isReservationEnabled가 false인 경우
    const isDisabledByReservation = popupReservations
      .some(reservation => convertToLocalDate(reservation.date) === dateStr && !reservation.isReservationEnabled);

    // 모든 시간대가 비활성화되지 않았고, 예약이 가능한 시간대가 있는 경우
    const hasEnabledReservations = popupReservations
      .some(reservation => convertToLocalDate(reservation.date) === dateStr && reservation.isReservationEnabled);

    return isOutOfRange || isNotOperatingDay || (allTimesFull && !hasEnabledReservations);
  };


  const convertToDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getRemainingSpots = () => {
    const selectedSlot = availableTimes.find(slot => slot.startTime === selectedTime);
    if (!selectedSlot) return 0;
    return selectedSlot.totalReservation - selectedSlot.currentReservation;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!locationInfo) {
    return <div>No details available.</div>;
  }

  return (
    <div className="container">
      <h1>팝업스토어 예약하기 페이지</h1>
      <h2>{locationInfo.title}</h2>
      <p>운영 기간: {locationInfo.startDate} ~ {locationInfo.endDate}</p>

      {reservationEnabled && (
        <>
          <label>날짜 선택:</label>
          <Calendar
            onChange={handleDateChange}
            tileClassName={({ date }) => isDateDisabled(date) ? 'disabled' : null}
            tileDisabled={({ date }) => isDateDisabled(date)}
            value={selectedDate ? convertToDate(selectedDate) : null}
          />

          {selectedDate && (
            <>
              <label>시간 선택:</label>
              <div className="time-buttons">
                {availableTimes.map((slot, index) => {
                  const isFull = slot.currentReservation >= slot.totalReservation;
                  return (
                    <button
                      key={index}
                      onClick={() => !isFull && slot.isReservationEnabled && handleTimeChange(slot.startTime)}
                      className={`time-button ${selectedTime === slot.startTime ? 'selected' : ''} ${isFull ? 'full' : ''} ${!slot.isReservationEnabled ? 'disabled' : ''}`}
                      disabled={isFull || !slot.isReservationEnabled} // 비활성화된 버튼은 클릭 불가능
                    >
                      {slot.startTime} {isFull ? '(마감)' : ''}
                    </button>
                  );
                })}
              </div>

              {selectedTime && (
                <>
                  <label>참여 인원:</label>
                  <div className="people-buttons">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePeopleChange(num)}
                        className={`${numberOfPeople === num ? 'selected' : ''} ${isPeopleButtonDisabled(num) ? 'disabled' : ''}`}
                        disabled={isPeopleButtonDisabled(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button className="submit" onClick={handleReservation} disabled={getRemainingSpots() < numberOfPeople}>
                    사전예약하기
                  </button>
                </>
              )}
            </>
          )}

        </>
      )}
    </div>
  );
};

export default PopupReservation_User;





// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './PopupReservation_User.css';

// const PopupReservation_User = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [locationInfo, setLocationInfo] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [availableTimes, setAvailableTimes] = useState([]);
//   const [selectedTime, setSelectedTime] = useState('');
//   const [numberOfPeople, setNumberOfPeople] = useState(1);
//   const [popupReservationId, setPopupReservationId] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [reservationEnabled, setReservationEnabled] = useState(false);

//   const convertToLocalDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toISOString().split('T')[0];
//   };

//   useEffect(() => {
//     if (!id) {
//       setError('ID parameter is missing.');
//       setLoading(false);
//       return;
//     }

//     const fetchLocationInfo = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/popup/detail/${id}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!response.ok) {
//           const responseBody = await response.text();
//           throw new Error(`Network response was not ok. Status: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data && data.data) {
//           const { id, title, startDate, endDate, popupReservations } = data.data;

//           const convertToLocalDate = (dateString) => {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('en-CA');
//           };

//           const startDateLocal = convertToLocalDate(startDate);
//           const endDateLocal = convertToLocalDate(endDate);

//           const dateMap = new Map();
//           popupReservations.forEach(reservation => {
//             const { date, day, isReservationEnabled } = reservation;
//             if (!dateMap.has(date)) {
//               dateMap.set(date, { day, isReservationEnabled });
//             }
//           });

//           const dateList = Array.from(dateMap.entries())
//             .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
//             .map(([date, { day, isReservationEnabled }]) => ({
//               date: convertToLocalDate(date),
//               dayOfWeek: day,
//               isReservationEnabled
//             }));

//           setLocationInfo({
//             id,
//             title: title || 'No Title',
//             startDate: startDateLocal,
//             endDate: endDateLocal,
//             popupReservations: popupReservations || [],
//             dateList,
//           });
//           setReservationEnabled(true);
//         } else {
//           setLocationInfo(null);
//         }

//         setLoading(false);
//       } catch (error) {
//         setError(error.message || 'Failed to fetch data');
//         setLoading(false);
//       }
//     };

//     fetchLocationInfo();
//   }, [id]);

//   const handleDateChange = (date) => {
//     const selected = new Date(date).toLocaleDateString('en-CA');
//     setSelectedDate(selected);

//     const filteredTimes = locationInfo?.popupReservations
//       .filter((reservation) => convertToLocalDate(reservation.date) === selected)
//       .sort((a, b) => {
//         return new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`);
//       });

//     setAvailableTimes(filteredTimes || []);
//     setSelectedTime(''); // 날짜 변경 시 시간 선택 초기화
//     setPopupReservationId(null); // 날짜 변경 시 예약 ID 초기화
//   };

//   const handleTimeChange = (time) => {
//     setSelectedTime(time);
//     setPopupReservationId(time ? availableTimes.find((slot) => slot.startTime === time)?.id : null);
//   };

//   const handlePeopleChange = (people) => {
//     setNumberOfPeople(people);
//   };

//   const isPeopleButtonDisabled = (num) => {
//     return getRemainingSpots() < num;
//   };

//   const handleReservation = async () => {
//     const token = localStorage.getItem('token');

//     try {
//       const response = await fetch('http://localhost:8080/popup/reservation/user', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json; charset=utf-8',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           popupReservationId: popupReservationId,
//           numberOfPeople: numberOfPeople,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//       // 서버 응답에서 pk와 reservationId를 별도로 저장
//         const { id: id } = data.data;
//         setPopupReservationId(id); // 삭제 시 사용할 pk 저장
//         alert('예약이 성공적으로 완료되었습니다!');
//         // 예약 성공 시
//         navigate(`/popup/user/popup_reservation/confirm/${data.data.id}`, { state: { reservationDetails: data.data } });
//       } else {
//         throw new Error('예약에 실패했습니다.');
//       }
//     } catch (error) {
//       console.error('예약 중 오류 발생:', error);
//       alert('예약에 실패했습니다.');
//     }
//   };

//   const isDateDisabled = (date) => {
//     if (!locationInfo) return false;
//     const { startDate, endDate, popupReservations } = locationInfo;
//     const dateStr = new Date(date).toLocaleDateString('en-CA');

//     const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

//     // 해당 날짜의 모든 시간대가 마감된 경우
//     const allTimesFull = popupReservations
//       .filter(reservation => convertToLocalDate(reservation.date) === dateStr)
//       .every(reservation => reservation.currentReservation >= reservation.totalReservation);

//     const isNotOperatingDay = !popupReservations.some(reservation => convertToLocalDate(reservation.date) === dateStr);

//     // isReservationEnabled가 false인 경우
//     const isDisabledByReservation = popupReservations
//       .some(reservation => convertToLocalDate(reservation.date) === dateStr && !reservation.isReservationEnabled);

//     return isOutOfRange || isNotOperatingDay || allTimesFull || isDisabledByReservation;
//   };

//   const convertToDate = (dateString) => {
//     const [year, month, day] = dateString.split('-').map(Number);
//     return new Date(year, month - 1, day);
//   };

//   const getRemainingSpots = () => {
//     const selectedSlot = availableTimes.find(slot => slot.startTime === selectedTime);
//     if (!selectedSlot) return 0;
//     return selectedSlot.totalReservation - selectedSlot.currentReservation;
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!locationInfo) {
//     return <div>No details available.</div>;
//   }

//   return (
//     <div className="container">
//       <h1>팝업스토어 예약하기 페이지</h1>
//       <h2>{locationInfo.title}</h2>
//       <p>운영 기간: {locationInfo.startDate} ~ {locationInfo.endDate}</p>

//       {reservationEnabled && (
//         <>
//           <label>날짜 선택:</label>
//           <Calendar
//             onChange={handleDateChange}
//             tileClassName={({ date }) => isDateDisabled(date) ? 'disabled' : null}
//             tileDisabled={({ date }) => isDateDisabled(date)}
//             value={selectedDate ? convertToDate(selectedDate) : null}
//           />

//           {selectedDate && (
//             <>
//               <label>시간 선택:</label>
//               <div className="time-buttons">
//                 {availableTimes.map((slot, index) => {
//                   const isFull = slot.currentReservation >= slot.totalReservation;
//                   return (
//                     <button
//                       key={index}
//                       onClick={() => handleTimeChange(slot.startTime)}
//                       className={`${selectedTime === slot.startTime ? 'selected' : ''} ${isFull ? 'full' : ''}`}
//                       disabled={isFull}
//                     >
//                       {slot.startTime} {isFull ? '(마감)' : ''}
//                     </button>
//                   );
//                 })}
//               </div>

//               {selectedTime && (
//                 <>
//                   <label>참여 인원:</label>
//                   <div className="people-buttons">
//                     {[1, 2, 3, 4].map((num) => (
//                       <button
//                         key={num}
//                         onClick={() => handlePeopleChange(num)}
//                         className={`${numberOfPeople === num ? 'selected' : ''} ${isPeopleButtonDisabled(num) ? 'disabled' : ''}`}
//                         disabled={isPeopleButtonDisabled(num)}
//                       >
//                         {num}
//                       </button>
//                     ))}
//                   </div>

//                   <button className="submit" onClick={handleReservation} disabled={getRemainingSpots() < numberOfPeople}>
//                     사전예약하기
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default PopupReservation_User;

