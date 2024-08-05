// //2024.07.28 카테고리 api 호출 관련 코드
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DaumPostcode from 'react-daum-postcode';
import './PopupRegister.css';

const PopupRegistration = () => {
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
  const [imageUrl, setImageFiles] = useState([]);
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
      categories: category.map(cat => ({ category: cat.category })),
      storeDays: Object.keys(operatingDays)
        .filter(day => operatingDays[day].isSelected)
        .map(day => ({
          openTime: operatingDays[day].startTime,
          closeTime: operatingDays[day].endTime,
          day
        }))
    };
  
    // FormData 객체 생성
    const formData = new FormData();
    
    // JSON 데이터를 Blob으로 변환하고 FormData에 추가
    const json = JSON.stringify(jsonData);
    const blob = new Blob([json], { type: 'application/json' });
    formData.append('dto', blob);
  
   // 이미지 파일과 메타데이터 추가
    imageUrl.forEach((file, index) => {
    // 메타데이터를 JSON 형태로 Blob으로 변환
    const fileMetadata = {
      id: index + 1,  // 예시로 인덱스를 ID로 사용
      imageUrl: URL.createObjectURL(file),  // 실제 서버에서는 이 URL을 사용하지 않음
      popupStoreId: null
    };
    const metadataBlob = new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' });
    formData.append(`popupImagesMetadata[${index}]`, metadataBlob);
    
    // 실제 파일 추가
    formData.append('popupImages', file);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      return;
    }
    if (e.key === '.' || e.key === 'Enter') {
      if (!e.shiftKey) {
        e.preventDefault(); // 폼 제출을 방지
      }
      console.log('Title:', title);
      console.log('Description:', description);
  
      fetchCategorySuggestions(title, description);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files); // 콘솔에 로그 출력
    setImageFiles(files); // Use setImageFiles
  };

  const handleRemoveImage = (index) => {
    const newFiles = imageUrl.filter((_, i) => i !== index);
    console.log('Removed file index:', index); // 콘솔에 로그 출력
    setImageFiles(newFiles);
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

        <label>
          이미지 삽입
          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
          <div className="image-preview">
            {imageUrl.map((file, index) => (
              <div key={index} className="image-container">
                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                <button type="button" onClick={() => handleRemoveImage(index)}>제거</button>
              </div>
            ))}
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














// //24.08.02 등록하기 링크 및 이미지 삽입 전
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupRegister.css';

// const PopupRegistration = () => {
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
//   const [imageUrl, setImageFiles] = useState([]);
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
//       categories: category.map(cat => ({ category: cat.category })),
//       storeDays: Object.keys(operatingDays)
//         .filter(day => operatingDays[day].isSelected)
//         .map(day => ({
//           openTime: operatingDays[day].startTime,
//           closeTime: operatingDays[day].endTime,
//           day
//         }))
//     };
  
//     // FormData 객체 생성
//     const formData = new FormData();
    
//     // JSON 데이터를 Blob으로 변환하고 FormData에 추가
//     const json = JSON.stringify(jsonData);
//     const blob = new Blob([json], { type: 'application/json' });
//     formData.append('dto', blob);
  
//    // 이미지 파일과 메타데이터 추가
//     imageUrl.forEach((file, index) => {
//     // 메타데이터를 JSON 형태로 Blob으로 변환
//     const fileMetadata = {
//       id: index + 1,  // 예시로 인덱스를 ID로 사용
//       imageUrl: URL.createObjectURL(file),  // 실제 서버에서는 이 URL을 사용하지 않음
//       popupStoreId: null
//     };
//     const metadataBlob = new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' });
//     formData.append(`popupImagesMetadata[${index}]`, metadataBlob);
    
//     // 실제 파일 추가
//     formData.append('popupImages', file);
//   });
  
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
//     if (e.key === 'Enter' && !e.shiftKey) {
//       return;
//     }
//     if (e.key === '.' || e.key === 'Enter') {
//       if (!e.shiftKey) {
//         e.preventDefault(); // 폼 제출을 방지
//       }
//       console.log('Title:', title);
//       console.log('Description:', description);
  
//       fetchCategorySuggestions(title, description);
//     }
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     console.log('Selected files:', files); // 콘솔에 로그 출력
//     setImageFiles(files); // Use setImageFiles
//   };

//   const handleRemoveImage = (index) => {
//     const newFiles = imageUrl.filter((_, i) => i !== index);
//     console.log('Removed file index:', index); // 콘솔에 로그 출력
//     setImageFiles(newFiles);
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

//         <label>
//           이미지 삽입
//           <input type="file" accept="image/*" multiple onChange={handleImageChange} />
//           <div className="image-preview">
//             {imageUrl.map((file, index) => (
//               <div key={index} className="image-container">
//                 <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
//                 <button type="button" onClick={() => handleRemoveImage(index)}>제거</button>
//               </div>
//             ))}
//           </div>
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