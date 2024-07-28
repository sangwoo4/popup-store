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

  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [showPostcodeModal, setShowPostcodeModal] = useState(false);
  const navigate = useNavigate();

  const handlePostcodeComplete = (data) => {
    const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
    setAddress(fullAddress);
    setRoadAddress(data.roadAddress);
    fetchCoordinates(data.roadAddress);
    setShowPostcodeModal(false);
  };

  const fetchCoordinates = (address) => {
    console.log('Fetching coordinates for address:', address);
    
    if (window.kakao && window.kakao.maps) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const { y, x } = result[0];
          console.log(`좌표 변환 성공: x = ${x}, y = ${y}`);
          setCoordinates({ mapx: x, mapy: y });
        } else {
          console.error('주소로부터 좌표를 가져오는데 실패했습니다.', status);
          setCoordinates({ mapx: '', mapy: '' });
        }
      });
    } else {
      console.error('카카오 지도 API를 로드하지 못했습니다.');
    }
  };
  
  

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
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].categories)) {
        setCategory(data[0].categories);
      } else {
        console.error('Received categories data is not in the expected format:', data);
        setCategory([]);
      }
    } catch (error) {
      console.error('Error fetching category suggestions:', error);
      setCategory([]);
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

    const data = {
      title,
      address,
      roadAddress,
      startDate: operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '',
      endDate: operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '',
      telephone: phoneNumber,
      subway,
      description,
      company,
      mapx: coordinates.mapx,
      mapy: coordinates.mapy,
      categories: category.map(cat => ({ id: cat.id, category: cat.category })),
      storeDays
    };

    // 데이터 전송 전 확인
    console.log('Data to be sent:', JSON.stringify(data, null, 2));

    fetch('http://localhost:8080/popup/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert('등록되었습니다!'); // 등록 성공 알림
      navigate('/'); // 홈 화면으로 이동
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('등록에 실패했습니다. 다시 시도해주세요.'); // 등록 실패 알림
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

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
  
    if (e.inputType === 'insertText' && e.data === ' ') {
      console.log('Triggering API Call for Title');
      fetchCategorySuggestions(newTitle, description);
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
  
    if (e.inputType === 'insertText' && (e.data === '.' || e.data === '\n')) {
      console.log('Triggering API Call for Description');
      fetchCategorySuggestions(title, newDescription);
    }
  
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === '.' || e.key === 'Enter') {
      e.preventDefault();
      console.log('Title:', title);
      console.log('Description:', description);

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
          주최사:
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









// //24.07.28 
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
//   const [category, setCategory] = useState([]);
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

//   // 카테고리 api 전달 함수------------------------------------------------
//   const fetchCategorySuggestions = async (title, description) => {
//     console.log('Fetching category suggestions with:', { title, description }); // API 호출 로그
//     try {
//       const response = await fetch('http://localhost:8080/popup/ai/category', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title, description }), // title과 description을 JSON형태로 전달
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API Response:', data); // API 응답 로그

//       if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0].categories)) {
//         setCategory(data[0].categories); // 카테고리 배열 설정
//       } else {
//         console.error('Received categories data is not in the expected format:', data);
//         setCategory([]); // 비어있는 배열로 초기화
//       }
//     } catch (error) {
//       console.error('Error fetching category suggestions:', error);
//       setCategory([]); // 에러 발생 시 빈 배열로 설정
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const storeDays = Object.keys(operatingDays)
//       .filter(day => operatingDays[day].isSelected)
//       .map(day => ({
//         day,
//         openTime: operatingDays[day].startTime,
//         closeTime: operatingDays[day].endTime
//       }));

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
//     formData.append('category', JSON.stringify(category));
//     formData.append('storeDays', JSON.stringify(storeDays));
//     if (image) {
//       formData.append('image', image);
//     }

//     fetch('http://localhost:8080/popup/register', {
//       method: 'POST',
//       body: formData
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Success:', data);
//         navigate('/');
//       })
//       .catch((error) => {
//         console.error('Error:', error);
//       });
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

//   // title 필드 값이 변경될 때마다 호출
//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value;
//     setTitle(newTitle);
  
//     // title 입력 시, 스페이스 바 입력 받으면 API 호출
//     if (e.inputType === 'insertText' && e.data === ' ') {
//       console.log('Triggering API Call for Title');
//       fetchCategorySuggestions(newTitle, description);
//     }
//   };

//   // description 필드 값이 변경될 때마다 호출
//   const handleDescriptionChange = (e) => {
//     const newDescription = e.target.value;
//     setDescription(newDescription);
  
//     // description 입력 시, .(온점) 또는 엔터키 입력 받으면 API 호출
//     if (e.inputType === 'insertText' && (e.data === '.' || e.data === '\n')) {
//       console.log('Triggering API Call for Description');
//       fetchCategorySuggestions(title, newDescription);
//     }
  
//     e.target.style.height = 'auto';
//     e.target.style.height = `${e.target.scrollHeight}px`;
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === '.' || e.key === 'Enter') {
//       e.preventDefault(); // Enter 키의 기본 동작 방지그
//       console.log('Title:', title); // 현재 제목 로그
//       console.log('Description:', description); // 현재 설명 로그

//       // API 호출
//       fetchCategorySuggestions(title, description);
//     }
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
//           회사명:
//           <input
//             type="text"
//             value={company}
//             onChange={(e) => setCompany(e.target.value)}
//             required
//           />
//         </label>

//         <label>
//           운영기간:
//           <div className="date-picker-container">
//             <DatePicker
//                selected={operatingStartDate}
//                onChange={handleOperatingStartDateChange}
//                selectsStart
//                startDate={operatingStartDate}
//                endDate={operatingEndDate}
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
//           <input
//             type="tel"
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             required
//           />
//         </label>

//         <label>
//           주소:
//           <input
//             type="text"
//             value={address}
//             readOnly
//             onClick={() => setShowPostcodeModal(true)}
//             required
//           />
//         </label>
//         <div className="road-address">
//           <label>도로명 주소:</label>
//           <span>{roadAddress}</span>
//         </div>

//         <label>
//           지하철역:
//           <input
//             type="text"
//             value={subway}
//             onChange={(e) => setSubway(e.target.value)}
//           />
//         </label>

//         <label>
//           이미지:
//           <input
//             type="file"
//             onChange={(e) => setImage(e.target.files[0])}
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
//           설명:
//           <textarea
//             id="description-textarea"
//             value={description}
//             onChange={handleDescriptionChange}
//             onKeyDown={handleKeyDown}
//             required
//           />
//         </label>

//         <div className="operating-days">
//           <h3>영업 요일:</h3>
//           {Object.keys(operatingDays).map((day) => (
//             <div key={day}>
//               <input
//                 type="checkbox"
//                 checked={operatingDays[day].isSelected}
//                 onChange={() => handleDayChange(day)}
//               />
//               <label>{day}</label>
//               {operatingDays[day].isSelected && (
//                 <>
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
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

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

// export default PopupRegistration;