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
      categories: category.map(cat => ({ category: cat.category })),
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
                {cat.category}
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





// // 24.08.18 이미지 들어오지 않는 코드, 카테고리를 정상 작동 수정 완료
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupUpdate_Company.css';
// import debounce from 'lodash.debounce';

// const PopupUpdate_Company = () => {
//   const { id } = useParams();
//   const [title, setTitle] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState('');
//   const [operatingEndDate, setOperatingEndDate] = useState('');
//   const [telephone, setTelephone] = useState('');
//   const [postcode, setPostcode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [subway, setSubway] = useState('');
//   const [category, setCategory] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [description, setDescription] = useState('');
//   const [imageFiles, setImageFiles] = useState([]);
//   const [image, setImage] = useState('');
//   const [link, setLink] = useState('');
//   const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
//   const [operatingDays, setOperatingDays] = useState({
//     월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showPostcodeModal, setShowPostcodeModal] = useState(false);
//   const navigate = useNavigate();

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
//           setTelephone(popupData.telephone || '');
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
//           setOperatingDays((popupData.storeDays || []).reduce((acc, day) => {
//             acc[day.day] = {
//               startTime: day.openTime,
//               endTime: day.closeTime,
//               isSelected: true
//             };
//             return acc;
//           }, {
//             월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//           }));
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
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }

//     const jsonData = {
//       title,
//       postcode,
//       address,
//       roadAddress,
//       detailAddress,
//       startDate: operatingStartDate || '',
//       endDate: operatingEndDate || '',
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
//         })),
//     };

//     const formData = new FormData();
//     formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

//     imageFiles.forEach((file) => {
//       formData.append('images', file);
//     });

//     try {
//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
//       }

//       const result = await response.json();
//       if (result.result) {
//         alert('수정되었습니다!');
//         navigate('/auth/company/homepage');
//       } else {
//         alert('수정 실패: ' + result.message);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('수정에 실패했습니다. 다시 시도해주세요.');
//     }
//   };

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   const handleAddressSearch = (e) => {
//     e.preventDefault();
//     setShowPostcodeModal(true);
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
//             } else {
//               setCoordinates({ mapx: '', mapy: '' });
//             }
//           } else {
//             setCoordinates({ mapx: '', mapy: '' });
//           }
//         } else {
//           setCoordinates({ mapx: '', mapy: '' });
//         }
//       });
//     } else {
//       console.error('네이버 지도 API를 로드하지 못했습니다.');
//     }
//   };

//  // title과 description 입력 시 ai 호출 요청
//  const fetchCategorySuggestions = async (title, description) => {
//   try {
//     console.log('Fetching category suggestions for:', title, description);
//     const response = await fetch('http://localhost:8080/popup/ai/category', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ title, description }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Received categories:', data);

//     if (Array.isArray(data)) {
//       const allCategories = data.flatMap(item => item.categories || []);
//       console.log('categories:', allCategories);
//       setCategory(allCategories);
//     } else {
//       console.error('Received categories data is not in the expected format:', data);
//       setCategory([]);
//     }
//   } catch (error) {
//     console.error('Error fetching category suggestions:', error);
//     setCategory([]);
//   }
// };

//   const debouncedFetchCategorySuggestions = debounce(fetchCategorySuggestions, 300);

//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value;
//     setTitle(newTitle);
//     debouncedFetchCategorySuggestions(newTitle, description);
//   };

//   const handleDescriptionChange = (e) => {
//     const newDescription = e.target.value;
//     setDescription(newDescription);
//     debouncedFetchCategorySuggestions(title, newDescription);
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
//       <h1>팝업스토어 수정하기</h1>
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
//             onChange={(e) => setCompanyName(e.target.value)}
//             readOnly
//           />
//         </label>

//         <label>
//           운영기간:
//           <div className="date-picker-container">
//           <DatePicker
//             selected={operatingStartDate ? new Date(operatingStartDate) : null}
//             onChange={(date) => setOperatingStartDate(date ? date.toISOString().split('T')[0] : '')}
//             selectsStart
//             startDate={operatingStartDate ? new Date(operatingStartDate) : null}
//             endDate={operatingEndDate ? new Date(operatingEndDate) : null}
//             placeholderText="운영 시작일"
//             required
//             showMonthDropdown
//             showYearDropdown
//             dropdownMode="select"
//             withPortal
//             closeOnScroll={true}
//           />
//           <DatePicker
//             selected={operatingEndDate ? new Date(operatingEndDate) : null}
//             onChange={(date) => setOperatingEndDate(date ? date.toISOString().split('T')[0] : '')}
//             selectsEnd
//             startDate={operatingStartDate ? new Date(operatingStartDate) : null}
//             endDate={operatingEndDate ? new Date(operatingEndDate) : null}
//             minDate={operatingStartDate ? new Date(operatingStartDate) : null}
//             placeholderText="운영 종료일"
//             required
//             showMonthDropdown
//             showYearDropdown
//             dropdownMode="select"
//             withPortal
//             closeOnScroll={true}
//           />
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
//               onChange={(e) => setPostcode(e.target.value)}
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
//             onChange={(e) => setRoadAddress(e.target.value)}
//             readOnly
//             required
//           />
//         </label>

//         <div className="road-address">
//           <label>지번 주소:</label>
//           <span>{address} </span>
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
//             <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles([...e.target.files])} />
//             {image && <img src={image} alt="Company Image" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
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

//         <button type="submit">수정하기</button>
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
