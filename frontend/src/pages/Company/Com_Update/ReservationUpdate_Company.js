import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationUpdate_Company.css';

const daysOfWeek = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

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
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [storeDays, setStoreDays] = useState([]);
  const [reservationTimes, setReservationTimes] = useState([]);
  const [showReservationTimes, setShowReservationTimes] = useState(false);

  // Define these variables if they are needed
  const [imageFiles, setImageFiles] = useState([]);
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [subway, setSubway] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [category, setCategory] = useState([]);
  const [operatingDays, setOperatingDays] = useState({});
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [distance, setDistance] = useState('');
  const [mapx, setMapx] = useState('');
  const [mapy, setMapy] = useState('');

  // Assuming operatingStartDate and operatingEndDate come from state
  const [operatingStartDate, setOperatingStartDate] = useState('');
  const [operatingEndDate, setOperatingEndDate] = useState('');
  const [originalCategories, setOriginalCategories] = useState([]);
  const [originalStoreDays, setOriginalStoreDays] = useState([]);

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
  };

  const isDateDisabled = (date) => {
    if (!startDate || !endDate || !popupReservations.length) return false;
    const dateStr = new Date(date).toLocaleDateString('en-CA');

    const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

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
        console.log('받은 데이터:', data);

        if (data && data.data) {
          const {
            companyId,
            companyName,
            title,
            postcode,
            address,
            roadAddress,
            detailAddress,
            distance,
            startDate,
            endDate,
            telephone,
            subway,
            description,
            link,
            mapx,
            mapy,
            categories,
            storeDays,
            popupReservations,
          } = data.data;

          // 상태 변수에 데이터 저장
          setCompanyId(companyId || '');
          setCompanyName(companyName || '');
          setTitle(title || 'No Title');
          setPostcode(postcode || '');
          setAddress(address || '');
          setRoadAddress(roadAddress || '');
          setDetailAddress(detailAddress || '');
          setDistance(distance || '');
          setStartDate(convertToLocalDate(startDate));
          setEndDate(convertToLocalDate(endDate));
          setTelephone(telephone || '');
          setSubway(subway || '');
          setDescription(description || '');
          setLink(link || '');
          setMapx(mapx || '');
          setMapy(mapy || '');

          setOriginalCategories(categories || []);
          setOriginalStoreDays(storeDays || []);

          setCategory(categories || []);
          setStoreDays(storeDays || []);

          const days = [...new Set(popupReservations.map(reservation => reservation.day))];
          const times = popupReservations.map(reservation => ({
            day: reservation.day,
            startTime: reservation.startTime,
            totalReservation: reservation.totalReservation,
          }));

          const uniqueTimesMap = new Map();
          times.forEach(time => {
            const key = `${time.day}-${time.startTime}`;
            if (!uniqueTimesMap.has(key)) {
              uniqueTimesMap.set(key, time);
            }
          });
          const uniqueTimes = Array.from(uniqueTimesMap.values());

          setStoreDays(days.map(day => ({ day, startTime: '' })));
          setReservationTimes(uniqueTimes);

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

  const getFilteredReservations = () => {
    return popupReservations.filter(reservation => convertToLocalDate(reservation.date) === selectedDate);
  };

  const getTileClassName = ({ date }) => {
    return isDateDisabled(date) ? 'disabled' : null;
  };

  const canSetDeadline = () => {
    return getFilteredReservations().some(reservation => reservation.isReservationEnabled);
  };

  const canActivateReservations = () => {
    return getFilteredReservations().every(reservation => !reservation.isReservationEnabled);
  };

  const handleOperatingDayChange = (index, field, value) => {
    const newStoreDays = [...storeDays];
    newStoreDays[index] = {
      ...newStoreDays[index],
      [field]: value,
    };
    setStoreDays(newStoreDays);
  };

  const handleAddReservationTime = () => {
    // Add a new reservation time with default values
    setReservationTimes([...reservationTimes, { day: daysOfWeek[0], startTime: '', totalReservation: 0 }]);
  };

  const handleRemoveReservationTime = (index) => {
    const removedTime = reservationTimes[index]; // Get the reservation time being removed
    const newReservationTimes = reservationTimes.filter((_, i) => i !== index);
    setReservationTimes(newReservationTimes);

    if (newReservationTimes.length === 0) {
      setReservationEnabled(false);
    }

    // Log the details of the removed reservation time including `isReservationEnabled`
    console.log('Removed reservation time:', {
      ...removedTime,
      isReservationEnabled: removedTime.isReservationEnabled || false
    });
  };



  const handleTimeChange = (index, field, value) => {
    const newReservationTimes = [...reservationTimes];
    newReservationTimes[index] = {
      ...newReservationTimes[index],
      [field]: value,
    };
    setReservationTimes(newReservationTimes);
  };

  // UTC 기준으로 날짜 변환
  const formatDateToUTC = (date) => {
    if (!date) return '';
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString().split('T')[0];
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('로그인 후 다시 시도해 주세요.');
      return;
    }

    // 운영기간 데이터를 처리하는 부분
    const processedStoreDays = Object.keys(operatingDays)
      .filter(day => operatingDays[day].isSelected)
      .map(day => ({
        openTime: operatingDays[day].startTime,
        closeTime: operatingDays[day].endTime,
        day
      }));

    // JSON 데이터 구성
    const jsonData = {
      companyId: companyId,
      companyName: companyName,
      title: title,
      postcode: postcode,
      address: address,
      roadAddress: roadAddress,
      detailAddress: detailAddress,
      distance: distance,
      startDate: formatDateToUTC(operatingStartDate || new Date(startDate)),
      endDate: formatDateToUTC(operatingEndDate || new Date(endDate)),
      telephone: telephone,
      subway: subway,
      description: description,
      link: link,
      mapx: mapx,
      mapy: mapy,
      categories: category.length ? category : originalCategories,  // 카테고리 배열 처리
      storeDays: processedStoreDays.length ? processedStoreDays : originalStoreDays,  // 운영기간 배열 처리
      popupReservations: popupReservations.map(res => ({
        id: res.id,
        day: res.day,
        startTime: res.startTime,
        totalReservation: res.totalReservation,
        currentReservation: res.currentReservation,
        isReservationFull: res.isReservationFull,
        isReservationEnabled: res.isReservationEnabled,
        date: res.date,
      })),
      isReservationEnabled: reservationEnabled,
    };

    console.log('전송할 JSON 데이터:', JSON.stringify(jsonData, null, 2));

    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('서버 응답:', result);

      if (response.ok) {
        alert('수정되었습니다!');
        window.location.reload();
      } else {
        alert(`수정 실패했습니다. ${result}`);
      }
    } catch (error) {
      alert('서버 오류');
      console.error(error);
    }
  };




  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const sortedReservationTimes = reservationTimes
    .sort((a, b) => {
      const dayA = daysOfWeek.indexOf(a.day);
      const dayB = daysOfWeek.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`);
    });

  return (
    <div className="container">
      <h1>팝업스토어 예약 페이지</h1>
      <h2>{title}</h2>

      <div className="operating-period-container">
        <h3>운영 기간</h3>
        <label>
          시작일:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          종료일:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

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

      <div className="store-days-container">
        <h3>운영 요일</h3>
        {storeDays.map((day, index) => (
          <div key={index} className="store-day">
            <label>
              요일:
              <input
                type="text"
                value={day.day || ''}
                onChange={(e) => handleOperatingDayChange(index, 'day', e.target.value)}
              />
            </label>
            <label>
              시작 시간:
              <input
                type="time"
                value={day.startTime || ''}
                onChange={(e) => handleOperatingDayChange(index, 'startTime', e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <button
        className="button"
        onClick={() => setShowReservationTimes(!showReservationTimes)}
      >
        사전예약 변경하기
      </button>

      {showReservationTimes && (
        <div className="reservation-times-container">
          <h3>사전 예약 시간</h3>
          <table>
            <thead>
              <tr>
                <th>요일</th>
                <th>시작 시간</th>
                <th>총 예약 인원</th>
                <th>동작</th>
              </tr>
            </thead>
            <tbody>
              {sortedReservationTimes.map((time, index) => (
                <tr key={index}>
                  <td>
                    <select
                      value={time.day}
                      onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
                    >
                      {daysOfWeek.map((day, i) => (
                        <option key={i} value={day}>{day}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="time"
                      value={time.startTime}
                      onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={time.totalReservation}
                      onChange={(e) => handleTimeChange(index, 'totalReservation', e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleRemoveReservationTime(index)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="button" onClick={handleAddReservationTime}>시간대 추가</button>
        </div>
      )}

      <h2>사전예약 현황</h2>
      <div className="grid-container">
        {getFilteredReservations().map((reservation) => (
          <div key={reservation.id}>
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

      {reservationEnabled && (
        <button className="button update" onClick={handleUpdate}>
          저장
        </button>
      )}
    </div>
  );
};

export default ReservationUpdate_Company;







// // 24.09.01 예약 마감 버튼 생성
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './ReservationUpdate_Company.css';

// const ReservationUpdate_Company = () => {
//   const { id } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [title, setTitle] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [popupReservations, setPopupReservations] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [availableTimes, setAvailableTimes] = useState([]);
//   const [selectedTime, setSelectedTime] = useState('');
//   const [reservationEnabled, setReservationEnabled] = useState(false);

//   const convertToLocalDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toISOString().split('T')[0];
//   };

//   const handleDateChange = (date) => {
//     const selected = new Date(date).toLocaleDateString('en-CA');
//     setSelectedDate(selected);

//     const filteredTimes = popupReservations
//       .filter((reservation) => convertToLocalDate(reservation.date) === selected)
//       .sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));

//     setAvailableTimes(filteredTimes || []);
//     setSelectedTime(''); // 날짜 변경 시 시간 선택 초기화
//   };

//   const isDateDisabled = (date) => {
//     if (!startDate || !endDate || !popupReservations.length) return false;
//     const dateStr = new Date(date).toLocaleDateString('en-CA');

//     const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

//     // 해당 날짜의 모든 시간대가 마감된 경우
//     const allTimesFull = popupReservations
//       .filter(reservation => convertToLocalDate(reservation.date) === dateStr)
//       .every(reservation => reservation.currentReservation >= reservation.totalReservation);

//     const isNotOperatingDay = !popupReservations.some(reservation => convertToLocalDate(reservation.date) === dateStr);

//     return isOutOfRange || isNotOperatingDay || allTimesFull;
//   };

//   const handleSetDeadline = async () => {
//     if (!selectedDate) {
//       alert('날짜를 선택해 주세요.');
//       return;
//     }

//     const response = await fetch(`http://localhost:8080/popup/reservation/deadline?popupStoreId=${id}&date=${selectedDate}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.ok) {
//       alert(`${selectedDate} 전체 예약 마감했습니다.`);
//       // 새로고침
//       window.location.reload();
//     } else {
//       alert('예약 마감 처리에 실패했습니다.');
//     }
//   };

//   const handleActivateReservations = async () => {
//     if (!selectedDate) {
//       alert('날짜를 선택해 주세요.');
//       return;
//     }

//     const response = await fetch(`http://localhost:8080/popup/reservation/activate?popupStoreId=${id}&date=${selectedDate}`, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.ok) {
//       alert(`${selectedDate} 예약이 활성화되었습니다.`);
//       // 새로고침
//       window.location.reload();
//     } else {
//       alert('예약 활성화 처리에 실패했습니다.');
//     }
//   };

//   useEffect(() => {
//     if (!id) {
//       setError('ID parameter is missing.');
//       setLoading(false);
//       return;
//     }

//     const fetchPopupData = async () => {
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
//           const { title, startDate, endDate, popupReservations } = data.data;
//           setTitle(title || 'No Title');
//           setStartDate(convertToLocalDate(startDate));
//           setEndDate(convertToLocalDate(endDate));
//           setPopupReservations(popupReservations || []);
//           setReservationEnabled(true);
//         } else {
//           setError('No data found');
//         }
//       } catch (error) {
//         setError(error.message || 'Failed to fetch data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPopupData();
//   }, [id]);

//   // 예약 현황을 필터링하는 함수
//   const getFilteredReservations = () => {
//     return popupReservations.filter(reservation => convertToLocalDate(reservation.date) === selectedDate);
//   };

//   // 날짜가 비활성화된 경우의 CSS 클래스명
//   const getTileClassName = ({ date }) => {
//     return isDateDisabled(date) ? 'disabled' : null;
//   };

//   const canSetDeadline = () => {
//     return getFilteredReservations().some(reservation => reservation.isReservationEnabled);
//   };

//   const canActivateReservations = () => {
//     return getFilteredReservations().every(reservation => !reservation.isReservationEnabled);
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   const sortedReservations = getFilteredReservations().sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));

//   return (
//     <div className="container">
//       <h1>팝업스토어 예약 페이지</h1>
//       <h2>{title}</h2>
//       <p>운영 기간: {startDate} ~ {endDate}</p>

//       {reservationEnabled && (
//         <>
//           <label>날짜 선택:</label>
//           <Calendar
//             onChange={handleDateChange}
//             tileClassName={getTileClassName}
//             tileDisabled={({ date }) => isDateDisabled(date)}
//             value={selectedDate ? new Date(selectedDate) : null}
//           />
//         </>
//       )}

//       <h2>사전예약 현황</h2>
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

//       {reservationEnabled && selectedDate && canSetDeadline() && (
//         <button className="button deadline" onClick={handleSetDeadline}>
//           금일 전체 예약 마감
//         </button>
//       )}

//       {reservationEnabled && selectedDate && canActivateReservations() && (
//         <button className="button activate" onClick={handleActivateReservations}>
//           예약 활성화
//         </button>
//       )}
//     </div>
//   );
// };

// export default ReservationUpdate_Company;