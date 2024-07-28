/*
    수정사항 예정 [24.07.27]
    1. 운영기간 수정 - 시작 캘린터 선택 후 자동으로 종료 캘린더로 넘어가도록 설정
                      종료 캘린더에서 날짜를 설정하면 캘린더가 닫히도록 설정
    2. 운영시간 수정 - 날짜를 모두 드롭다운으로 설정
                    - 운영요일 및 시간 영역 빈 공간을 클릭하면 월요일 체크박스가 활성화됨
    3. title과 description 입력 시 이벤트리스너를 사용하여 실시간 카테고리 추천 호출
*/

// //2024.07.28 카테고리 api 호출 관련 코드
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DaumPostcode from 'react-daum-postcode';
import './PopupRegister.css';

const PopupRegistration = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [operatingStartDate, setOperatingStartDate] = useState(null);
  const [operatingEndDate, setOperatingEndDate] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [subway, setSubway] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState([]);
  const [description, setDescription] = useState('');
  const [operatingDays, setOperatingDays] = useState({
    월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
  });

  const [showPostcodeModal, setShowPostcodeModal] = useState(false);
  const navigate = useNavigate();

  const handlePostcodeComplete = (data) => {
    const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
    setAddress(fullAddress);
    setRoadAddress(data.roadAddress);
    setShowPostcodeModal(false);
  };

  // 카테고리 api 전달 함수------------------------------------------------
  const fetchCategorySuggestions = async (title, description) => {
    console.log('Fetching category suggestions with:', { title, description }); // API 호출 로그
    try {
      const response = await fetch('http://localhost:8080/popup/ai/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }), // title과 description을 JSON형태로 전달
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // API 응답 로그

      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].categories)) {
        setCategory(data[0].categories); // 카테고리 배열 설정
      } else {
        console.error('Received categories data is not in the expected format:', data);
        setCategory([]); // 비어있는 배열로 초기화
      }
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      setCategory([]); // 에러 발생 시 빈 배열로 설정
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const storeDays = Object.keys(operatingDays)
      .filter(day => operatingDays[day].isSelected)
      .map(day => ({
        day,
        openTime: operatingDays[day].startTime,
        closeTime: operatingDays[day].endTime
      }));

    const formData = new FormData();
    formData.append('title', title);
    formData.append('company', company);
    formData.append('startDate', operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '');
    formData.append('endDate', operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '');
    formData.append('telephone', phoneNumber);
    formData.append('address', address);
    formData.append('roadAddress', roadAddress);
    formData.append('subway', subway);
    formData.append('description', description);
    formData.append('category', JSON.stringify(category));
    formData.append('storeDays', JSON.stringify(storeDays));
    if (image) {
      formData.append('image', image);
    }

    fetch('http://localhost:8080/popup/register', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        navigate('/');
      })
      .catch((error) => {
        console.error('Error:', error);
      });
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
    setOperatingDays((prevDays) => ({
      ...prevDays,
      [day]: {
        ...prevDays[day],
        isSelected: !prevDays[day].isSelected,
      },
    }));
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

  // title 필드 값이 변경될 때마다 호출
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    console.log('Title Input Changed:', newTitle);
  
    // title 입력 시, 스페이스 바 입력 받으면 API 호출
    if (e.inputType === 'insertText' && e.data === ' ') {
      console.log('Triggering API Call for Title');
      fetchCategorySuggestions(newTitle, description);
    }
  };

  // description 필드 값이 변경될 때마다 호출
  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
  
    // description 입력 시, .(온점) 또는 엔터키 입력 받으면 API 호출
    if (e.inputType === 'insertText' && (e.data === '.' || e.data === '\n')) {
      console.log('Triggering API Call for Description');
      fetchCategorySuggestions(title, newDescription);
    }
  
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === '.' || e.key === 'Enter') {
      e.preventDefault(); // Enter 키의 기본 동작 방지그
      console.log('Title:', title); // 현재 제목 로그
      console.log('Description:', description); // 현재 설명 로그

      // API 호출
      fetchCategorySuggestions(title, description);
    }
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
          회사명:
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
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
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>

        <label>
          주소:
          <input
            type="text"
            value={address}
            readOnly
            onClick={() => setShowPostcodeModal(true)}
            required
          />
        </label>
        <div className="road-address">
          <label>도로명 주소:</label>
          <span>{roadAddress}</span>
        </div>

        <label>
          지하철역:
          <input
            type="text"
            value={subway}
            onChange={(e) => setSubway(e.target.value)}
          />
        </label>

        <label>
          이미지:
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
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
          설명:
          <textarea
            id="description-textarea"
            value={description}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            required
          />
        </label>

        <div className="operating-days">
          <h3>영업 요일:</h3>
          {Object.keys(operatingDays).map((day) => (
            <div key={day}>
              <input
                type="checkbox"
                checked={operatingDays[day].isSelected}
                onChange={() => handleDayChange(day)}
              />
              <label>{day}</label>
              {operatingDays[day].isSelected && (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>

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

export default PopupRegistration;










// //24.07.27 이벤트리스너 삽입 전 코드
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupRegister.css';

// const PopupRegistration = () => {
//   const [title, setTitle] = useState('');
//   const [company, setCompany] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState(null);
//   const [operatingEndDate, setOperatingEndDate] = useState(null);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [subway, setSubway] = useState('');
//   const [image, setImage] = useState(null);
//   const [category, setCategory] = useState('');
//   const [description, setDescription] = useState('');
//   const [operatingDays, setOperatingDays] = useState({
//     월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//   });

//   const [showPostcodeModal, setShowPostcodeModal] = useState(false);

//   const navigate = useNavigate();

//   const handlePostcodeComplete = (data) => {
//     const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
//     setAddress(fullAddress);
//     setRoadAddress(data.roadAddress);
//     setShowPostcodeModal(false);
//   };
  
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const storeDays = Object.keys(operatingDays)
//     .filter(day => operatingDays[day].isSelected)
//     .map(day => ({
//         day,
//         openTime: operatingDays[day].startTime,
//         closeTime: operatingDays[day].endTime
//     }));

//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('company', company);
//     formData.append('startDate', operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '');
//     formData.append('endDate', operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '');
//     formData.append('telephone', phoneNumber);
//     formData.append('address', address);
//     formData.append('roadAddress', roadAddress);
//     formData.append('subway', subway);
//     formData.append('description', description);
//     formData.append('category', category);
//     formData.append('categories', JSON.stringify([{ category }]));
//     formData.append('storeDays', JSON.stringify(storeDays));
//     if (image) {
//       formData.append('image', image);
//     }

//     fetch('http://your-backend-url/popupstore/register', {
//       method: 'POST',
//       body: formData
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log('Success:', data);
//       navigate('/');
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
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
//     setOperatingDays((prevDays) => ({
//       ...prevDays,
//       [day]: {
//         ...prevDays[day],
//         isSelected: !prevDays[day].isSelected,
//       },
//     }));
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

//   const handleDescriptionChange = (e) => {
//     setDescription(e.target.value);
//     e.target.style.height = 'auto';
//     e.target.style.height = `${e.target.scrollHeight}px`;
//   };

//   const timeOptions = [];
//   for (let hour = 0; hour < 24; hour++) {
//     for (let minute = 0; minute < 60; minute += 30) {
//       const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
//       timeOptions.push(formattedTime);
//     }
//   }

//   return (
//     <div className="popup-registration">
//       <h1>팝업 등록</h1>
//       <form onSubmit={handleSubmit}>
//         <label>
//           제목:
//           <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
//         </label>

//         <label>
//           업체명:
//           <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
//         </label>

//         <label>
//           운영기간:
//           <div className="date-picker-container">
//             <DatePicker
//               selected={operatingStartDate}
//               onChange={handleOperatingStartDateChange}
//               selectsStart
//               startDate={operatingStartDate}
//               endDate={operatingEndDate}
//               placeholderText="운영 시작일"
//               required
//               showMonthDropdown
//               showYearDropdown
//               dropdownMode="select"
//               withPortal
//               closeOnScroll={true}
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
//           <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
//         </label>

//         <label>
//           주소:
//           <input type="text" value={address} readOnly />
//           <button type="button" onClick={() => setShowPostcodeModal(true)}>주소 검색</button>
//         </label>

//         <label>
//           지하철역:
//           <input type="text" value={subway} onChange={(e) => setSubway(e.target.value)} required />
//         </label>

//         <label>
//           사진:
//           <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
//         </label>

//         <label>
//           카테고리:
//           <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
//         </label>

//         <label>
//           상세 설명:
//           <textarea
//             value={description}
//             onChange={handleDescriptionChange}
//             placeholder="상세 설명을 입력하세요"
//             required
//           />
//         </label>

//         <label>
//           운영요일 및 시간:
//           <div className="operating-days-container">
//             {Object.keys(operatingDays).map((day) => (
//               <div key={day} className="day-container">
//                 <input
//                   type="checkbox"
//                   id={`checkbox-${day}`}
//                   checked={operatingDays[day].isSelected}
//                   onChange={() => handleDayChange(day)}
//                 />
//                 <span>{day}</span>

//                 {operatingDays[day].isSelected && (
//                   <div className="time-picker-container">
//                     <select
//                       value={operatingDays[day].startTime}
//                       onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
//                       required
//                     >
//                       {timeOptions.map((time) => (
//                         <option key={`${day}-start-${time}`} value={time}>
//                           {time}
//                         </option>
//                       ))}
//                     </select>

//                     {' ~ '}

//                     <select
//                       value={operatingDays[day].endTime}
//                       onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
//                       required
//                     >
//                       {timeOptions.map((time) => (
//                         <option key={`${day}-end-${time}`} value={time}>
//                           {time}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </label>

//         <button type="submit">등록</button>
//       </form>

//       {/* Daum Postcode Modal */}
//       {showPostcodeModal && (
//         <div className="postcode-modal">
//           <button type="button" className="modal-close-button" onClick={() => setShowPostcodeModal(false)}>닫기</button>
//           <DaumPostcode onComplete={handlePostcodeComplete} />
//         </div>
//       )}

//       <div id="map" style={{ width: '100%', height: '400px' }}></div>
//     </div>
//   );
// };

// export default PopupRegistration;