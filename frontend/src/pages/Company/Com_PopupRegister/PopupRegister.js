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
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
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
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setIsLoggedIn(true);
      setToken(storedToken);

      // 닉네임 받아서 주최사에 저장
      fetch("http://localhost:8080/user/nickname", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${storedToken}`
        }
      })
      .then(res => res.text())
      .then(res => {
        if (res) {
          setCompanyName(res.companyName);
        }
      })
      .catch(error => {
        console.error('닉네임 가져오기 중 오류 발생:', error);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    // 페이지 로딩 시 로컬 스토리지에서 토큰을 가져와 로그인 상태 확인
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    // 로그아웃 시 토큰 제거
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handlePostcodeComplete = (data) => {
    const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
    setPostcode(data.zonecode); // Set postcode
    setAddress(data.jibunAddress); // Set jibun address
    setRoadAddress(data.roadAddress); // Set road address
    fetchCoordinates(data.roadAddress); // 주소를 좌표로 변환
    setShowPostcodeModal(false);
  };

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

      // Ensure we are receiving an array and each item has a categories array
      if (Array.isArray(data)) {
        const allCategories = data.flatMap(item => item.categories || []);
        console.log('Flattened categories:', allCategories);
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
      detailAddress,
      postcode,
      startDate: operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '',
      endDate: operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '',
      telephone: phoneNumber,
      subway,
      description,
      link: 'http://example.com', // 링크 값 추가
      mapx: coordinates.mapx, // 소수점 제거된 문자열
      mapy: coordinates.mapy, // 소수점 제거된 문자열
      categories: category.map(cat => ({ category: cat.category })), // id 속성을 제거
      storeDays
    };

    console.log('Data to be sent:', JSON.stringify(data, null, 2));

    fetch('http://localhost:8080/popup/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert('등록되었습니다!');
      navigate('/');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    });
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
            readOnly 
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
              <label>{day + "\u00A0\u00A0\u00A0"}</label>
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
                </>
              )}
            </div>
          ))}
        </div>

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

export default PopupRegistration;











// //24.07.30 등록 전체 수정
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupRegister.css';

// const PopupRegistration = () => {
//   const [title, setTitle] = useState('');
//   const [company, setCompany] = useState(''); // State for company name
//   const [operatingStartDate, setOperatingStartDate] = useState(null);
//   const [operatingEndDate, setOperatingEndDate] = useState(null);
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [postcode, setPostcode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [subway, setSubway] = useState('');
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
//   const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
//   const [showPostcodeModal, setShowPostcodeModal] = useState(false);
//   const [token, setToken] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [nickname, setNickname] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     const storedToken = localStorage.getItem('token');
//     if (storedToken) {
//       setIsLoggedIn(true);
//       setToken(storedToken);

//       // 닉네임 받아서 주최사에 저장
//       fetch("http://localhost:8080/user/nickname", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${storedToken}`
//         }
//       })
//       .then(res => res.text())
//       .then(res => {
//         if (res) {
//           setNickname(res);
//         }
//       })
//       .catch(error => {
//         console.error('닉네임 가져오기 중 오류 발생:', error);
//       });
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, []);

//   useEffect(() => {
//     // 페이지 로딩 시 로컬 스토리지에서 토큰을 가져와 로그인 상태 확인
//     const token = localStorage.getItem("token");
//     if (token) {
//       setIsLoggedIn(true);
//     }
//   }, []);

//   const handleLogout = () => {
//     // 로그아웃 시 토큰 제거
//     localStorage.removeItem("token");
//     setIsLoggedIn(false);
//   };

//   const handlePostcodeComplete = (data) => {
//     const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
//     setPostcode(data.zonecode); // Set postcode
//     setAddress(data.jibunAddress); // Set jibun address
//     setRoadAddress(data.roadAddress); // Set road address
//     fetchCoordinates(data.roadAddress); // 주소를 좌표로 변환
//     setShowPostcodeModal(false);
//   };

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

//       // Ensure we are receiving an array and each item has a categories array
//       if (Array.isArray(data)) {
//         const allCategories = data.flatMap(item => item.categories || []);
//         console.log('Flattened categories:', allCategories);
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

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const storeDays = Object.keys(operatingDays)
//       .filter(day => operatingDays[day].isSelected)
//       .map(day => ({
//         day,
//         openTime: operatingDays[day].startTime,
//         closeTime: operatingDays[day].endTime
//       }));

//     const data = {
//       title,
//       address,
//       roadAddress,
//       detailAddress,
//       postcode,
//       startDate: operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '',
//       endDate: operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '',
//       telephone: phoneNumber,
//       subway,
//       description,
//       link: 'http://example.com', // 링크 값 추가
//       mapx: coordinates.mapx, // 소수점 제거된 문자열
//       mapy: coordinates.mapy, // 소수점 제거된 문자열
//       categories: category.map(cat => ({ category: cat.category })), // id 속성을 제거
//       storeDays
//     };

//     console.log('Data to be sent:', JSON.stringify(data, null, 2));

//     fetch('http://localhost:8080/popup/register', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data)
//     })
//     .then(response => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return response.json();
//     })
//     .then(data => {
//       console.log('Success:', data);
//       alert('등록되었습니다!');
//       navigate('/');
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//       alert('등록에 실패했습니다. 다시 시도해주세요.');
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

//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value;
//     setTitle(newTitle);

//     if (e.inputType === 'insertText' && e.data === ' ') {
//       console.log('Triggering API Call for Title');
//       fetchCategorySuggestions(newTitle, description);
//     }
//   };

//   const handleDescriptionChange = (e) => {
//     const newDescription = e.target.value;
//     setDescription(newDescription);

//     if (e.inputType === 'insertText' && (e.data === '.' || e.data === '\n')) {
//       console.log('Triggering API Call for Description');
//       fetchCategorySuggestions(title, newDescription);
//     }

//     e.target.style.height = 'auto';
//     e.target.style.height = `${e.target.scrollHeight}px`;
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === '.' || e.key === 'Enter') {
//       e.preventDefault();
//       console.log('Title:', title);
//       console.log('Description:', description);

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
//           주최사:
//           <input
//             type="text"
//             value={company}
//             readOnly 
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
//             value={phoneNumber}
//             onChange={(e) => setPhoneNumber(e.target.value)}
//             required
//           />
//         </label>

//         <label style={{width: '70px', textAlign: 'left'}}>
//           우편번호:
//           <input
//             type="text"
//             value={postcode}
//             readOnly
//           />
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
//               <label>{day + "\u00A0\u00A0\u00A0"}</label>
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
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

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

// export default PopupRegistration;