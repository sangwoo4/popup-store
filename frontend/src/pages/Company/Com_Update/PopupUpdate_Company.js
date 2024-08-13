// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import './PopupUpdate_Company.css';

// const PopupUpdate_Company = () => {
//   const { id } = useParams(); // URL에서 팝업 ID를 가져옵니다
//   const [title, setTitle] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState('');
//   const [operatingEndDate, setOperatingEndDate] = useState('');
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [postcode, setPostcode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [subway, setSubway] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [description, setDescription] = useState('');
//   const [image, setImage] = useState('');
//   const [link, setLink] = useState('');
//   const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
//   const [operatingDays, setOperatingDays] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       fetch(`http://localhost:8080/popup/company/detail/${id}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })
//       .then(res => res.json())
//       .then(data => {
//         if (data.result && data.data) {
//           const popupData = data.data;
//           setTitle(popupData.title || '');
//           setCompanyName(popupData.companyName || '');
//           setOperatingStartDate(new Date(popupData.startDate).toISOString().split('T')[0]);
//           setOperatingEndDate(new Date(popupData.endDate).toISOString().split('T')[0]);
//           setPhoneNumber(popupData.telephone || '');
//           setPostcode(popupData.postcode || '');
//           setAddress(popupData.address || '');
//           setRoadAddress(popupData.roadAddress || '');
//           setDetailAddress(popupData.detailAddress || '');
//           setSubway(popupData.subway || '');
//           setCategories(popupData.categories.map(cat => cat.category));
//           setDescription(popupData.description || '');
//           setImage(popupData.image || '');
//           setLink(popupData.link || '');
//           setCoordinates({ mapx: popupData.mapx, mapy: popupData.mapy });

//           const days = {};
//           popupData.storeDays.forEach(day => {
//             days[day.day] = { startTime: day.openTime, endTime: day.closeTime, isSelected: true };
//           });
//           setOperatingDays(days);
//         }
//         setLoading(false);
//       })
//       .catch(error => {
//         console.error('Error fetching popup data:', error);
//         setError(error);
//         setLoading(false);
//       });
//     }
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem('token');
//     try {
//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           title,
//           companyName,
//           startDate: operatingStartDate,
//           endDate: operatingEndDate,
//           telephone: phoneNumber,
//           postcode,
//           address,
//           roadAddress,
//           detailAddress,
//           subway,
//           categories: categories.map(cat => ({ category: cat })),
//           description,
//           image,
//           link,
//           mapx: coordinates.mapx,
//           mapy: coordinates.mapy,
//           storeDays: Object.keys(operatingDays).map(day => ({
//             day,
//             openTime: operatingDays[day].startTime,
//             closeTime: operatingDays[day].endTime
//           }))
//         })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       if (result.result) {
//         alert('팝업스토어가 성공적으로 수정되었습니다.');
//         // 수정 후 다른 페이지로 이동하거나 상태를 업데이트할 수 있습니다.
//       } else {
//         alert('수정 실패: ' + result.message);
//       }
//     } catch (error) {
//       console.error('Error updating popup data:', error);
//       alert('수정 중 오류가 발생했습니다.');
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   return (
//     <div>
//       <h1>팝업스토어 수정하기</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="제목"
//         />
//         <input
//           type="text"
//           value={companyName}
//           onChange={(e) => setCompanyName(e.target.value)}
//           placeholder="회사명"
//         />
//         <input
//           type="date"
//           value={operatingStartDate}
//           onChange={(e) => setOperatingStartDate(e.target.value)}
//         />
//         <input
//           type="date"
//           value={operatingEndDate}
//           onChange={(e) => setOperatingEndDate(e.target.value)}
//         />
//         <input
//           type="text"
//           value={phoneNumber}
//           onChange={(e) => setPhoneNumber(e.target.value)}
//           placeholder="전화번호"
//         />
//         <input
//           type="text"
//           value={postcode}
//           onChange={(e) => setPostcode(e.target.value)}
//           placeholder="우편번호"
//         />
//         <input
//           type="text"
//           value={address}
//           onChange={(e) => setAddress(e.target.value)}
//           placeholder="주소"
//         />
//         <input
//           type="text"
//           value={roadAddress}
//           onChange={(e) => setRoadAddress(e.target.value)}
//           placeholder="도로명 주소"
//         />
//         <input
//           type="text"
//           value={detailAddress}
//           onChange={(e) => setDetailAddress(e.target.value)}
//           placeholder="상세 주소"
//         />
//         <input
//           type="text"
//           value={subway}
//           onChange={(e) => setSubway(e.target.value)}
//           placeholder="지하철역"
//         />
//         <textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="설명"
//         />
//         <input
//           type="text"
//           value={image}
//           onChange={(e) => setImage(e.target.value)}
//           placeholder="이미지 URL"
//         />
//         <input
//           type="text"
//           value={link}
//           onChange={(e) => setLink(e.target.value)}
//           placeholder="링크"
//         />
//         {/* 추가적인 필드 및 기능을 여기 추가하세요 */}
//         <button type="submit">수정하기</button>
//       </form>
//     </div>
//   );
// };

// export default PopupUpdate_Company;



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DaumPostcode from 'react-daum-postcode';
import './PopupUpdate_Company.css';
import debounce from 'lodash.debounce';

const PopupUpdate_Company = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [operatingStartDate, setOperatingStartDate] = useState('');
  const [operatingEndDate, setOperatingEndDate] = useState('');
  const [telephone, setTelephone] = useState('');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [subway, setSubway] = useState('');
  const [category, setCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [operatingDays, setOperatingDays] = useState({
    월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPostcodeModal, setShowPostcodeModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`http://localhost:8080/popup/company/detail/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.result && data.data) {
          const popupData = data.data;
          setTitle(popupData.title || '');
          setCompanyName(popupData.companyName || '');
          setOperatingStartDate(new Date(popupData.startDate).toISOString().split('T')[0]);
          setOperatingEndDate(new Date(popupData.endDate).toISOString().split('T')[0]);
          setTelephone(popupData.telephone || '');
          setPostcode(popupData.postcode || '');
          setAddress(popupData.address || '');
          setRoadAddress(popupData.roadAddress || '');
          setDetailAddress(popupData.detailAddress || '');
          setSubway(popupData.subway || '');
          setCategories(popupData.categories.map(cat => cat.category));
          setDescription(popupData.description || '');
          setImage(popupData.image || '');
          setLink(popupData.link || '');
          setCoordinates({ mapx: popupData.mapx, mapy: popupData.mapy });
          setOperatingDays((popupData.storeDays || []).reduce((acc, day) => {
            acc[day.day] = {
              startTime: day.openTime,
              endTime: day.closeTime,
              isSelected: true
            };
            return acc;
          }, {
            월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
            화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
            수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
            목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
            금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
            토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
            일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
          }));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching popup data:', error);
        setError(error);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const jsonData = {
      title,
      postcode,
      address,
      roadAddress,
      detailAddress,
      startDate: operatingStartDate || '',
      endDate: operatingEndDate || '',
      telephone,
      subway,
      description,
      link,
      mapx: coordinates.mapx,
      mapy: coordinates.mapy,
      categories: category.map(cat => ({ category: cat })),
      storeDays: Object.keys(operatingDays)
        .filter(day => operatingDays[day].isSelected)
        .map(day => ({
          openTime: operatingDays[day].startTime,
          closeTime: operatingDays[day].endTime,
          day
        })),
    };

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
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }

      const result = await response.json();
      if (result.result) {
        alert('수정되었습니다!');
        navigate('/auth/company/homepage');
      } else {
        alert('수정 실패: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const handleAddressSearch = (e) => {
    e.preventDefault();
    setShowPostcodeModal(true);
  };

  const handleDayChange = (day) => {
    setOperatingDays(prevDays => ({
      ...prevDays,
      [day]: {
        ...prevDays[day],
        isSelected: !prevDays[day].isSelected,
      },
    }));
  };

  const handleTimeChange = (day, timeType, time) => {
    setOperatingDays(prevDays => ({
      ...prevDays,
      [day]: {
        ...prevDays[day],
        [timeType]: time,
      },
    }));
  };

  const handlePostcodeComplete = (data) => {
    const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
    setPostcode(data.zonecode);
    setAddress(data.jibunAddress);
    setRoadAddress(data.roadAddress);
    fetchCoordinates(data.roadAddress);
    setShowPostcodeModal(false);
  };

  const fetchCoordinates = (address) => {
    if (window.naver && window.naver.maps && window.naver.maps.Service) {
      const geocoder = window.naver.maps.Service;

      geocoder.geocode({ address: address }, (status, response) => {
        if (status === window.naver.maps.Service.Status.OK) {
          if (response.result && response.result.items && response.result.items.length > 0) {
            const item = response.result.items[0];
            if (item.point) {
              const x = item.point.x;
              const y = item.point.y;
              const formattedX = x.toString().replace('.', '');
              const formattedY = y.toString().replace('.', '');
              setCoordinates({ mapx: formattedX, mapy: formattedY });
            } else {
              setCoordinates({ mapx: '', mapy: '' });
            }
          } else {
            setCoordinates({ mapx: '', mapy: '' });
          }
        } else {
          setCoordinates({ mapx: '', mapy: '' });
        }
      });
    } else {
      console.error('네이버 지도 API를 로드하지 못했습니다.');
    }
  };

  const fetchCategorySuggestions = async (title, description) => {
    try {
      const response = await fetch('http://localhost:8080/popup/ai/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        const allCategories = data.flatMap(item => item.categories || []);
        setCategory(allCategories);
      } else {
        setCategory([]);
      }
    } catch (error) {
      console.error('카테고리 제안 요청 중 오류 발생:', error);
      setCategory([]);
    }
  };

  const debouncedFetchCategorySuggestions = debounce(fetchCategorySuggestions, 300);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedFetchCategorySuggestions(newTitle, description);
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    debouncedFetchCategorySuggestions(title, newDescription);
  };

  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      timeOptions.push(formattedTime);
    }
  }

  return (
    <div className="popup-registration">
      <h1>팝업스토어 수정하기</h1>
      <form onSubmit={handleSubmit}>
        <label>
          제목:
          <input
            type="text"
            id="title-input"
            value={title}
            onChange={handleTitleChange}
            required
          />
        </label>

        <label>
          주최사:
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            readOnly
          />
        </label>

        <label>
          운영기간:
          <div className="date-picker-container">
          <DatePicker
            selected={operatingStartDate ? new Date(operatingStartDate) : null}
            onChange={(date) => setOperatingStartDate(date ? date.toISOString().split('T')[0] : '')}
            selectsStart
            startDate={operatingStartDate ? new Date(operatingStartDate) : null}
            endDate={operatingEndDate ? new Date(operatingEndDate) : null}
            placeholderText="운영 시작일"
            required
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            withPortal
            closeOnScroll={true}
          />
          <DatePicker
            selected={operatingEndDate ? new Date(operatingEndDate) : null}
            onChange={(date) => setOperatingEndDate(date ? date.toISOString().split('T')[0] : '')}
            selectsEnd
            startDate={operatingStartDate ? new Date(operatingStartDate) : null}
            endDate={operatingEndDate ? new Date(operatingEndDate) : null}
            minDate={operatingStartDate ? new Date(operatingStartDate) : null}
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
            onChange={(e) => setTelephone(e.target.value)}
            required
          />
        </label>

        <label>
          우편번호:
          <div className="postcode-container">
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
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
            onChange={(e) => setRoadAddress(e.target.value)}
            readOnly
            required
          />
        </label>

        <div className="road-address">
          <label>지번 주소:</label>
          <span>{address} </span>
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
            required
          />
        </label>

        <label>
          카테고리:
          <div className="categories">
            {category.map((cat, index) => (
              <div key={index} className="category-box2">
                {cat}
              </div>
            ))}
          </div>
        </label>

        <label>
          이미지 삽입
          <div className="form-group">
            <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles([...e.target.files])} />
            {image && <img src={image} alt="Company Image" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
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

        <button type="submit">수정하기</button>
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

export default PopupUpdate_Company;








// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupUpdate_Company.css';

// const PopupUpdate_Company = () => {
//   const { id } = useParams();
//   const [title, setTitle] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState(null);
//   const [operatingEndDate, setOperatingEndDate] = useState(null);
//   const [telephone, setTelephone] = useState('');
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
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsLoggedIn(true);

//       fetch(`http://localhost:8080/popup/company/${id}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//         .then(res => res.json())
//         .then(res => {
//           if (res) {
//             // Set fields with response data
//             setTitle(res.title || '');
//             setCompanyName(res.companyName || '');
//             setOperatingStartDate(res.startDate ? new Date(res.startDate) : null);
//             setOperatingEndDate(res.endDate ? new Date(res.endDate) : null);
//             setTelephone(res.telephone || '');
//             setPostcode(res.postcode || '');
//             setAddress(res.address || '');
//             setRoadAddress(res.roadAddress || '');
//             setDetailAddress(res.detailAddress || '');
//             setSubway(res.subway || '');
//             setCategory(res.categories || []);
//             setDescription(res.description || '');
//             setLink(res.link || '');
//             setCoordinates({ mapx: res.mapx || '', mapy: res.mapy || '' });
//             setOperatingDays((res.storeDays || []).reduce((acc, day) => {
//               acc[day.day] = {
//                 startTime: day.openTime || '00:00',
//                 endTime: day.closeTime || '23:59',
//                 isSelected: true
//               };
//               return acc;
//             }, {}));
//           }
//         })
//         .catch(error => {
//           console.error('업데이트 데이터 가져오기 중 오류 발생:', error);
//         });
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, [id]);

//   const handlePostcodeComplete = (data) => {
//     const fullAddress = `${data.address} ${data.bname ? ` (${data.bname})` : ''} ${data.buildingName ? ` ${data.buildingName}` : ''}`;
//     setPostcode(data.zonecode);
//     setAddress(data.jibunAddress);
//     setRoadAddress(data.roadAddress);
//     fetchCoordinates(data.roadAddress);
//     setShowPostcodeModal(false);
//   };

//   const fetchCoordinates = (address) => {
//     if (window.naver && window.naver.maps && window.naver.maps.Service) {
//       const geocoder = window.naver.maps.Service;

//       geocoder.geocode({ address: address }, (status, response) => {
//         if (status === window.naver.maps.Service.Status.OK) {
//           if (response.result && response.result.items && response.result.items.length > 0) {
//             const item = response.result.items[0];
//             if (item.point) {
//               const x = item.point.x;
//               const y = item.point.y;
//               const formattedX = x.toString().replace('.', '');
//               const formattedY = y.toString().replace('.', '');
//               setCoordinates({ mapx: formattedX, mapy: formattedY });
//             }
//           }
//         }
//       });
//     } else {
//       console.error('네이버 지도 API를 로드하지 못했습니다.');
//     }
//   };

//   const fetchCategorySuggestions = async (title, description) => {
//     try {
//       const response = await fetch('http://localhost:8080/popup/ai/category', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title, description }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       if (Array.isArray(data)) {
//         const allCategories = data.flatMap(item => item.categories || []);
//         setCategory(allCategories.map(cat => ({ category: cat })));
//       } else {
//         setCategory([]);
//       }
//     } catch (error) {
//       console.error('Error fetching category suggestions:', error);
//       setCategory([]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem('token');
//     try {
//       const formData = new FormData();

//       formData.append('title', title);
//       formData.append('companyName', companyName);
//       formData.append('startDate', operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '');
//       formData.append('endDate', operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '');
//       formData.append('telephone', telephone);
//       formData.append('postcode', postcode);
//       formData.append('address', address);
//       formData.append('roadAddress', roadAddress);
//       formData.append('detailAddress', detailAddress);
//       formData.append('subway', subway);
//       formData.append('description', description);
//       formData.append('link', link);
//       formData.append('mapx', coordinates.mapx);
//       formData.append('mapy', coordinates.mapy);

//       // Append storeDays as JSON
//       formData.append('storeDays', JSON.stringify(Object.keys(operatingDays).map(day => ({
//         day,
//         openTime: operatingDays[day].startTime,
//         closeTime: operatingDays[day].endTime
//       }))));
  
//       // Append categories as JSON
//       formData.append('categories', JSON.stringify(category.map(cat => cat.category)));
  
//       // Append image files
//       imageFiles.forEach(file => formData.append('images', file));

//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         },
//         body: formData
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       if (result.result) {
//         alert('팝업스토어가 성공적으로 수정되었습니다.');
//         navigate('/auth/company/homepage');
//       } else {
//         alert('수정 실패: ' + result.message);
//       }
//     } catch (error) {
//       console.error('Error updating popup data:', error);
//       alert('수정 중 오류가 발생했습니다.');
//     }
//   };

//   const handleAddressSearch = (e) => {
//     e.preventDefault();
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
//     setOperatingDays(prevDays => ({
//       ...prevDays,
//       [day]: {
//         ...prevDays[day],
//         isSelected: !prevDays[day].isSelected,
//       },
//     }));
//   };

//   const handleTimeChange = (day, timeType, time) => {
//     setOperatingDays(prevDays => ({
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

//     // Fetch category suggestions on space input
//     if (e.inputType === 'insertText' && e.data === ' ') {
//       fetchCategorySuggestions(newTitle, description);
//     }
//   };

//   const handleDescriptionChange = (e) => {
//     const newDescription = e.target.value;
//     setDescription(newDescription);

//     // Fetch category suggestions on punctuation input
//     if (e.inputType === 'insertText' && ['.', '!', '~', '?', ','].includes(e.data)) {
//       fetchCategorySuggestions(title, newDescription);
//     }
//   };

//   const handleFileChange = (e) => {
//     setImageFiles(Array.from(e.target.files));
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
//       <h1>팝업 수정</h1>
//       <form onSubmit={handleSubmit}>
//         <label>
//           제목:
//           <input
//             type="text"
//             id="title-input"
//             value={title}
//             onChange={handleTitleChange}
//             required
//           />
//         </label>

//         <label>
//           주최사:
//           <input
//             type="text"
//             value={companyName}
//             readOnly
//           />
//         </label>

//         <label>
//           운영기간:
//           <div className="date-picker-container">
//             <DatePicker
//               selected={operatingStartDate || null}
//               onChange={handleOperatingStartDateChange}
//               selectsStart
//               startDate={operatingStartDate || null}
//               endDate={operatingEndDate || null}
//               placeholderText="운영 시작일"
//               required
//               showMonthDropdown
//               showYearDropdown
//               dropdownMode="select"
//               withPortal
//               closeOnScroll={true}
//             />
//             <DatePicker
//               selected={operatingEndDate || null}
//               onChange={handleOperatingEndDateChange}
//               selectsEnd
//               startDate={operatingStartDate || null}
//               endDate={operatingEndDate || null}
//               minDate={operatingStartDate || null}
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
//             onChange={(e) => setTelephone(e.target.value)}
//             required
//           />
//         </label>

//         <label>
//           우편번호:
//           <div className="postcode-container">
//             <input
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
//             required
//           />
//         </label>

//         <label>
//           이미지 삽입
//           <div className="form-group">
//             <input type="file" multiple accept="image/*" onChange={handleFileChange} />
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

//         <button type="submit">수정</button>
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

// export default PopupUpdate_Company;
