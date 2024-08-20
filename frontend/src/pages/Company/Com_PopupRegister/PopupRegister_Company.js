import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DaumPostcode from 'react-daum-postcode';
import './PopupRegister_Company.css';

const PopupRegister_Company = () => {
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [operatingStartDate, setOperatingStartDate] = useState(null);
  const [operatingEndDate, setOperatingEndDate] = useState(null);
  const [telephone, setPhoneNumber] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [subway, setSubway] = useState('');
  const [category, setCategory] = useState([]);
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [link, setLink] = useState('');
  const [operatingDays, setOperatingDays] = useState({
    월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
  });
  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [showPostcodeModal, setShowPostcodeModal] = useState(false);
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [totalReservation, setTotalReservation] = useState('');
  const [currentReservation, setCurrentReservation] = useState('');
  const [reservation, setReservation] = useState(false);
  const [companyReservation, setCompanyReservation] = useState([]);
  const [popupReservation, setPopupReservation] = useState([]);
  const [reservationInterval, setReservationInterval] = useState(30); // 예약 슬롯 간격 (분)
  const [reservationCapacity, setReservationCapacity] = useState(10); // 슬롯당 수용 인원
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');


  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setToken(token);

      fetch("http://localhost:8080/company/companyname", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then((res) => res.text())
      .then(res => {
        if (res) {
          setCompanyName(res);
        }
      })
      .catch(error => {
        console.error('닉네임 가져오기 중 오류 발생:', error);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handlePostcodeComplete = (data) => {
    const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
    setPostcode(data.zonecode); // Set postcode
    setAddress(data.jibunAddress); // Set jibun address
    setRoadAddress(data.roadAddress); // Set road address
    fetchCoordinates(data.roadAddress); // 주소를 좌표로 변환
    setShowPostcodeModal(false);
  };

  // 네이버 지도 좌표 변환 코드 (다음 주소에서 주소를 받아 네이버 api에서 좌표 변환)
  const fetchCoordinates = (address) => {
    if (window.naver && window.naver.maps && window.naver.maps.Service) {
      const geocoder = window.naver.maps.Service;

      geocoder.geocode({ address: address }, (status, response) => {
        console.log('Geocode response:', response); // 응답 객체 전체 출력
        if (status === window.naver.maps.Service.Status.OK) {
          if (response.result && response.result.items && response.result.items.length > 0) {
            const item = response.result.items[0];
            if (item.point) {
              const x = item.point.x;
              const y = item.point.y;
              // 소수점 제거
              const formattedX = x.toString().replace('.', '');
              const formattedY = y.toString().replace('.', '');
              console.log(`좌표 변환 성공: x = ${formattedX}, y = ${formattedY}`);
              setCoordinates({ mapx: formattedX, mapy: formattedY });
            } else {
              console.error('응답에서 좌표 포인트를 찾을 수 없습니다.');
              setCoordinates({ mapx: '', mapy: '' });
            }
          } else {
            console.error('응답에서 항목을 찾을 수 없습니다.');
            setCoordinates({ mapx: '', mapy: '' });
          }
        } else {
          console.error('주소로부터 좌표를 가져오는데 실패했습니다.', status);
          setCoordinates({ mapx: '', mapy: '' });
        }
      });
    } else {
      console.error('네이버 지도 API를 로드하지 못했습니다.');
    }
  };
  
  // title과 description 입력 시 ai 호출 요청
  const fetchCategorySuggestions = async (title, description) => {
    try {
      console.log('Fetching category suggestions for:', title, description);
      const response = await fetch('http://localhost:8080/popup/ai/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received categories:', data);

      if (Array.isArray(data)) {
        const allCategories = data.flatMap(item => item.categories || []);
        console.log('categories:', allCategories);
        setCategory(allCategories);
      } else {
        console.error('Received categories data is not in the expected format:', data);
        setCategory([]);
      }
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      setCategory([]);
    }
  };

  const handleAddReservationSlot = () => {
    const selectedDays = Object.keys(operatingDays).filter(day => operatingDays[day].isSelected);
  
    if (selectedDays.length === 0) {
      alert('요일을 선택해 주세요.');
      return;
    }
  
    const newSlots = [];
  
    selectedDays.forEach(day => {
      const dayData = operatingDays[day];
      let slotStartTime = dayData.startTime;
      let slotEndTime = calculateEndTime(slotStartTime, reservationInterval);
  
      while (slotEndTime <= dayData.endTime) {
        newSlots.push({
          day,
          startTime: slotStartTime,
          endTime: slotEndTime,
          totalReservation: reservationCapacity,
          currentReservation: 0
        });
  
        // 다음 슬롯의 시작 시간 설정
        slotStartTime = slotEndTime;
        slotEndTime = calculateEndTime(slotStartTime, reservationInterval);
      }
    });
  
    // 새로운 예약 슬롯을 기존 예약 슬롯과 합치기
    setPopupReservation(prevSlots => [
      ...prevSlots,
      ...newSlots
    ]);
  };

  const calculateEndTime = (startTime, interval) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
  
    // 종료 시간 계산
    const endDate = new Date(startDate.getTime() + interval * 60000);
    const endHour = String(endDate.getHours()).padStart(2, '0');
    const endMinute = String(endDate.getMinutes()).padStart(2, '0');
  
    return `${endHour}:${endMinute}`;
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // JSON 데이터 생성
    const jsonData = {
      title,
      postcode,
      address,
      roadAddress,
      detailAddress,
      startDate: operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '',
      endDate: operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '',
      telephone,
      subway,
      description,
      link,
      mapx: coordinates.mapx,
      mapy: coordinates.mapy,
      totalReservation,
      currentReservation,
      reservation,
      categories: category.map(cat => ({ category: cat.category })),
      storeDays: Object.keys(operatingDays)
        .filter(day => operatingDays[day].isSelected)
        .map(day => ({
          openTime: operatingDays[day].startTime,
          closeTime: operatingDays[day].endTime,
          day
        })),
      popupReservations: popupReservation
    };
  
    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
  
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });
  
    // 콘솔에 데이터 출력
    console.log('JSON 데이터:', JSON.stringify(jsonData, null, 2));
    console.log('FormData 객체:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });
  
    try {
      const response = await fetch('http://localhost:8080/popup/company/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Success:', result);
  
      alert('등록되었습니다!');
      navigate('/auth/company/homepage');
    } catch (error) {
      console.error('Error:', error);
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  
  const handleAddressSearch = () => {
    setShowPostcodeModal(true);
  };

  const handleOperatingStartDateChange = (date) => {
    setOperatingStartDate(date);
    setOperatingEndDate(null);
  };

  const handleOperatingEndDateChange = (date) => {
    if (operatingStartDate === null || date < operatingStartDate) {
      setOperatingStartDate(date);
    }
    setOperatingEndDate(date);
  };

  const handleDayChange = (day) => {
    setOperatingDays(prevDays => {
      const updatedDays = { ...prevDays, [day]: { ...prevDays[day], isSelected: !prevDays[day].isSelected } };
      const newSelectedDays = Object.keys(updatedDays).filter(day => updatedDays[day].isSelected);
      setSelectedDay(newSelectedDays.length > 0 ? newSelectedDays[0] : '');
      return updatedDays;
    });
  };


  const handleTimeChange = (day, timeType, time) => {
    setOperatingDays((prevDays) => ({
      ...prevDays,
      [day]: {
        ...prevDays[day],
        [timeType]: time,
      },
    }));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (e.inputType === 'insertText' && e.data === ' ') {
      console.log('API Call for Title');
      fetchCategorySuggestions(newTitle, description);
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    if (e.inputType === 'insertText' && (e.data === '.' || e.data === '!' || e.data === '~' || e.data === '?' || e.data === ',')) {
      console.log('API Call for Description');
      fetchCategorySuggestions(title, newDescription);
    }
  };

  const handleFileChange = (e) => {
    setImageFiles([...e.target.files]);
  };
  
  useEffect(() => {
    const titleInput = document.getElementById('title-input');
    const descriptionTextarea = document.getElementById('description-textarea');

    titleInput.addEventListener('input', handleTitleChange);
    descriptionTextarea.addEventListener('input', handleDescriptionChange);

    return () => {
      titleInput.removeEventListener('input', handleTitleChange);
      descriptionTextarea.removeEventListener('input', handleDescriptionChange);
    };
  }, [title, description]);

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      timeOptions.push(formattedTime);
    }
  }

  const handleReservationIntervalChange = (e) => {
    setReservationInterval(Number(e.target.value));
  };

  const handleReservationCapacityChange = (e) => {
    setReservationCapacity(Number(e.target.value));
  };

  return (
    <div className="popup-registration">
      <h1>팝업 등록</h1>
      <form onSubmit={handleSubmit}>
        <label>
          제목:
          <input
            type="text"
            id="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          주최사:
          <input
            type="text"
            value={companyName}
            readOnly e
          />
        </label>

        <label>
           운영기간:
           <div className="date-picker-container">
             <DatePicker
               selected={operatingStartDate}
               onChange={handleOperatingStartDateChange}
               selectsStart
               startDate={operatingStartDate}
               endDate={operatingEndDate}
               placeholderText="운영 시작일"
               required
               showMonthDropdown
               showYearDropdown
               dropdownMode="select"
               withPortal
               closeOnScroll={true}
            />
            {' ~ '}
            <DatePicker
              selected={operatingEndDate}
              onChange={handleOperatingEndDateChange}
              selectsEnd
              startDate={operatingStartDate}
              endDate={operatingEndDate}
              minDate={operatingStartDate}
              placeholderText="운영 종료일"
              required
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              withPortal
              closeOnScroll={true}
            />
          </div>
        </label>

        <label>
          전화번호:
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>

        <label>
           우편번호:
           <div className="postcode-container">
             <input
              type="text"
              value={postcode}
              readOnly
            />
            <button
              onClick={handleAddressSearch}
              className="searchButton"
            >
              주소찾기
            </button>
          </div>
        </label>

        <label>
          도로명 주소:
          <input
            type="text"
            value={roadAddress}
            readOnly
            onClick={() => setShowPostcodeModal(true)}
            required
          />
        </label>

        <div className="road-address">
          <label>지번 주소:</label>
          <span>{address}</span>
        </div>

        <br/>

        <label>
          상세 주소:
          <input
            type="text"
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            required
          />
        </label>

        <label>
          지하철역:
          <input
            type="text"
            value={subway}
            onChange={(e) => setSubway(e.target.value)}
          />
        </label>
        
        <label>
          설명:
          <textarea
            id="description-textarea"
            value={description}
            onChange={handleDescriptionChange}
            // onKeyDown={handleKeyDown}
            required
          />
        </label>

        <label>
          카테고리:
          <div className="categories">
            {category.map((cat, index) => (
              <div key={index} className="category-box2">
                {cat.category}
              </div>
            ))}
          </div>
        </label>

        <label>
          이미지 삽입
          <div className="form-group">
          <input type="file" id="imageFiles" multiple accept="image/*" onChange={handleFileChange} />
        </div>
        </label>

        <label>
          링크 삽입(sns, url)
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </label>

        <div className="operating-days">
          <h3>영업 요일:</h3>
          {Object.keys(operatingDays).map((day) => (
            <div key={day} className="day-container">
              <input
                type="checkbox"
                checked={operatingDays[day].isSelected}
                onChange={() => handleDayChange(day)}
              />
              <label>{day}</label>
              {operatingDays[day].isSelected && (
                <div className="time-picker-container">
                  <select
                    value={operatingDays[day].startTime}
                    onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                  >
                    {timeOptions.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  {' ~ '}
                  <select
                    value={operatingDays[day].endTime}
                    onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                  >
                    {timeOptions.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        <br/>

        <label>
          사전 예약 활성화:
          <input
            type="checkbox"
            checked={reservation}
            onChange={(e) => setReservation(e.target.checked)}
          />
        </label>

        {reservation && (
          <>
            <label>
              예약 간격 (분):
              <input
                type="number"
                value={reservationInterval}
                onChange={handleReservationIntervalChange}
              />
            </label>
            <label>
              슬롯당 수용 인원:
              <input
                type="number"
                value={reservationCapacity}
                onChange={handleReservationCapacityChange}
              />
            </label>
            <button type="button" onClick={handleAddReservationSlot}>
              예약 슬롯 추가
            </button>
            <div>
              <h3>예약 슬롯</h3>
              {popupReservation.length > 0 ? (
                popupReservation.map((slot, index) => (
                  <div key={index}>
                    <p>요일: {slot.day}</p>
                    <p>시간: {slot.startTime} ~ {slot.endTime}</p>
                    <p>수용 인원: {slot.totalReservation}명</p>
                  </div>
                ))
              ) : (
                <p>추가된 예약 슬롯이 없습니다.</p>
              )}
            </div>
          </>
        )}


        <br/>

        <button type="submit">등록</button>
      </form>

      {showPostcodeModal && (
        <div className="postcode-modal">
          <div className="postcode-modal-content">
            <DaumPostcode onComplete={handlePostcodeComplete} />
            <button onClick={() => setShowPostcodeModal(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupRegister_Company;










// // 2024.08.18 사전예약 활성화 코드 - 오류 수정 전
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupRegister_Company.css';

// const PopupRegister_Company = () => {
//   const [title, setTitle] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState(null);
//   const [operatingEndDate, setOperatingEndDate] = useState(null);
//   const [telephone, setPhoneNumber] = useState('');
//   const [postcode, setPostcode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [subway, setSubway] = useState('');
//   const [category, setCategory] = useState([]);
//   const [description, setDescription] = useState('');
//   const [imageFiles, setImageFiles] = useState([]);
//   const [link, setLink] = useState('');
//   const [operatingDays, setOperatingDays] = useState({
//     월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//   });
//   const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
//   const [showPostcodeModal, setShowPostcodeModal] = useState(false);
//   const [token, setToken] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const [totalReservation, setTotalReservation] = useState('');
//   const [currentReservation, setCurrentReservation] = useState('');
//   const [reservation, setReservation] = useState(false);
//   const [companyReservation, setCompanyReservation] = useState([]);
//   const [popupReservation, setPopupReservation] = useState([]);
//   const [reservationInterval, setReservationInterval] = useState(30); // 예약 슬롯 간격 (분)
//   const [reservationCapacity, setReservationCapacity] = useState(10); // 슬롯당 수용 인원
//   const [selectedDay, setSelectedDay] = useState('');
//   const [startTime, setStartTime] = useState('00:00');
//   const [endTime, setEndTime] = useState('23:59');


//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsLoggedIn(true);
//       setToken(token);

//       fetch("http://localhost:8080/company/companyname", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then((res) => res.text())
//       .then(res => {
//         if (res) {
//           setCompanyName(res);
//         }
//       })
//       .catch(error => {
//         console.error('닉네임 가져오기 중 오류 발생:', error);
//       });
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, []);

//   const handlePostcodeComplete = (data) => {
//     const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
//     setPostcode(data.zonecode); // Set postcode
//     setAddress(data.jibunAddress); // Set jibun address
//     setRoadAddress(data.roadAddress); // Set road address
//     fetchCoordinates(data.roadAddress); // 주소를 좌표로 변환
//     setShowPostcodeModal(false);
//   };

//   // 네이버 지도 좌표 변환 코드 (다음 주소에서 주소를 받아 네이버 api에서 좌표 변환)
//   const fetchCoordinates = (address) => {
//     if (window.naver && window.naver.maps && window.naver.maps.Service) {
//       const geocoder = window.naver.maps.Service;

//       geocoder.geocode({ address: address }, (status, response) => {
//         console.log('Geocode response:', response); // 응답 객체 전체 출력
//         if (status === window.naver.maps.Service.Status.OK) {
//           if (response.result && response.result.items && response.result.items.length > 0) {
//             const item = response.result.items[0];
//             if (item.point) {
//               const x = item.point.x;
//               const y = item.point.y;
//               // 소수점 제거
//               const formattedX = x.toString().replace('.', '');
//               const formattedY = y.toString().replace('.', '');
//               console.log(`좌표 변환 성공: x = ${formattedX}, y = ${formattedY}`);
//               setCoordinates({ mapx: formattedX, mapy: formattedY });
//             } else {
//               console.error('응답에서 좌표 포인트를 찾을 수 없습니다.');
//               setCoordinates({ mapx: '', mapy: '' });
//             }
//           } else {
//             console.error('응답에서 항목을 찾을 수 없습니다.');
//             setCoordinates({ mapx: '', mapy: '' });
//           }
//         } else {
//           console.error('주소로부터 좌표를 가져오는데 실패했습니다.', status);
//           setCoordinates({ mapx: '', mapy: '' });
//         }
//       });
//     } else {
//       console.error('네이버 지도 API를 로드하지 못했습니다.');
//     }
//   };
  
//   // title과 description 입력 시 ai 호출 요청
//   const fetchCategorySuggestions = async (title, description) => {
//     try {
//       console.log('Fetching category suggestions for:', title, description);
//       const response = await fetch('http://localhost:8080/popup/ai/category', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title, description }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Received categories:', data);

//       if (Array.isArray(data)) {
//         const allCategories = data.flatMap(item => item.categories || []);
//         console.log('categories:', allCategories);
//         setCategory(allCategories);
//       } else {
//         console.error('Received categories data is not in the expected format:', data);
//         setCategory([]);
//       }
//     } catch (error) {
//       console.error('Error fetching category suggestions:', error);
//       setCategory([]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     // JSON 데이터 생성
//     const jsonData = {
//       title,
//       postcode,
//       address,
//       roadAddress,
//       detailAddress,
//       startDate: operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '',
//       endDate: operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '',
//       telephone,
//       subway,
//       description,
//       link,
//       mapx: coordinates.mapx,
//       mapy: coordinates.mapy,
//       totalReservation,
//       currentReservation,
//       reservation,
//       categories: category.map(cat => ({ category: cat.category })),
//       storeDays: Object.keys(operatingDays)
//         .filter(day => operatingDays[day].isSelected)
//         .map(day => ({
//           openTime: operatingDays[day].startTime,
//           closeTime: operatingDays[day].endTime,
//           day
//         })),
//       companyReservation
//     };

//     const formData = new FormData();
//     formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
  
//     imageFiles.forEach((file, index) => {
//       formData.append('images', file);
//     });
  
//     // 콘솔에 데이터 출력
//     console.log('JSON 데이터:', JSON.stringify(jsonData, null, 2));
//     console.log('FormData 객체:');
//     formData.forEach((value, key) => {
//       console.log(key, value);
//     });
  
//     try {
//       const response = await fetch('http://localhost:8080/popup/company/register', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
  
//       const result = await response.json();
//       console.log('Success:', result);
  
//       alert('등록되었습니다!');
//       navigate('/auth/company/homepage');
//     } catch (error) {
//       console.error('Error:', error);
//       alert('등록에 실패했습니다. 다시 시도해주세요.');
//     }
//   };
  
//   const handleAddressSearch = () => {
//     setShowPostcodeModal(true);
//   };

//   const handleOperatingStartDateChange = (date) => {
//     setOperatingStartDate(date);
//     setOperatingEndDate(null);
//   };

//   const handleOperatingEndDateChange = (date) => {
//     if (operatingStartDate === null || date < operatingStartDate) {
//       setOperatingStartDate(date);
//     }
//     setOperatingEndDate(date);
//   };

//   const handleDayChange = (day) => {
//     setOperatingDays(prevDays => {
//       const updatedDays = { ...prevDays, [day]: { ...prevDays[day], isSelected: !prevDays[day].isSelected } };
//       const newSelectedDays = Object.keys(updatedDays).filter(day => updatedDays[day].isSelected);
//       setSelectedDay(newSelectedDays.length > 0 ? newSelectedDays[0] : '');
//       return updatedDays;
//     });
//   };


//   const handleTimeChange = (day, timeType, time) => {
//     setOperatingDays((prevDays) => ({
//       ...prevDays,
//       [day]: {
//         ...prevDays[day],
//         [timeType]: time,
//       },
//     }));
//   };

//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value;
//     setTitle(newTitle);

//     if (e.inputType === 'insertText' && e.data === ' ') {
//       console.log('API Call for Title');
//       fetchCategorySuggestions(newTitle, description);
//     }
//   };

//   const handleDescriptionChange = (e) => {
//     const newDescription = e.target.value;
//     setDescription(newDescription);

//     if (e.inputType === 'insertText' && (e.data === '.' || e.data === '!' || e.data === '~' || e.data === '?' || e.data === ',')) {
//       console.log('API Call for Description');
//       fetchCategorySuggestions(title, newDescription);
//     }
//   };

//   const handleFileChange = (e) => {
//     setImageFiles([...e.target.files]);
//   };
  
//   useEffect(() => {
//     const titleInput = document.getElementById('title-input');
//     const descriptionTextarea = document.getElementById('description-textarea');

//     titleInput.addEventListener('input', handleTitleChange);
//     descriptionTextarea.addEventListener('input', handleDescriptionChange);

//     return () => {
//       titleInput.removeEventListener('input', handleTitleChange);
//       descriptionTextarea.removeEventListener('input', handleDescriptionChange);
//     };
//   }, [title, description]);

//   const timeOptions = [];
//   for (let hour = 0; hour < 24; hour++) {
//     for (let minute = 0; minute < 60; minute += 30) {
//       const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
//       timeOptions.push(formattedTime);
//     }
//   }

//   const handleReservationIntervalChange = (e) => {
//     setReservationInterval(Number(e.target.value));
//   };

//   const handleReservationCapacityChange = (e) => {
//     setReservationCapacity(Number(e.target.value));
//   };

//   const handleAddReservationSlot = () => {
//     const selectedDays = Object.keys(operatingDays).filter(day => operatingDays[day].isSelected);

//     if (selectedDays.length === 0) {
//       alert('요일을 선택해 주세요.');
//       return;
//     }
  
//     const newSlots = selectedDays.map(day => ({
//       day,
//       interval: reservationInterval,
//       capacity: reservationCapacity,
//       startTime,
//       endTime
//     }));

//     setPopupReservation(prevSlots => [
//       ...prevSlots,
//       ...newSlots
//     ]);
//   };

//   return (
//     <div className="popup-registration">
//       <h1>팝업 등록</h1>
//       <form onSubmit={handleSubmit}>
//         <label>
//           제목:
//           <input
//             type="text"
//             id="title-input"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//         </label>

//         <label>
//           주최사:
//           <input
//             type="text"
//             value={companyName}
//             readOnly e
//           />
//         </label>

//         <label>
//            운영기간:
//            <div className="date-picker-container">
//              <DatePicker
//                selected={operatingStartDate}
//                onChange={handleOperatingStartDateChange}
//                selectsStart
//                startDate={operatingStartDate}
//                endDate={operatingEndDate}
//                placeholderText="운영 시작일"
//                required
//                showMonthDropdown
//                showYearDropdown
//                dropdownMode="select"
//                withPortal
//                closeOnScroll={true}
//             />
//             {' ~ '}
//             <DatePicker
//               selected={operatingEndDate}
//               onChange={handleOperatingEndDateChange}
//               selectsEnd
//               startDate={operatingStartDate}
//               endDate={operatingEndDate}
//               minDate={operatingStartDate}
//               placeholderText="운영 종료일"
//               required
//               showMonthDropdown
//               showYearDropdown
//               dropdownMode="select"
//               withPortal
//               closeOnScroll={true}
//             />
//           </div>
//         </label>

//         <label>
//           전화번호:
//           <input
//             type="tel"
//             value={telephone}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             required
//           />
//         </label>

//         <label>
//            우편번호:
//            <div className="postcode-container">
//              <input
//               type="text"
//               value={postcode}
//               readOnly
//             />
//             <button
//               onClick={handleAddressSearch}
//               className="searchButton"
//             >
//               주소찾기
//             </button>
//           </div>
//         </label>

//         <label>
//           도로명 주소:
//           <input
//             type="text"
//             value={roadAddress}
//             readOnly
//             onClick={() => setShowPostcodeModal(true)}
//             required
//           />
//         </label>

//         <div className="road-address">
//           <label>지번 주소:</label>
//           <span>{address}</span>
//         </div>

//         <br/>

//         <label>
//           상세 주소:
//           <input
//             type="text"
//             value={detailAddress}
//             onChange={(e) => setDetailAddress(e.target.value)}
//             required
//           />
//         </label>

//         <label>
//           지하철역:
//           <input
//             type="text"
//             value={subway}
//             onChange={(e) => setSubway(e.target.value)}
//           />
//         </label>
        
//         <label>
//           설명:
//           <textarea
//             id="description-textarea"
//             value={description}
//             onChange={handleDescriptionChange}
//             // onKeyDown={handleKeyDown}
//             required
//           />
//         </label>

//         <label>
//           카테고리:
//           <div className="categories">
//             {category.map((cat, index) => (
//               <div key={index} className="category-box2">
//                 {cat.category}
//               </div>
//             ))}
//           </div>
//         </label>

//         <label>
//           이미지 삽입
//           <div className="form-group">
//           <input type="file" id="imageFiles" multiple accept="image/*" onChange={handleFileChange} />
//         </div>
//         </label>

//         <label>
//           링크 삽입(sns, url)
//           <input
//             type="url"
//             value={link}
//             onChange={(e) => setLink(e.target.value)}
//           />
//         </label>

//         <div className="operating-days">
//           <h3>영업 요일:</h3>
//           {Object.keys(operatingDays).map((day) => (
//             <div key={day} className="day-container">
//               <input
//                 type="checkbox"
//                 checked={operatingDays[day].isSelected}
//                 onChange={() => handleDayChange(day)}
//               />
//               <label>{day}</label>
//               {operatingDays[day].isSelected && (
//                 <div className="time-picker-container">
//                   <select
//                     value={operatingDays[day].startTime}
//                     onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
//                   >
//                     {timeOptions.map((time, index) => (
//                       <option key={index} value={time}>
//                         {time}
//                       </option>
//                     ))}
//                   </select>
//                   {' ~ '}
//                   <select
//                     value={operatingDays[day].endTime}
//                     onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
//                   >
//                     {timeOptions.map((time, index) => (
//                       <option key={index} value={time}>
//                         {time}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <br/>

//         <label>
//           사전 예약 활성화:
//           <input
//             type="checkbox"
//             checked={reservation}
//             onChange={(e) => setReservation(e.target.checked)}
//           />
//         </label>

//         {reservation && (
//           <>
//             <label>
//               예약 간격 (분):
//               <input
//                 type="number"
//                 value={reservationInterval}
//                 onChange={handleReservationIntervalChange}
//               />
//             </label>
//             <label>
//               슬롯당 수용 인원:
//               <input
//                 type="number"
//                 value={reservationCapacity}
//                 onChange={handleReservationCapacityChange}
//               />
//             </label>
//             <button type="button" onClick={handleAddReservationSlot}>
//               예약 슬롯 추가
//             </button>
//             <div>
//               <h3>예약 슬롯</h3>
//               {popupReservation.map((slot, index) => (
//                 <div key={index}>
//                   <p>요일: {slot.day}, 간격: {slot.interval}분, 수용 인원: {slot.capacity}명</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         <br/>

//         <button type="submit">등록</button>
//       </form>

//       {showPostcodeModal && (
//         <div className="postcode-modal">
//           <div className="postcode-modal-content">
//             <DaumPostcode onComplete={handlePostcodeComplete} />
//             <button onClick={() => setShowPostcodeModal(false)}>닫기</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PopupRegister_Company;