import './DetailInfo_User.css';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const DetailInfo_User = () => {
  const { location } = useParams();
  const [activeMenu, setActiveMenu] = useState('info');
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapElement = useRef(null);

  // --------------------------백엔드 GET 통신--------------------------------------
  useEffect(() => {
    if (!location) {
      setError(new Error('Location parameter is missing.'));
      setLoading(false);
      return;
    }

    const fetchLocationInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8080/popup/user/detail/${location}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok...');
        }
        const data = await response.json();

        console.log(data); // 데이터 구조 확인용

        if (data && data.data) {
          const { companyName, title, address, detailInfo, telephone, description, popupImages, link, categories, storeDays, mapx, mapy, startDate, endDate } = data.data;

          // LatLng 객체 생성
          const latlng = new window.naver.maps.LatLng(parseFloat(mapy) / 1e7, parseFloat(mapx) / 1e7);

          // 날짜 형식 처리
          const parseDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
          };

          setLocationInfo({
            companyName: companyName,
            title: title || 'No Title',
            address: address || 'No Address Available',
            detailInfo: detailInfo || '',
            telephone: telephone || 'Not available',
            description: description || 'No description available.',
            popupImages: popupImages || '/images/image1.png',
            link: link || '',
            categories: categories || [],
            storeDays: storeDays || [],
            latlng: latlng,
            startDate: parseDate(startDate),
            endDate: parseDate(endDate),
          });
        } else {
          console.error("Received data does not have a 'data' property:", data);
          setLocationInfo(null); // Fallback to null if data is not present
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
  // --------------------------백엔드 GET 통신--------------------------------------

  useEffect(() => {
    if (activeMenu === 'map' && mapElement.current && window.naver && locationInfo && locationInfo.latlng) {
      const map = new window.naver.maps.Map(mapElement.current, {
        center: locationInfo.latlng,
        zoom: 17,
      });

      const marker = new window.naver.maps.Marker({
        map: map,
        position: locationInfo.latlng,
      });

      const contentString = `
        <div class="iw_inner">
          <h3>${locationInfo.title}</h3>
          <p>${locationInfo.address}<br/>
             전화: ${locationInfo.telephone}</p>
        </div>
      `;

      const infowindow = new window.naver.maps.InfoWindow({
        content: contentString,
      });

      window.naver.maps.Event.addListener(marker, "click", function () {
        if (infowindow.getMap()) {
          infowindow.close();
        } else {
          infowindow.open(map, marker);
        }
      });

      infowindow.open(map, marker);

      // Clean up function
      return () => {
        if (mapElement.current) {
          mapElement.current.innerHTML = ''; // Clear the map element
        }
        infowindow.close();
        marker.setMap(null);
      };
    }
  }, [activeMenu, locationInfo]);

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
        <img src={locationInfo.popupImages} alt="Banner" className="banner-image" />
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
              {locationInfo.storeDays && locationInfo.storeDays.length > 0 ? (
                locationInfo.storeDays.map((day, index) => (
                  <div key={index}>
                    <p>{day.day}: {day.openTime} ~ {day.closeTime}</p>
                  </div>
                ))
              ) : (
                <p>No store hours available.</p>
              )}
            </div>
            <p>{locationInfo.link}</p>
          </div>
          <div className='warning-content'>
            <p>안내사항 문구가 입력됩니다</p>
          </div>
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












// // 2024.07.11 상세정보 화면 백엔드 api 설정 완료
// import './DetailInfo.css';
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';

// const DetailInfo = () => {
//   const { location } = useParams();
//   const [activeMenu, setActiveMenu] = useState('info');
//   const [locationInfo, setLocationInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const mapElement = useRef(null);

//   // --------------------------백엔드 GET 통신--------------------------------------
//   useEffect(() => {
//     if (!location) {
//       setError(new Error('Location parameter is missing.'));
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

//         console.log(data); // 데이터 구조 확인용

//         if (data && data.data) {
//           const { title, address, detailInfo, telephone, description, image, link, categories, storeDays, mapx, mapy, startDate, endDate } = data.data;

//           // LatLng 객체 생성
//           const latlng = new window.naver.maps.LatLng(parseFloat(mapy) / 1e7, parseFloat(mapx) / 1e7);

//           // 날짜 형식 처리
//           const parseDate = (dateString) => {
//             if (!dateString) return 'N/A';
//             const date = new Date(dateString);
//             return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
//           };

//           setLocationInfo({
//             title: title || 'No Title',
//             address: address || 'No Address Available',
//             detailInfo: detailInfo || '',
//             telephone: telephone || 'Not available',
//             description: description || 'No description available.',
//             image: image || '/images/image1.png',
//             link: link || '',
//             categories: categories || [],
//             storeDays: storeDays || [],
//             latlng: latlng,
//             startDate: parseDate(startDate),
//             endDate: parseDate(endDate),
//           });
//         } else {
//           console.error("Received data does not have a 'data' property:", data);
//           setLocationInfo(null); // Fallback to null if data is not present
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
//   // --------------------------백엔드 GET 통신--------------------------------------

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

//       // Clean up function
//       return () => {
//         if (mapElement.current) {
//           mapElement.current.innerHTML = ''; // Clear the map element
//         }
//         infowindow.close();
//         marker.setMap(null);
//       };
//     }
//   }, [activeMenu, locationInfo]);

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
//         <img src={locationInfo.image} alt="Banner" className="banner-image" />
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
//               {locationInfo.storeDays && locationInfo.storeDays.length > 0 ? (
//                 locationInfo.storeDays.map((day, index) => (
//                   <div key={index}>
//                     <p>{day.day}: {day.openTime} ~ {day.closeTime}</p>
//                   </div>
//                 ))
//               ) : (
//                 <p>No store hours available.</p>
//               )}
//             </div>
//             <p>{locationInfo.link}</p>
//           </div>
//           <div className='warning-content'>
//             <p>안내사항 문구가 입력됩니다</p>
//           </div>
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

// export default DetailInfo;