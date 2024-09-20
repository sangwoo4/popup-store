import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import './PopupUpdate_Company.css';
import debounce from 'lodash.debounce';
import API_BASE_URL from '../../../URL_API';

const PopupUpdate_Company = () => {
  const location = useLocation(); 
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [operatingStartDate, setOperatingStartDate] = useState('');
  const [operatingEndDate, setOperatingEndDate] = useState('');
  const [telephone, setTelephone] = useState('');
  const [postCode, setPostCode] = useState('');
  const [address, setAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [subway, setSubway] = useState('');
  const [category, setCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [popupImages, setPopupImages] = useState([]);  // 기존 이미지 상태
  const [link, setLink] = useState('');
  const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
  const [companyEmail, setCompanyEmail] = useState(''); //추가
  const [reservation, sortedReservations] = useState(true); //추가
  const [views, setViews] = useState(''); //추가
  const [heartCount, setHeartCount] = useState(''); //추가
  const [currentReservation, setCurrentReservation] = useState(''); //추가
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
  const [isReservationEnabled, setIsReservationEnabled] = useState(false);
  const [popupReservations, setPopupReservations] = useState([]);
  const [companyId, setCompanyId] = useState(''); // 회사 ID (필요한 값으로 초기화)
  const [totalReservation, setTotalReservation] = useState(0); // 총 예약 수 (필요한 값으로 초기화)
  const [distance, setDistance] = useState('');

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);  // 이미지 프리뷰 상태
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/popup/company/detail/${id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log(data);

          if (data.result && data.data) {
            const popupData = data.data;
  
            setTitle(popupData.title || '');
            setCompanyName(popupData.companyName || '');
            setCompanyEmail(popupData.companyEmail || '');
            setCompanyId(popupData.companyId || '');
            setHeartCount(popupData.heartCount || '');
            setDistance(popupData.distance || '');
            setLink(popupData.link || '');
            setPostCode(popupData.postCode || '');
            setViews(popupData.views || '');
            setOperatingStartDate(new Date(popupData.startDate).toISOString().split('T')[0]);
            setOperatingEndDate(new Date(popupData.endDate).toISOString().split('T')[0]);
            setTelephone(popupData.telephone || '');
            setPostCode(popupData.postCode || '');
            setAddress(popupData.address || '');
            setRoadAddress(popupData.roadAddress || '');
            setDetailAddress(popupData.detailAddress || '');
            setSubway(popupData.subway || '');
            setCategories(popupData.categories.map(cat => cat.category));
            setDescription(popupData.description || '');
            setPopupImages(popupData.popupImages || []);
            setLink(popupData.link || '');
            setCoordinates({ mapx: popupData.mapx, mapy: popupData.mapy });
            setOperatingDays(popupData.storeDays.reduce((acc, day) => {
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
            setPopupReservations(popupData.popupReservations || []);
            setIsReservationEnabled(popupData.popupReservations.length > 0);
            fetchCategorySuggestions(popupData.title || '', popupData.description || '');
  

            const images = popupData.popupImages
              ? popupData.popupImages.map(image => `${image.imageUrl}`)
              : ['/images/image1.png'];
            setPreviewImages(images);
          
            console.log('Generated Image URL:', images); 
          }
        } catch (error) {
          console.error('Error fetching popup data:', error);
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    };
  
    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

      // 콘솔에 선택된 파일 정보 출력
      files.forEach(file => {
        console.log('선택된 파일:', file);
        console.log('파일 이름:', file.name);
        console.log('파일 크기:', file.size);
    });
      
    setImageFiles(prev => [...prev, ...files]);
  
    //새로 업로드한 이미지
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    // JSON 데이터 구성
    const jsonData = {
      id, //추가
      companyId,
      companyName,
      companyEmail, //추가
      title,
      postCode, //postcode -> postCode 수정
      address,
      roadAddress,
      detailAddress,
      distance,
      startDate: operatingStartDate || '',
      endDate: operatingEndDate || '',
      telephone,
      subway,
      description,
      link,
      mapx: coordinates.mapx,
      mapy: coordinates.mapy,
      reservation, //추가
      totalReservation, //추가
      currentReservation, //추가
      views, //추가
      heartCount, //추가
      categories: category.map(cat => ({ category: cat.category })),
      storeDays: Object.keys(operatingDays)
        .filter(day => operatingDays[day].isSelected)
        .map(day => ({
          openTime: operatingDays[day].startTime,
          closeTime: operatingDays[day].endTime,
          day
        })),
      popupReservations: popupReservations.map(res => ({
        id: res.id,
        day: res.day,
        startTime: res.startTime,
        totalReservation: res.totalReservation,
        currentReservation: res.currentReservation,
        isReservationEnabled: res.isReservationEnabled, //추가
        isReservationFull: res.isReservationFull,
        date: res.date
      })),
      images: popupImages.map(image => image.imageUrl)
    };
  
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
  
    // // 기존 이미지를 FormData에 추가
    // popupImages.forEach(image => {
    //   formData.append('images[]', image.imageUrl); // URL 대신 서버에서 처리할 수 있는 경로를 추가
    // });


    // 기존 이미지 추가
  //   popupImages.forEach(image => {
  //     formData.append('images', new Blob([image.imageUrl], { type: 'image/jpeg' }), image.imageUrl);
  // });
  // 기존 이미지 (서버에서 받은 이미지 URL)
  // popupImages.forEach(image => {
  //   formData.append('images', image.imageUrl); // URL 그대로 전달
  // });


    // 새로 업로드할 이미지를 추가
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    console.log('Fetched images:', formData.getAll('images')); // For debugging

  
    try {
      const response = await fetch(`${API_BASE_URL}/popup/company/update/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
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
      console.log(jsonData);
    }
  };
  
  const handleAddressSearch = (e) => {
    e.preventDefault();
    setShowPostcodeModal(true);
  };

  const handleDayChange = (day) => {
    setOperatingDays(prevDays => {
      const updatedDays = {
        ...prevDays,
        [day]: {
          ...prevDays[day],
          isSelected: !prevDays[day].isSelected,
        },
      };

      const anyDaySelected = Object.values(updatedDays).some(day => day.isSelected);
      setIsReservationEnabled(anyDaySelected); 

      return updatedDays;
    });
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
    setPostCode(data.zonecode);
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
      const response = await fetch(`${API_BASE_URL}/popup/ai/category`, {
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

    if (e.inputType === 'insertText' && e.data === ' ') {
      console.log('API Call for Title');
      debouncedFetchCategorySuggestions(newTitle, description);
    }
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    if (e.inputType === 'insertText' && (e.data === '.' || e.data === '!' || e.data === '~' || e.data === '?' || e.data === ',')) {
      console.log('API Call for Description');
      debouncedFetchCategorySuggestions(title, newDescription);
    }
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
        <div>
          <label>운영기간</label>
          <div>
            <input
              type="text"
              value={`${operatingStartDate} ~ ${operatingEndDate}`}
              readOnly
            />
          </div>
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
              value={postCode}
              onChange={(e) => setPostCode(e.target.value)}
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
              {category.length > 0 ? (
                category.map((cat, index) => (
                  <div key={index} className="category-box2">
                    {cat.category}
                  </div>
                ))
              ) : (
                <p>No categories available</p>
              )}
            </div>
          </label>

        <label>
          이미지 업로드:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        <div className="image-preview">
          {previewImages.length > 0 ? (
            previewImages.map((src, index) => (
              <img key={index} src={src} alt={`미리보기 ${index + 1}`} />
            ))
          ) : (
            <img src="/images/image1.png" alt="Default Banner" />
          )}
        </div>

        <label>
          링크 삽입(sns, url)
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </label>

        <div className="operating-days">
          <div>
            <label>영업 요일 및 시간</label>
            <div>
              {Object.keys(operatingDays).map((day) =>
                operatingDays[day].isSelected ? (
                  <div key={day}>
                    <label>{day}</label>
                    <input
                      type="text"
                      value={`${operatingDays[day].startTime} - ${operatingDays[day].endTime}`}
                      readOnly
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>

        <br/>
        <p>
          기간 및 예약 수정은 대시보드 내 "기간 및 예약 수정"을 참고하세요.
        </p>

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







// // put 수정 모든 기능 완료 (이미지 변환 제외)
// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import DaumPostcode from 'react-daum-postcode';
// import './PopupUpdate_Company.css';
// import debounce from 'lodash.debounce';

// const PopupUpdate_Company = () => {
//   const location = useLocation(); 
//   const { id } = useParams();
//   const [title, setTitle] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [operatingStartDate, setOperatingStartDate] = useState('');
//   const [operatingEndDate, setOperatingEndDate] = useState('');
//   const [telephone, setTelephone] = useState('');
//   const [postCode, setPostCode] = useState('');
//   const [address, setAddress] = useState('');
//   const [roadAddress, setRoadAddress] = useState('');
//   const [detailAddress, setDetailAddress] = useState('');
//   const [subway, setSubway] = useState('');
//   const [category, setCategory] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [description, setDescription] = useState('');
//   const [imageFiles, setImageFiles] = useState([]);
//   const [popupImages, setPopupImages] = useState([]);  // 기존 이미지 상태
//   const [link, setLink] = useState('');
//   const [coordinates, setCoordinates] = useState({ mapx: '', mapy: '' });
//   const [companyEmail, setCompanyEmail] = useState(''); //추가
//   const [reservation, sortedReservations] = useState(true); //추가
//   const [views, setViews] = useState(''); //추가
//   const [heartCount, setHeartCount] = useState(''); //추가
//   const [currentReservation, setCurrentReservation] = useState(''); //추가
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
//   const [isReservationEnabled, setIsReservationEnabled] = useState(false);
//   const [popupReservations, setPopupReservations] = useState([]);
//   const [companyId, setCompanyId] = useState(''); // 회사 ID (필요한 값으로 초기화)
//   const [totalReservation, setTotalReservation] = useState(0); // 총 예약 수 (필요한 값으로 초기화)
//   const [distance, setDistance] = useState('');

//   const [images, setImages] = useState([]);
//   const [previewImages, setPreviewImages] = useState([]);  // 이미지 프리뷰 상태
//   const navigate = useNavigate();
  
  
//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           const response = await fetch(`http://localhost:8080/popup/company/detail/${id}`, {
//             method: 'GET',
//             headers: {
//               'Authorization': `Bearer ${token}`
//             }
//           });
//           const data = await response.json();
//           console.log(data);

//           if (data.result && data.data) {
//             const popupData = data.data;
  
//             setTitle(popupData.title || '');
//             setCompanyName(popupData.companyName || '');
//             setCompanyEmail(popupData.companyEmail || '');
//             setCompanyId(popupData.companyId || '');
//             setHeartCount(popupData.heartCount || '');
//             setDistance(popupData.distance || '');
//             setLink(popupData.link || '');
//             setPostCode(popupData.postCode || '');
//             setViews(popupData.views || '');
//             setOperatingStartDate(new Date(popupData.startDate).toISOString().split('T')[0]);
//             setOperatingEndDate(new Date(popupData.endDate).toISOString().split('T')[0]);
//             setTelephone(popupData.telephone || '');
//             setPostCode(popupData.postCode || '');
//             setAddress(popupData.address || '');
//             setRoadAddress(popupData.roadAddress || '');
//             setDetailAddress(popupData.detailAddress || '');
//             setSubway(popupData.subway || '');
//             setCategories(popupData.categories.map(cat => cat.category));
//             setDescription(popupData.description || '');
//             setPopupImages(popupData.popupImages || []);
//             setLink(popupData.link || '');
//             setCoordinates({ mapx: popupData.mapx, mapy: popupData.mapy });
//             setOperatingDays(popupData.storeDays.reduce((acc, day) => {
//               acc[day.day] = {
//                 startTime: day.openTime,
//                 endTime: day.closeTime,
//                 isSelected: true
//               };
//               return acc;
//             }, {
//               월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//               화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//               수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//               목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//               금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//               토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//               일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//             }));
//             setPopupReservations(popupData.popupReservations || []);
//             setIsReservationEnabled(popupData.popupReservations.length > 0);
//             fetchCategorySuggestions(popupData.title || '', popupData.description || '');
  

//             const images = popupData.popupImages
//               ? popupData.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`)
//               : ['/images/image1.png'];
//             setPreviewImages(images); // Set the image URLs for preview
          
//             console.log('Generated Image URL:', images); 
//           }
//         } catch (error) {
//           console.error('Error fetching popup data:', error);
//           setError(error);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
  
//     fetchData();
//   }, [id]);

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setImageFiles(prev => [...prev, ...files]);
  
//     // File preview URLs
//     const newPreviewImages = files.map(file => URL.createObjectURL(file));
//     setPreviewImages(prev => [...prev, ...newPreviewImages]); // 새로 업로드된 이미지도 추가
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }
  
//     // JSON 데이터 구성
//     const jsonData = {
//       id, //추가
//       companyId,
//       companyName,
//       companyEmail, //추가
//       title,
//       postCode, //postcode -> postCode 수정
//       address,
//       roadAddress,
//       detailAddress,
//       distance,
//       startDate: operatingStartDate || '',
//       endDate: operatingEndDate || '',
//       telephone,
//       subway,
//       description,
//       link,
//       mapx: coordinates.mapx,
//       mapy: coordinates.mapy,
//       reservation, //추가
//       totalReservation, //추가
//       currentReservation, //추가
//       views, //추가
//       heartCount, //추가
//       categories: category.map(cat => ({ category: cat.category })),
//       storeDays: Object.keys(operatingDays)
//         .filter(day => operatingDays[day].isSelected)
//         .map(day => ({
//           openTime: operatingDays[day].startTime,
//           closeTime: operatingDays[day].endTime,
//           day
//         })),
//       popupReservations: popupReservations.map(res => ({
//         id: res.id,
//         day: res.day,
//         startTime: res.startTime,
//         totalReservation: res.totalReservation,
//         currentReservation: res.currentReservation,
//         isReservationEnabled: res.isReservationEnabled, //추가
//         isReservationFull: res.isReservationFull,
//         date: res.date
//       })),
//     };
  
//     // FormData 객체 생성
//     const formData = new FormData();
//     formData.append('dto', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
  
//     // Add existing images
//     popupImages.forEach(image => {
//       formData.append('images', image);
//     });

//     // 새로 업로드할 이미지를 추가
//     imageFiles.forEach((file) => {
//       formData.append('images', file);
//     });

//     console.log('Fetched images:', formData.getAll('images')); // For debugging

  
//     try {
//       const response = await fetch(`http://localhost:8080/popup/company/update/${id}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error('Error response:', errorData);
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
//       console.log(jsonData);
//     }
//   };
  
//   const handleAddressSearch = (e) => {
//     e.preventDefault();
//     setShowPostcodeModal(true);
//   };

//   const handleDayChange = (day) => {
//     setOperatingDays(prevDays => {
//       const updatedDays = {
//         ...prevDays,
//         [day]: {
//           ...prevDays[day],
//           isSelected: !prevDays[day].isSelected,
//         },
//       };

//       const anyDaySelected = Object.values(updatedDays).some(day => day.isSelected);
//       setIsReservationEnabled(anyDaySelected); 

//       return updatedDays;
//     });
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
//     setPostCode(data.zonecode);
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

//   const fetchCategorySuggestions = async (title, description) => {
//     try {
//       // console.log('Fetching category suggestions for:', title, description);
//       // const response = await fetch('http://spring-app:8080/popup/ai/category', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({ title, description }),
//       // });
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

//   const debouncedFetchCategorySuggestions = debounce(fetchCategorySuggestions, 300);

//   const handleTitleChange = (e) => {
//     const newTitle = e.target.value;
//     setTitle(newTitle);

//     if (e.inputType === 'insertText' && e.data === ' ') {
//       console.log('API Call for Title');
//       debouncedFetchCategorySuggestions(newTitle, description);
//     }
//   };

//   const handleDescriptionChange = (e) => {
//     const newDescription = e.target.value;
//     setDescription(newDescription);

//     if (e.inputType === 'insertText' && (e.data === '.' || e.data === '!' || e.data === '~' || e.data === '?' || e.data === ',')) {
//       console.log('API Call for Description');
//       debouncedFetchCategorySuggestions(title, newDescription);
//     }
//   };

//   // const handleImageChange = (e) => {
//   //   const files = Array.from(e.target.files);
//   //   setImageFiles(files);
  
//   //   // File preview URLs
//   //   const previewImages = files.map(file => URL.createObjectURL(file));
//   //   setPreviewImages(previewImages); // Update the state here
//   // };
  

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
//         {/* 운영기간 (Read-Only) */}
//         <div>
//           <label>운영기간</label>
//           <div>
//             <input
//               type="text"
//               value={`${operatingStartDate} ~ ${operatingEndDate}`}
//               readOnly
//             />
//           </div>
//         </div>
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
//               value={postCode}
//               onChange={(e) => setPostCode(e.target.value)}
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
//             카테고리:
//             <div className="categories">
//               {category.length > 0 ? (
//                 category.map((cat, index) => (
//                   <div key={index} className="category-box2">
//                     {cat.category}
//                   </div>
//                 ))
//               ) : (
//                 <p>No categories available</p>
//               )}
//             </div>
//           </label>

//         <label>
//           이미지 업로드:
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//           />
//         </label>

//         <div className="image-preview">
//           {previewImages.length > 0 ? (
//             previewImages.map((src, index) => (
//               <img key={index} src={src} alt={`미리보기 ${index + 1}`} />
//             ))
//           ) : (
//             <img src="/images/image1.png" alt="Default Banner" />
//           )}
//         </div>

//         <label>
//           링크 삽입(sns, url)
//           <input
//             type="url"
//             value={link}
//             onChange={(e) => setLink(e.target.value)}
//           />
//         </label>

//         <div className="operating-days">
//           <div>
//             <label>영업 요일 및 시간</label>
//             <div>
//               {Object.keys(operatingDays).map((day) =>
//                 operatingDays[day].isSelected ? (
//                   <div key={day}>
//                     <label>{day}</label>
//                     <input
//                       type="text"
//                       value={`${operatingDays[day].startTime} - ${operatingDays[day].endTime}`}
//                       readOnly
//                     />
//                   </div>
//                 ) : null
//               )}
//             </div>
//           </div>
//         </div>

//         <br/>
//         <p>
//           기간 및 예약 수정은 대시보드 내 "기간 및 예약 수정"을 참고하세요.
//         </p>

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