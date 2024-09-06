import './DetailInfo_User.css';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DetailInfo_User = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('info');
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [isHearted, setIsHearted] = useState(false); // 찜 상태 추가
  const mapElement = useRef(null);

  const handleReservationClick = () => {
    if (locationInfo && locationInfo.id) {
      navigate(`/popup/user/popup_pre_reservation/${locationInfo.id}`);
    } else {
      console.error('Location ID is missing.');
    }
  };

  // 서버에서 데이터 가져오기
  useEffect(() => {
    if (!location) {
      setError('Location parameter is missing.');
      setLoading(false);
      return;
    }

    const fetchLocationInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('로그인이 필요합니다.');
        }

        // 서버에서 장소 정보 및 유저의 찜 상태 가져오기
        const response = await fetch(`http://localhost:8080/popup/detail/${location}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // 토큰을 함께 전송
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok...');
        }

        const data = await response.json();

        if (data && data.data) {
          const { id, companyName, companyEmail, title, address, detailInfo, telephone, description, popupImages, link, views, heartCount, categories, storeDays, mapx, mapy, startDate, endDate, reservation, isHearted } = data.data;

          // 서버에서 받은 찜 상태 설정
          setIsHearted(isHearted); // 서버에서 받은 찜 상태를 초기화

          const latlng = new window.naver.maps.LatLng(parseFloat(mapy) / 1e7, parseFloat(mapx) / 1e7);

          const parseDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
          };

          const images = popupImages && popupImages.length > 0
            ? popupImages.map(image => `http://localhost:8080/${image.imageUrl}`)
            : ['/images/mainImage.png'];

          setLocationInfo({
            id,
            companyName: companyName,
            companyEmail: companyEmail,
            title: title || 'No Title',
            address: address || 'No Address Available',
            detailInfo: detailInfo || '',
            telephone: telephone || 'Not available',
            description: description || 'No description available.',
            popupImages: images,
            link: link || '',
            views: views,
            heartCount: heartCount,
            categories: categories || [],
            storeDays: storeDays || [],
            latlng: latlng,
            startDate: parseDate(startDate),
            endDate: parseDate(endDate),
          });
          setReservationEnabled(reservation === true);
        } else {
          console.error("Received data does not have a 'data' property:", data);
          setLocationInfo(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchLocationInfo();
  }, [location]);

  // 하트 클릭 이벤트 처리
  const handleHeartClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 현재 찜 상태에 따라 POST 또는 DELETE 요청 전송
      const method = isHearted ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:8080/heart`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          popupStoreId: locationInfo.id, // 서버에 전송할 popupStoreId
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error response:', errorMessage);
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Heart result:', result);

      // 하트 상태 반전
      setIsHearted(!isHearted); // 찜 상태 반전
    } catch (error) {
      console.error('Error handling heart click:', error);
      alert('찜 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!locationInfo) {
    return <h1>잘못된 URL입니다.</h1>;
  }

  return (
    <div className="detail-info-container">
      <div className="banner">
        <div className="banner-images">
          {locationInfo.popupImages.map((image, index) => (
            <img key={index} src={image} alt={`Banner ${index + 1}`} className="banner-image" />
          ))}
        </div>
      </div>
      <div className="heart-section">
        {/* 하트 상태가 isHearted 값에 따라 결정됨 */}
        <button className="heart-button" onClick={handleHeartClick}>
          {isHearted ? '♥' : '♡'}
        </button>
      </div>
      <nav className="menu">
        <button className={`menu-button ${activeMenu === 'info' ? 'active' : ''}`} onClick={() => setActiveMenu('info')}>상세정보</button>
        <button className={`menu-button ${activeMenu === 'map' ? 'active' : ''}`} onClick={() => setActiveMenu('map')}>지도</button>
        <button className={`menu-button ${activeMenu === 'review' ? 'active' : ''}`} onClick={() => setActiveMenu('review')}>후기</button>
      </nav>
      {activeMenu === 'info' && locationInfo && (
        <div className='detail-info'>
          <div className="info-content">
            <h2>{locationInfo.title}</h2>
            <p>기간: {locationInfo.startDate} ~ {locationInfo.endDate}</p>
            <p>장소: {locationInfo.address} {locationInfo.detailInfo}</p>
            <p>전화: {locationInfo.telephone}</p>
            <div className="categories">
              {locationInfo.categories && locationInfo.categories.length > 0 ? (
                locationInfo.categories.map((category, index) => (
                  <div key={index} className="category-box2">{category.category}</div>
                ))
              ) : (
                <p>No categories available.</p>
              )}
            </div>
            <p>{locationInfo.description}</p>
            <div className="store-days">
              <h3>운영 시간</h3>
              {locationInfo.storeDays.map((day, index) => (
                <div key={index}>
                  <p>{day.day}: {day.openTime} ~ {day.closeTime}</p>
                </div>
              ))}
            </div>
            <p>{locationInfo.link}</p>
            <hr />
            <p>조회수: {locationInfo.views}</p>
            <p>♡{locationInfo.heartCount}</p>
          </div>
          <div className='warning-content'>
            <p>안내사항 문구가 입력됩니다</p>
            <hr />
            <p>운영기관: {locationInfo.companyName}</p>
            <p>운영문의: {locationInfo.companyEmail}</p>
          </div>

          {reservationEnabled && (
            <button className='reservation-button' onClick={handleReservationClick}>사전예약하기</button>
          )}
        </div>
      )}

      {activeMenu === 'map' && (
        <div ref={mapElement} className="map-content" />
      )}

      {activeMenu === 'review' && (
        <div className="review-content">
          <h2>후기</h2>
          <p>이 장소에 대한 후기를 작성해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default DetailInfo_User;





// // 24.09.06 찜 구현 전
// import './DetailInfo_User.css';
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const DetailInfo_User = () => {
//   const { location } = useParams();
//   const navigate = useNavigate();
//   const [activeMenu, setActiveMenu] = useState('info');
//   const [locationInfo, setLocationInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reservationEnabled, setReservationEnabled] = useState(false);
//   const mapElement = useRef(null);

//   const daysOfWeekOrder = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

//   useEffect(() => {
//     if (!location) {
//       setError('Location parameter is missing.');
//       setLoading(false);
//       return;
//     }

//     const fetchLocationInfo = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/popup/detail/${location}`, {
//           method: "GET",
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         if (!response.ok) {
//           throw new Error('Network response was not ok...');
//         }
//         const data = await response.json();

//         console.log(data);

//         if (data && data.data) {
//           const { id, companyName, companyEmail, title, address, detailInfo, telephone, description, popupImages, link, views, heartCount, categories, storeDays, mapx, mapy, startDate, endDate, reservation } = data.data;

//           const latlng = new window.naver.maps.LatLng(parseFloat(mapy) / 1e7, parseFloat(mapx) / 1e7);

//           const parseDate = (dateString) => {
//             if (!dateString) return 'N/A';
//             const date = new Date(dateString);
//             return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
//           };

//           const images = popupImages && popupImages.length > 0
//             ? popupImages.map(image => `http://localhost:8080/${image.imageUrl}`)
//             : ['/images/mainImage.png'];

//           setLocationInfo({
//             id,
//             companyName: companyName,
//             companyEmail: companyEmail,
//             title: title || 'No Title',
//             address: address || 'No Address Available',
//             detailInfo: detailInfo || '',
//             telephone: telephone || 'Not available',
//             description: description || 'No description available.',
//             popupImages: images,
//             link: link || '',
//             views: views,
//             heartCount: heartCount,
//             categories: categories || [],
//             storeDays: storeDays || [],
//             latlng: latlng,
//             startDate: parseDate(startDate),
//             endDate: parseDate(endDate),
//           });
//           setReservationEnabled(reservation === true);
//         } else {
//           console.error("Received data does not have a 'data' property:", data);
//           setLocationInfo(null);
//         }

//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError(error.message || 'Failed to fetch data');
//         setLoading(false);
//       }
//     };

//     fetchLocationInfo();
//   }, [location]);

//   useEffect(() => {
//     if (activeMenu === 'map' && mapElement.current && window.naver && locationInfo && locationInfo.latlng) {
//       const map = new window.naver.maps.Map(mapElement.current, {
//         center: locationInfo.latlng,
//         zoom: 17,
//       });

//       const marker = new window.naver.maps.Marker({
//         map: map,
//         position: locationInfo.latlng,
//       });

//       const contentString = `
//         <div class="iw_inner">
//           <h3>${locationInfo.title}</h3>
//           <p>${locationInfo.address}<br/>
//              전화: ${locationInfo.telephone}</p>
//         </div>
//       `;

//       const infowindow = new window.naver.maps.InfoWindow({
//         content: contentString,
//       });

//       window.naver.maps.Event.addListener(marker, "click", function () {
//         if (infowindow.getMap()) {
//           infowindow.close();
//         } else {
//           infowindow.open(map, marker);
//         }
//       });

//       infowindow.open(map, marker);

//       return () => {
//         if (mapElement.current) {
//           mapElement.current.innerHTML = '';
//         }
//         infowindow.close();
//         marker.setMap(null);
//       };
//     }
//   }, [activeMenu, locationInfo]);

//   const handleReservationClick = () => {
//     if (locationInfo && locationInfo.id) {
//       navigate(`/popup/user/popup_pre_reservation/${locationInfo.id}`);
//     } else {
//       console.error('Location ID is missing.');
//     }
//   };

//   const sortedStoreDays = locationInfo?.storeDays.sort((a, b) => {
//     const dayA = daysOfWeekOrder.indexOf(a.day);
//     const dayB = daysOfWeekOrder.indexOf(b.day);
//     return dayA - dayB;
//   });

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   if (!locationInfo) {
//     return <h1>잘못된 URL입니다.</h1>;
//   }

//   return (
//     <div className="detail-info-container">
//       <div className="banner">
//         <div className="banner-images">
//           {locationInfo.popupImages.map((image, index) => (
//             <img key={index} src={image} alt={`Banner ${index + 1}`} className="banner-image" />
//           ))}
//         </div>
//       </div>
//       <nav className="menu">
//         <button className={`menu-button ${activeMenu === 'info' ? 'active' : ''}`} onClick={() => setActiveMenu('info')}>상세정보</button>
//         <button className={`menu-button ${activeMenu === 'map' ? 'active' : ''}`} onClick={() => setActiveMenu('map')}>지도</button>
//         <button className={`menu-button ${activeMenu === 'review' ? 'active' : ''}`} onClick={() => setActiveMenu('review')}>후기</button>
//       </nav>
//       {activeMenu === 'info' && locationInfo && (
//         <div className='detail-info'>
//           <div className="info-content">
//             <h2>{locationInfo.title}</h2>
//             <p>기간: {locationInfo.startDate} ~ {locationInfo.endDate}</p>
//             <p>장소: {locationInfo.address} {locationInfo.detailInfo}</p>
//             <p>전화: {locationInfo.telephone}</p>
//             <div className="categories">
//               {locationInfo.categories && locationInfo.categories.length > 0 ? (
//                 locationInfo.categories.map((category, index) => (
//                   <div key={index} className="category-box2">{category.category}</div>
//                 ))
//               ) : (
//                 <p>No categories available.</p>
//               )}
//             </div>
//             <p>{locationInfo.description}</p>
//             <div className="store-days">
//               <h3>운영 시간</h3>
//               {sortedStoreDays && sortedStoreDays.length > 0 ? (
//                 sortedStoreDays.map((day, index) => (
//                   <div key={index}>
//                     <p>{day.day}: {day.openTime} ~ {day.closeTime}</p>
//                   </div>
//                 ))
//               ) : (
//                 <p>No store hours available.</p>
//               )}
//             </div>
//             <p>{locationInfo.link}</p>
//             <hr />
//             <p>조회수: {locationInfo.views}</p>
//             <p>♡{locationInfo.heartCount}</p>
//           </div>
//           <div className='warning-content'>
//             <p>안내사항 문구가 입력됩니다</p>
//             <hr />
//             <p>운영기관: {locationInfo.companyName}</p>
//             <p>운영문의: {locationInfo.companyEmail}</p>
//           </div>

//           {reservationEnabled && (
//             <button className='reservation-button' onClick={handleReservationClick}>사전예약하기</button>
//           )}
//         </div>
//       )}

//       {activeMenu === 'map' && (
//         <div ref={mapElement} className="map-content" />
//       )}

//       {activeMenu === 'review' && (
//         <div className="review-content">
//           <h2>후기</h2>
//           <p>이 장소에 대한 후기를 작성해주세요.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DetailInfo_User;



