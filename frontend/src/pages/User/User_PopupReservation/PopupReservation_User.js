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
  const [popupReservationId, setReservationId] = useState(null);
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
            const { date, day } = reservation;
            if (!dateMap.has(date)) {
              dateMap.set(date, day);
            }
          });

          const dateList = Array.from(dateMap.entries())
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, dayOfWeek]) => ({
              date: convertToLocalDate(date),
              dayOfWeek
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
    setReservationId(null); // 날짜 변경 시 예약 ID 초기화
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    setReservationId(time ? availableTimes.find((slot) => slot.startTime === time)?.id : null);
  };

  const handlePeopleChange = (people) => {
    setNumberOfPeople(people);
  };

  const isPeopleButtonDisabled = (num) => {
    return getRemainingSpots() < num;
  };

  const handleReservation = () => {
    const token = localStorage.getItem('token');
    
    console.log('예약 데이터:', {
      popupReservationId: popupReservationId,
      numberOfPeople: numberOfPeople,
    });
  
    fetch('http://localhost:8080/popup/reservation/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        popupReservationId: popupReservationId,
        numberOfPeople: numberOfPeople,
      }),
    })
      .then((response) => {
        console.log('서버 응답 상태 코드:', response.status);
        return response.json().then((data) => {
          console.log('서버 응답 데이터:', data);
          if (response.ok) {
            alert('예약이 성공적으로 완료되었습니다!');
            navigate(`/popup/user/popup_reservation/confirm/${data.id}`, { state: { reservationDetails: data.data }});
          } else {
            throw new Error('예약에 실패했습니다.');
          }
        });
      })
      .catch((error) => {
        console.error('예약 중 오류 발생:', error);
      });
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
    
    return isOutOfRange || isNotOperatingDay || allTimesFull;
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
                      onClick={() => handleTimeChange(slot.startTime)}
                      className={`${selectedTime === slot.startTime ? 'selected' : ''} ${isFull ? 'full' : ''}`}
                      disabled={isFull}
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
//   const [popupReservationId, setReservationId] = useState(null);
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
//             const { date, day } = reservation;
//             if (!dateMap.has(date)) {
//               dateMap.set(date, day);
//             }
//           });

//           const dateList = Array.from(dateMap.entries())
//             .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
//             .map(([date, dayOfWeek]) => ({
//               date: convertToLocalDate(date),
//               dayOfWeek
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
//     setReservationId(null); // 날짜 변경 시 예약 ID 초기화
//   };

//   const handleTimeChange = (time) => {
//     setSelectedTime(time);
//     setReservationId(time ? availableTimes.find((slot) => slot.startTime === time)?.id : null);
//   };

//   const handlePeopleChange = (people) => {
//     setNumberOfPeople(people);
//   };

//   const handleReservation = () => {
//     const token = localStorage.getItem('token');
    
//     console.log('예약 데이터:', {
//       popupReservationId: popupReservationId,
//       numberOfPeople: numberOfPeople,
//     });
  
//     fetch('http://localhost:8080/popup/reservation/user', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json; charset=utf-8',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         popupReservationId: popupReservationId,
//         numberOfPeople: numberOfPeople,
//       }),
//     })
//       .then((response) => {
//         console.log('서버 응답 상태 코드:', response.status);
//         return response.json().then((data) => {
//           console.log('서버 응답 데이터:', data);
//           if (response.ok) {
//             alert('예약이 성공적으로 완료되었습니다!');
//             navigate(`/popup/user/popup_reservation/confirm`);
//           } else {
//             throw new Error('예약에 실패했습니다.');
//           }
//         });
//       })
//       .catch((error) => {
//         console.error('예약 중 오류 발생:', error);
//       });
//   };

//   const isDateDisabled = (date) => {
//     if (!locationInfo) return false;
//     const { startDate, endDate } = locationInfo;
//     const dateStr = new Date(date).toLocaleDateString('en-CA');
//     const isPast = new Date(dateStr) < new Date(startDate);
//     const isFuture = new Date(dateStr) > new Date(endDate);
//     return isPast || isFuture;
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
//                         className={numberOfPeople === num ? 'selected' : ''}
//                         disabled={getRemainingSpots() < num}
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


