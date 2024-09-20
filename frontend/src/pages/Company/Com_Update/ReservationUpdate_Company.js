import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './ReservationUpdate_Company.css';
import API_BASE_URL from '../../../URL_API';

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
  const [imageFiles, setImageFiles] = useState([]);
  const [postCode, setPostCode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [subway, setSubway] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [mapx, setMapx] = useState('');
  const [mapy, setMapy] = useState('');
  const [category, setCategory] = useState([]);
  const [companyEmail, setCompanyEmail] = useState(''); //추가
  const [reservation, sortedReservations] = useState(true); //추가
  const [views, setViews] = useState(''); //추가
  const [heartCount, setHeartCount] = useState(''); //추가
  const [currentReservation, setCurrentReservation] = useState(''); //추가
  const [totalReservation, setTotalReservation] = useState(0);
  const [popupImages, setPopupImages] = useState([]);
  const [originalCategories, setOriginalCategories] = useState([]);
  const [originalStoreDays, setOriginalStoreDays] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [distance, setDistance] = useState('');
  const [isEditingTimes, setIsEditingTimes] = useState(false);
  const [editedTimes, setEditedTimes] = useState({});
  const [showAddReservation, setShowAddReservation] = useState(false); // 추가 상태 변수

  useEffect(() => {
    const fetchPopupData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/popup/detail/${id}`, {
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
        console.log('Received Data:', data);

        if (data && data.data) {
          const {
            companyId,
            companyName,
            title,
            postCode,
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

          setCompanyId(companyId || '');
          setCompanyName(companyName || '');
          setTitle(title || 'No Title');
          setPostCode(postCode || '');
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

          // const days = [...new Set(popupReservations.map(reservation => reservation.day))];
          const times = popupReservations.map(reservation => ({
            id: reservation.id,
            date: reservation.date,
            day: reservation.day,
            startTime: reservation.startTime,
            totalReservation: reservation.totalReservation,
            isReservationEnabled: reservation.isReservationEnabled,
          }));

          const dayTimes = storeDays.map(storeDay => ({
            openTime: storeDay.openTime,
            closeTime: storeDay.closeTime,
            day: storeDay.day
          }));


          const uniqueTimesMap = new Map();
          times.forEach(time => {
            const key = `${time.day}-${time.startTime}`;
            if (!uniqueTimesMap.has(key)) {
              uniqueTimesMap.set(key, time);
            }
          });
          const uniqueTimes = Array.from(uniqueTimesMap.values());

          uniqueTimes.sort((a, b) => {
            if (a.day === b.day) {
              return a.startTime.localeCompare(b.startTime);
            }
            return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
          });

          setStoreDays(dayTimes);
          // setPopupReservations(uniqueTimes);

          setPopupReservations(popupReservations);

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

  const convertToLocalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // const handleDateChange = (date) => {
  //   const selected = new Date(date).toLocaleDateString('en-CA');
  //   setSelectedDate(selected);

  //   const filteredTimes = popupReservations
  //     .filter((reservation) => convertToLocalDate(reservation.date) === selected)
  //     .sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));

  //   setAvailableTimes(filteredTimes || []);
  // };

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

  const isAddDateDisabled = (date) => {
    if (!startDate || !endDate) return true; // startDate와 endDate가 없으면 모든 날짜 비활성화

    const dateStr = new Date(date).toLocaleDateString('en-CA');
    const selectedDate = new Date(dateStr);

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // 선택된 날짜가 startDate와 endDate 사이인지 확인
    const isInRange = selectedDate >= startDateObj && selectedDate <= endDateObj;

    return !isInRange; // 범위 내의 날짜는 활성화, 범위 밖의 날짜는 비활성화
  };


  const handleSetDeadline = async () => {
    if (!selectedDate) {
      alert('날짜를 선택해 주세요.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/popup/reservation/deadline?popupStoreId=${id}&date=${selectedDate}`, {
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

    const response = await fetch(`${API_BASE_URL}/popup/reservation/activate?popupStoreId=${id}&date=${selectedDate}`, {
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

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('로그인 후 다시 시도해 주세요.');
      return;
    }

    const processedStoreDays = storeDays.map(day => ({
      day: day.day,
      openTime: day.openTime,
      closeTime: day.closeTime
    }));

    const processedReservations = popupReservations.map(reservation => ({
      id: reservation.id,
      day: reservation.day,
      startTime: reservation.startTime,
      totalReservation: reservation.totalReservation,
      currentReservation: reservation.currentReservation,
      isReservationEnabled: reservation.isReservationEnabled,
      isReservationFull: reservation.isReservationFull,
      date: reservation.date
    }));

    const jsonData = {
      id, //추가
      companyId, //추가
      companyName, //추가
      companyEmail, //추가
      title,
      postCode,
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
      reservation, //추가
      totalReservation, //추가
      currentReservation, //추가
      views, //추가
      heartCount, //추가
      categories: category.map(cat => ({ category: cat.category })),
      storeDays: processedStoreDays,
      popupReservations: processedReservations, // 수정된 예약 데이터 직접 전송
    };

    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/popup/company/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Server Response:', result);

      if (response.ok) {
        alert('수정되었습니다!');
        window.location.reload();
      } else {
        alert(`수정 실패했습니다. ${result.message || '상세 정보를 확인하세요.'}`);
      }
    } catch (error) {
      alert('서버 오류');
      console.error(error);
    }
  };

  const [newReservation, setNewReservation] = useState({
    date: '',
    day: daysOfWeek[0],
    startTime: '',
    totalReservation: 0,
  });

  // const handleAddReservationTime = () => {
  //   if (!newReservation.date || !newReservation.startTime) {
  //     alert('날짜와 시간을 선택해 주세요.');
  //     return;
  //   }

  //   const newReservationTime = {
  //     id: Date.now(), // 또는 고유 ID를 생성하는 로직
  //     date: newReservation.date,
  //     day: newReservation.day,
  //     startTime: newReservation.startTime,
  //     totalReservation: newReservation.totalReservation,
  //     currentReservation: 0, // 기본값
  //     isReservationEnabled: true, // 기본값
  //     isReservationFull: false, // 기본값
  //   };

  //   setPopupReservations([...popupReservations, newReservationTime]);
  //   setNewReservation({
  //     date: '',
  //     day: daysOfWeek[0],
  //     startTime: '',
  //     totalReservation: 0,
  //   });
  // };

  const handleDateChange = (date) => {
    if (date) {
      const selected = new Date(date).toLocaleDateString('en-CA');
      setSelectedDate(selected);
      const filteredTimes = popupReservations
        .filter((reservation) => convertToLocalDate(reservation.date) === selected)
        .sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));
      setAvailableTimes(filteredTimes || []);
    }
  };

  const handleAddDateChange = (date) => {
    if (date) {
      const selectedDate = new Date(date);
      const formattedSelectedDate = selectedDate.toLocaleDateString('en-CA');

      // startDate와 endDate를 Date 객체로 변환
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // 선택된 날짜가 startDate와 endDate 사이인지 확인
      const isInRange = selectedDate >= startDateObj && selectedDate <= endDateObj;

      if (isInRange) {
        setSelectedDate(formattedSelectedDate);

        const filteredTimes = popupReservations
          .filter(reservation => convertToLocalDate(reservation.date) === formattedSelectedDate)
          .sort((a, b) => new Date(`1970-01-01T${a.startTime}:00`) - new Date(`1970-01-01T${b.startTime}:00`));

        setAvailableTimes(filteredTimes || []);
      }
    }
  };


  // 요일 선택 핸들러
  const handleDayChange = (e) => {
    setNewReservation(prev => ({ ...prev, day: e.target.value }));
  };


  const handleOperatingDayChange = (index, key, value) => {
    const newStoreDays = [...storeDays];
    newStoreDays[index][key] = value;
    setStoreDays(newStoreDays);
  };

  const handleTimeChange = (index, key, value) => {
    const newReservationTimes = [...popupReservations];
    newReservationTimes[index][key] = value;
    setPopupReservations(newReservationTimes);
  };

  const getFilteredReservations = () => {
    return popupReservations
      .filter(reservation => convertToLocalDate(reservation.date) === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTileClassName = ({ date }) => {
    return isDateDisabled(date) ? 'disabled' : null;
  };

  const canSetDeadline = () => {
    return selectedDate && !getFilteredReservations().every(reservation => reservation.currentReservation >= reservation.totalReservation);
  };

  const canActivateReservations = () => {
    return selectedDate && getFilteredReservations().some(reservation => reservation.currentReservation < reservation.totalReservation);
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>에러 발생: {error}</div>;
  }

  const handleAddReservationTime = () => {
    setShowAddReservation(true); // 버튼 클릭 시 추가 폼 보이기
  };

  const handleSaveReservationTime = () => {
    const newReservation = {
      id: Date.now(), // Unique ID 생성
      day: editedTimes.day,
      startTime: editedTimes.startTime,
      totalReservation: editedTimes.totalReservation,
      currentReservation: 0, // 초기 예약 수량
      isReservationEnabled: true, // 새로 추가된 예약 시간은 기본적으로 활성화 상태로 설정
      isReservationFull: false, // 초기 상태
      date: editedTimes.date
    };

    setPopupReservations([...popupReservations, newReservation]);
    setEditedTimes({});
    setShowAddReservation(false); // 저장 후 폼 숨기기
  };

  const handleRemoveReservationTime = (id) => {
    const updatedReservations = popupReservations.map(reservation =>
      reservation.id === id
        ? { ...reservation, isReservationEnabled: false }
        : reservation
    );
    setPopupReservations(updatedReservations);
  };


  const handleEnableEditing = () => {
    setIsEditingTimes(true);
  };

  const handleReservationCountChange = (id, value) => {
    setPopupReservations(prev =>
      prev.map(reservation =>
        reservation.id === id
          ? { ...reservation, totalReservation: Math.max(reservation.totalReservation + value, 0) }
          : reservation
      )
    );
  };


  const handleInputChange = (id, value) => {
    setPopupReservations(prev =>
      prev.map(reservation =>
        reservation.id === id
          ? { ...reservation, totalReservation: Math.max(parseInt(value, 10), 0) }
          : reservation
      )
    );
  };

  const handleSaveChanges = () => {
    if (isEditingTimes) {
      console.log('수정된 예약 시간:', popupReservations);
    }
    setIsEditingTimes(false);
  };

  // 예약 시간 정렬 함수
  const sortReservations = (reservations) => {
    return reservations
      .sort((a, b) => {
        // 일자별로 정렬
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;

        // 시간별로 정렬
        return a.startTime.localeCompare(b.startTime);
      });
  };

  return (
    <div className="reservation-update-company">
      <h1>{title}</h1>
      <h2>예약 설정</h2>

      <div className="operating-period">
        <h3>운영 기간</h3>
        <p>{startDate} ~ {endDate}</p>
      </div>

      <div className="operating-days">
        <h3>운영 요일 및 시간</h3>
        {storeDays.map((day, index) => (
          <div key={index} className="operating-day">
            <p>요일: {day.day}</p>
            <p>운영 시간: {day.openTime} - {day.closeTime}</p>
          </div>
        ))}
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

      <h2>사전예약 현황</h2>
      <div className="grid-container">
        {getFilteredReservations().map((reservation) => (
          <div key={reservation.id}>
            <p><strong>날짜:</strong> {convertToLocalDate(reservation.date)}</p>
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

      <h2>운영 시간 및 예약 시간 설정</h2>
      {storeDays.map((day, index) => (
        <div key={index} className="operating-day">
          <label>{daysOfWeek[index]}:</label>
          <input
            type="time"
            value={day.startTime}
            onChange={(e) => handleOperatingDayChange(index, 'startTime', e.target.value)}
          />
        </div>
      ))}

      <div className="reservation-times-section">
        <h3>예약 시간 관리</h3>
        {isEditingTimes ? (
          <>
            {sortReservations(popupReservations).map(reservation => (
              <div key={reservation.id} className="reservation-time">
                <div className="reservation-time-info">
                  <span>{reservation.date}</span>
                  <span>{reservation.day}</span>
                  <span>{reservation.startTime}</span>
                  <span>예약 현황: {reservation.totalReservation}</span>
                </div>
                <div className="reservation-edit-controls">
                  <button onClick={() => handleReservationCountChange(reservation.id, 1)}>인원 추가</button>
                  <button onClick={() => handleRemoveReservationTime(reservation.id)}>삭제</button>
                  <input
                    type="number"
                    value={reservation.totalReservation}
                    onChange={(e) => handleInputChange(reservation.id, e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button className="button add" onClick={() => setShowAddReservation(true)}>예약 시간 추가</button>
            {showAddReservation && (
              <div className="reservation-add-section">
                <h3>예약 시간 추가</h3>

                <label>날짜 선택:</label>
                <Calendar
                  onChange={handleAddDateChange}
                  tileClassName={getTileClassName}
                  tileDisabled={({ date }) => isAddDateDisabled(date)}
                  value={selectedDate ? new Date(selectedDate) : new Date()}
                />

                <label>요일:</label>
                <select value={newReservation.day} onChange={handleDayChange}>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>

                <label>시작 시간:</label>
                <input
                  type="time"
                  value={newReservation.startTime}
                  onChange={handleTimeChange}
                />

                <label>총 예약 가능 인원:</label>
                <input
                  type="number"
                  value={newReservation.totalReservation}
                  onChange={handleReservationCountChange}
                />
                <button onClick={handleSaveReservationTime}>저장</button>
                <button onClick={() => setShowAddReservation(false)}>취소</button>
              </div>
            )}
            <button onClick={handleSaveChanges}>수정 완료</button>
          </>
        ) : (
          <button onClick={() => setIsEditingTimes(true)}>수정하기</button>
        )}
      </div>
      <br />
      <button className="button update" onClick={handleUpdate}>업데이트</button>
    </div>
  );
};

export default ReservationUpdate_Company;



// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './ReservationUpdate_Company.css';

// const daysOfWeek = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

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
//   const [reservationEnabled, setReservationEnabled] = useState(false);
//   const [storeDays, setStoreDays] = useState([]);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [postcode, setPostcode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [telephone, setTelephone] = useState('');
//   const [subway, setSubway] = useState('');
//   const [description, setDescription] = useState('');
//   const [link, setLink] = useState('');
//   const [mapx, setMapx] = useState('');
//   const [mapy, setMapy] = useState('');
//   const [category, setCategory] = useState([]);
//   const [popupImages, setPopupImages] = useState([]);
//   const [originalCategories, setOriginalCategories] = useState([]);
//   const [originalStoreDays, setOriginalStoreDays] = useState([]);
//   const [companyId, setCompanyId] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [distance, setDistance] = useState('');
//   const [isEditingTimes, setIsEditingTimes] = useState(false);

//   useEffect(() => {
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
//         console.log('Received Data:', data);

//         if (data && data.data) {
//           const {
//             companyId,
//             companyName,
//             title,
//             postcode,
//             address,
//             roadAddress,
//             detailAddress,
//             distance,
//             startDate,
//             endDate,
//             telephone,
//             subway,
//             description,
//             link,
//             mapx,
//             mapy,
//             categories,
//             storeDays,
//             popupReservations,
//           } = data.data;

//           setCompanyId(companyId || '');
//           setCompanyName(companyName || '');
//           setTitle(title || 'No Title');
//           setPostcode(postcode || '');
//           setAddress(address || '');
//           setRoadAddress(roadAddress || '');
//           setDetailAddress(detailAddress || '');
//           setDistance(distance || '');
//           setStartDate(convertToLocalDate(startDate));
//           setEndDate(convertToLocalDate(endDate));
//           setTelephone(telephone || '');
//           setSubway(subway || '');
//           setDescription(description || '');
//           setLink(link || '');
//           setMapx(mapx || '');
//           setMapy(mapy || '');

//           setOriginalCategories(categories || []);
//           setOriginalStoreDays(storeDays || []);

//           setCategory(categories || []);
//           setStoreDays(storeDays || []);

//           // const days = [...new Set(popupReservations.map(reservation => reservation.day))];
//           const times = popupReservations.map(reservation => ({
//             id: reservation.id,
//             date: reservation.date,
//             day: reservation.day,
//             startTime: reservation.startTime,
//             totalReservation: reservation.totalReservation,
//             isReservationEnabled: reservation.isReservationEnabled,
//           }));

//           const dayTimes = storeDays.map(storeDay => ({
//             openTime: storeDay.openTime,
//             closeTime: storeDay.closeTime,
//             day: storeDay.day
//           }));


//           const uniqueTimesMap = new Map();
//           times.forEach(time => {
//             const key = `${time.day}-${time.startTime}`;
//             if (!uniqueTimesMap.has(key)) {
//               uniqueTimesMap.set(key, time);
//             }
//           });
//           const uniqueTimes = Array.from(uniqueTimesMap.values());

//           uniqueTimes.sort((a, b) => {
//             if (a.day === b.day) {
//               return a.startTime.localeCompare(b.startTime);
//             }
//             return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
//           });

//           setStoreDays(dayTimes);
//           // setPopupReservations(uniqueTimes);

//           setPopupReservations(popupReservations);

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
//   };

//   const isDateDisabled = (date) => {
//     if (!startDate || !endDate || !popupReservations.length) return false;
//     const dateStr = new Date(date).toLocaleDateString('en-CA');

//     const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

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
//       window.location.reload();
//     } else {
//       alert('예약 활성화 처리에 실패했습니다.');
//     }
//   };

//   const handleUpdate = async () => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       alert('로그인 후 다시 시도해 주세요.');
//       return;
//     }

//     const processedStoreDays = storeDays.map(day => ({
//       day: day.day,
//       openTime: day.openTime,
//       closeTime: day.closeTime
//     }));

//     const processedReservations = popupReservations.map(reservation => ({
//       id: reservation.id,
//       day: reservation.day,
//       startTime: reservation.startTime,
//       totalReservation: reservation.totalReservation,
//       currentReservation: reservation.currentReservation,
//       isReservationEnabled: reservation.isReservationEnabled,
//       isReservationFull: reservation.isReservationFull,
//       date: reservation.date
//     }));

//     const jsonData = {
//       title,
//       postcode,
//       address,
//       roadAddress,
//       detailAddress,
//       distance,
//       startDate,
//       endDate,
//       telephone,
//       subway,
//       description,
//       link,
//       mapx,
//       mapy,
//       categories: category,
//       storeDays: processedStoreDays,
//       reservationTimes: processedReservations,
//     };

//     const formData = new FormData();
//     formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

//     imageFiles.forEach(file => {
//       formData.append('images', file);
//     });

//     try {
//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const result = await response.json();
//       console.log('Server Response:', result);

//       if (response.ok) {
//         alert('수정되었습니다!');
//         window.location.reload();
//       } else {
//         alert(`수정 실패했습니다. ${result.message || '상세 정보를 확인하세요.'}`);
//       }
//     } catch (error) {
//       alert('서버 오류');
//       console.error(error);
//     }
//   };

//   const handleOperatingDayChange = (index, key, value) => {
//     const newStoreDays = [...storeDays];
//     newStoreDays[index][key] = value;
//     setStoreDays(newStoreDays);
//   };

//   const handleTimeChange = (index, key, value) => {
//     const newReservationTimes = [...popupReservations];
//     newReservationTimes[index][key] = value;
//     setPopupReservations(newReservationTimes);
//   };

//   const handleRemoveReservationTime = async (index) => {
//     const removedTime = popupReservations[index]; // Get the reservation time being removed
//     const newReservationTimes = popupReservations.filter((_, i) => i !== index);
//     setPopupReservations(newReservationTimes);

//     if (newReservationTimes.length === 0) {
//       setReservationEnabled(false);
//     }

//     // Log the details of the removed reservation time including `isReservationEnabled`
//     console.log('Removed reservation time:', {
//       ...removedTime,
//       isReservationEnabled: false
//     });
//   }

//   const handleAddReservationTime = () => {
//     const newReservation = {
//       id: Date.now(), // or generate a unique id based on your logic
//       day: daysOfWeek[0],
//       startTime: '',
//       totalReservation: 0,
//       currentReservation: 0, // default value
//       isReservationEnabled: false, // default value
//       isReservationFull: false, // default value
//       date: new Date().toISOString().split('T')[0] // default to today's date
//     };

//     setPopupReservations([
//       ...popupReservations,
//       newReservation
//     ]);
//   };

//   const getFilteredReservations = () => {
//     return popupReservations
//       .filter(reservation => convertToLocalDate(reservation.date) === selectedDate)
//       .sort((a, b) => a.startTime.localeCompare(b.startTime));
//   };

//   const getTileClassName = ({ date }) => {
//     return isDateDisabled(date) ? 'disabled' : null;
//   };

//   const canSetDeadline = () => {
//     return selectedDate && !getFilteredReservations().every(reservation => reservation.currentReservation >= reservation.totalReservation);
//   };

//   const canActivateReservations = () => {
//     return selectedDate && getFilteredReservations().some(reservation => reservation.currentReservation < reservation.totalReservation);
//   };

//   if (loading) {
//     return <div>로딩 중...</div>;
//   }

//   if (error) {
//     return <div>에러 발생: {error}</div>;
//   }

//   return (
//     <div className="reservation-update-company">
//       <h1>{title}</h1>
//       <h2>예약 설정</h2>

//       <div className="operating-period">
//         <h3>운영 기간</h3>
//         <p>{startDate} ~ {endDate}</p>
//       </div>

//       <div className="operating-days">
//         <h3>운영 요일 및 시간</h3>
//         {storeDays.map((day, index) => (
//           <div key={index} className="operating-day">
//             <p>요일: {day.day}</p>
//             <p>운영 시간: {day.openTime} - {day.closeTime}</p>
//           </div>
//         ))}
//       </div>

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
//       <div className="grid-container">
//         {getFilteredReservations().map((reservation) => (
//           <div key={reservation.id}>
//             <p><strong>날짜:</strong> {convertToLocalDate(reservation.date)}</p>
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

//       <h2>운영 시간 및 예약 시간 설정</h2>
//       {storeDays.map((day, index) => (
//         <div key={index} className="operating-day">
//           <label>{daysOfWeek[index]}:</label>
//           <input
//             type="time"
//             value={day.startTime}
//             onChange={(e) => handleOperatingDayChange(index, 'startTime', e.target.value)}
//           />
//         </div>
//       ))}

//       <h2>예약 시간 수정</h2>
//       <button className="button edit" onClick={() => setIsEditingTimes(!isEditingTimes)}>
//         {isEditingTimes ? '수정 완료' : '수정하기'}
//       </button>

//       {popupReservations.map((time, index) => (
//         <div key={index} className="reservation-time">
//           <select
//             value={time.day}
//             onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
//             disabled={!isEditingTimes}
//           >
//             {daysOfWeek.map((day, dayIndex) => (
//               <option key={dayIndex} value={day}>{day}</option>
//             ))}
//           </select>
//           <input
//             type="time"
//             value={time.startTime}
//             onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
//             disabled={!isEditingTimes}
//           />
//           <input
//             type="number"
//             value={time.totalReservation}
//             onChange={(e) => handleTimeChange(index, 'totalReservation', e.target.value)}
//             placeholder="총 예약 인원"
//             disabled={!isEditingTimes}
//           />
//           <button onClick={() => handleRemoveReservationTime(index)} disabled={!isEditingTimes}>
//             삭제
//           </button>
//         </div>
//       ))}
//       <button
//         className="button add"
//         onClick={handleAddReservationTime}
//         disabled={!isEditingTimes}
//       >
//         예약 시간 추가
//       </button>

//       {/* <button className="button add" onClick={handleAddReservationTime}>예약 시간 추가</button> */}
//       <br />
//       <button className="button update" onClick={handleUpdate}>업데이트</button>
//     </div>
//   );
// };

// export default ReservationUpdate_Company;












// //24.09.13 put 수정 전
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import './ReservationUpdate_Company.css';

// const daysOfWeek = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];

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
//   const [reservationEnabled, setReservationEnabled] = useState(false);
//   const [storeDays, setStoreDays] = useState([]);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [postcode, setPostcode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [telephone, setTelephone] = useState('');
//   const [subway, setSubway] = useState('');
//   const [description, setDescription] = useState('');
//   const [link, setLink] = useState('');
//   const [mapx, setMapx] = useState('');
//   const [mapy, setMapy] = useState('');
//   const [category, setCategory] = useState([]);
//   const [popupImages, setPopupImages] = useState([]);
//   const [originalCategories, setOriginalCategories] = useState([]);
//   const [originalStoreDays, setOriginalStoreDays] = useState([]);
//   const [companyId, setCompanyId] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [distance, setDistance] = useState('');

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
//         console.log('Received Data:', data);

//         if (data && data.data) {
//           const {
//             companyId,
//             companyName,
//             title,
//             postcode,
//             address,
//             roadAddress,
//             detailAddress,
//             distance,
//             startDate,
//             endDate,
//             telephone,
//             subway,
//             description,
//             link,
//             mapx,
//             mapy,
//             categories,
//             storeDays,
//             popupReservations,
//           } = data.data;

//           setCompanyId(companyId || '');
//           setCompanyName(companyName || '');
//           setTitle(title || 'No Title');
//           setPostcode(postcode || '');
//           setAddress(address || '');
//           setRoadAddress(roadAddress || '');
//           setDetailAddress(detailAddress || '');
//           setDistance(distance || '');
//           setStartDate(convertToLocalDate(startDate));
//           setEndDate(convertToLocalDate(endDate));
//           setTelephone(telephone || '');
//           setSubway(subway || '');
//           setDescription(description || '');
//           setLink(link || '');
//           setMapx(mapx || '');
//           setMapy(mapy || '');

//           setOriginalCategories(categories || []);
//           setOriginalStoreDays(storeDays || []);

//           setCategory(categories || []);
//           setStoreDays(storeDays || []);

//           const days = [...new Set(popupReservations.map(reservation => reservation.day))];
//           const times = popupReservations.map(reservation => ({
//             id: reservation.id,
//             date: reservation.date,
//             day: reservation.day,
//             startTime: reservation.startTime,
//             totalReservation: reservation.totalReservation,
//             isReservationEnabled: reservation.isReservationEnabled,
//           }));

//           const uniqueTimesMap = new Map();
//           times.forEach(time => {
//             const key = `${time.day}-${time.startTime}`;
//             if (!uniqueTimesMap.has(key)) {
//               uniqueTimesMap.set(key, time);
//             }
//           });
//           const uniqueTimes = Array.from(uniqueTimesMap.values());

//           uniqueTimes.sort((a, b) => {
//             if (a.day === b.day) {
//               return a.startTime.localeCompare(b.startTime);
//             }
//             return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
//           });

//           setStoreDays(days.map(day => ({ day, startTime: '' })));
//           setPopupReservations(uniqueTimes);

//           setPopupReservations(popupReservations);

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
//   };

//   const isDateDisabled = (date) => {
//     if (!startDate || !endDate || !popupReservations.length) return false;
//     const dateStr = new Date(date).toLocaleDateString('en-CA');

//     const isOutOfRange = new Date(dateStr) < new Date(startDate) || new Date(dateStr) > new Date(endDate);

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
//       window.location.reload();
//     } else {
//       alert('예약 활성화 처리에 실패했습니다.');
//     }
//   };

//   const handleUpdate = async () => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       alert('로그인 후 다시 시도해 주세요.');
//       return;
//     }

//     const processedStoreDays = storeDays.map(day => ({
//       day: day.day,
//       openTime: day.openTime,
//       closeTime: day.closeTime
//     }));

//     const processedReservations = popupReservations.map(reservation => ({
//       id: reservation.id,
//       day: reservation.day,
//       startTime: reservation.startTime,
//       totalReservation: reservation.totalReservation,
//       currentReservation: reservation.currentReservation,
//       isReservationEnabled: reservation.isReservationEnabled,
//       isReservationFull: reservation.isReservationFull,
//       date: reservation.date
//     }));

//     const jsonData = {
//       title,
//       postcode,
//       address,
//       roadAddress,
//       detailAddress,
//       distance,
//       startDate,
//       endDate,
//       telephone,
//       subway,
//       description,
//       link,
//       mapx,
//       mapy,
//       categories: category,
//       storeDays: processedStoreDays,
//       reservationTimes: processedReservations,
//     };

//     const formData = new FormData();
//     formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

//     imageFiles.forEach(file => {
//       formData.append('images', file);
//     });

//     try {
//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const result = await response.json();
//       console.log('Server Response:', result);

//       if (response.ok) {
//         alert('수정되었습니다!');
//         window.location.reload();
//       } else {
//         alert(`수정 실패했습니다. ${result.message || '상세 정보를 확인하세요.'}`);
//       }
//     } catch (error) {
//       alert('서버 오류');
//       console.error(error);
//     }
//   };

//   const handleOperatingDayChange = (index, key, value) => {
//     const newStoreDays = [...storeDays];
//     newStoreDays[index][key] = value;
//     setStoreDays(newStoreDays);
//   };

//   const handleTimeChange = (index, key, value) => {
//     const newReservationTimes = [...popupReservations];
//     newReservationTimes[index][key] = value;
//     setPopupReservations(newReservationTimes);
//   };

//   const handleRemoveReservationTime = async (index) => {
//     const removedTime = popupReservations[index]; // Get the reservation time being removed
//     const newReservationTimes = popupReservations.filter((_, i) => i !== index);
//     setPopupReservations(newReservationTimes);

//     if (newReservationTimes.length === 0) {
//       setReservationEnabled(false);
//     }

//     // Log the details of the removed reservation time including `isReservationEnabled`
//     console.log('Removed reservation time:', {
//       ...removedTime,
//       isReservationEnabled: false
//     });
//   }

//   const handleAddReservationTime = () => {
//     const newReservation = {
//       id: Date.now(), // or generate a unique id based on your logic
//       day: daysOfWeek[0],
//       startTime: '',
//       totalReservation: 0,
//       currentReservation: 0, // default value
//       isReservationEnabled: false, // default value
//       isReservationFull: false, // default value
//       date: new Date().toISOString().split('T')[0] // default to today's date
//     };

//     setPopupReservations([
//       ...popupReservations,
//       newReservation
//     ]);
//   };

//   const getFilteredReservations = () => {
//     return popupReservations
//       .filter(reservation => convertToLocalDate(reservation.date) === selectedDate)
//       .sort((a, b) => a.startTime.localeCompare(b.startTime));
//   };

//   const getTileClassName = ({ date }) => {
//     return isDateDisabled(date) ? 'disabled' : null;
//   };

//   const canSetDeadline = () => {
//     return selectedDate && !getFilteredReservations().every(reservation => reservation.currentReservation >= reservation.totalReservation);
//   };

//   const canActivateReservations = () => {
//     return selectedDate && getFilteredReservations().some(reservation => reservation.currentReservation < reservation.totalReservation);
//   };

//   if (loading) {
//     return <div>로딩 중...</div>;
//   }

//   if (error) {
//     return <div>에러 발생: {error}</div>;
//   }

//   return (
//     <div className="reservation-update-company">
//       <h1>{title}</h1>
//       <h2>예약 설정</h2>

//       <div className="operating-period">
//         <h3>운영 기간</h3>
//         <p>{startDate} ~ {endDate}</p>
//       </div>

//       <div className="operating-days">
//         <h3>운영 요일 및 시간</h3>
//         {storeDays.map((day, index) => (
//           <div key={index} className="operating-day">
//             <p>요일: {day.day}</p>
//             <p>운영 시간: {day.openTime} - {day.closeTime}</p>
//           </div>
//         ))}
//       </div>

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
//       <div className="grid-container">
//         {getFilteredReservations().map((reservation) => (
//           <div key={reservation.id}>
//             <p><strong>날짜:</strong> {convertToLocalDate(reservation.date)}</p>
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

//       <h2>운영 시간 및 예약 시간 설정</h2>
//       {storeDays.map((day, index) => (
//         <div key={index} className="operating-day">
//           <label>{daysOfWeek[index]}:</label>
//           <input
//             type="time"
//             value={day.startTime}
//             onChange={(e) => handleOperatingDayChange(index, 'startTime', e.target.value)}
//           />
//         </div>
//       ))}

//       <h2>예약 시간 추가</h2>
//       {popupReservations.map((time, index) => (
//         <div key={index} className="reservation-time">
//           <select
//             value={time.day}
//             onChange={(e) => handleTimeChange(index, 'day', e.target.value)}
//           >
//             {daysOfWeek.map((day, dayIndex) => (
//               <option key={dayIndex} value={day}>{day}</option>
//             ))}
//           </select>
//           <input
//             type="time"
//             value={time.startTime}
//             onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
//           />
//           <input
//             type="number"
//             value={time.totalReservation}
//             onChange={(e) => handleTimeChange(index, 'totalReservation', e.target.value)}
//             placeholder="총 예약 인원"
//           />
//           <button onClick={() => handleRemoveReservationTime(index)}>삭제</button>
//         </div>
//       ))}

//       <button className="button add" onClick={handleAddReservationTime}>예약 시간 추가</button>

//       <button className="button update" onClick={handleUpdate}>업데이트</button>
//     </div>
//   );
// };

// export default ReservationUpdate_Company;