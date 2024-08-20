import './DetailInfo_Company.css';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DetailInfo_Company = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('info');
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapElement = useRef(null);

  const daysOfWeekOrder = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error('User is not authenticated');
        }

        const response = await fetch(`http://localhost:8080/popup/company/detail/${location}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.data) {
          const { companyName, title, address, detailAddress, telephone, description, popupImages, link, categories, storeDays, mapx, mapy, startDate, endDate } = data.data;

          const latlng = new window.naver.maps.LatLng(parseFloat(mapy) / 1e7, parseFloat(mapx) / 1e7);

          const parseDate = (dateString) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
          };

          const images = popupImages.length > 0 ? popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) : ['/images/image1.png'];

          console.log('Converted Image URLs:', images); // 이미지 URL 변환 확인용

          setLocationInfo({
            companyName: companyName,
            title: title || 'No Title',
            address: address || 'No Address Available',
            detailAddress: detailAddress || '',
            telephone: telephone || 'Not available',
            description: description || 'No description available.',
            popupImages: images,
            link: link || '',
            categories: categories || [],
            storeDays: storeDays || [],
            latlng: latlng,
            startDate: parseDate(startDate),
            endDate: parseDate(endDate),
          });
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

      return () => {
        if (mapElement.current) {
          mapElement.current.innerHTML = '';
        }
        infowindow.close();
        marker.setMap(null);
      };
    }
  }, [activeMenu, locationInfo]);

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/popup/company/delete/${location}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        alert('삭제되었습니다.');
        navigate('/auth/company/homepage'); // 삭제 후 홈으로 이동
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const sortedStoreDays = locationInfo?.storeDays.sort((a, b) => {
    const dayA = daysOfWeekOrder.indexOf(a.day);
    const dayB = daysOfWeekOrder.indexOf(b.day);
    return dayA - dayB;
  });

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
        {locationInfo.popupImages.length > 0 ? (
          <div className="banner-images">
            {locationInfo.popupImages.map((image, index) => (
              <img 
                key={index} 
                src={image} 
                alt={`Banner ${index + 1}`} 
                className="banner-image" 
              />
            ))}
          </div>
        ) : (
          <img src="/images/image1.png" alt="Default Banner" className="banner-image" />
        )}
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
            <p>장소: {locationInfo.address} {locationInfo.detailAddress}</p>
            <p>전화: {locationInfo.telephone}</p>
            <div className="categories">
              {locationInfo.categories && locationInfo.categories.length > 0 ? (
                locationInfo.categories.map((category, index) => (
                  <div key={index} className="category-box2">{category.category}</div>
                ))
              ) : (
                <p>카테고리가 없습니다.</p>
              )}
            </div>
            <p>{locationInfo.description}</p>
            <div className="store-days">
              <h3>운영 시간</h3>
              {sortedStoreDays && sortedStoreDays.length > 0 ? (
                sortedStoreDays.map((day, index) => (
                  <div key={index}>
                    <p>{day.day}: {day.openTime} ~ {day.closeTime}</p>
                  </div>
                ))
              ) : (
                <p>운영 시간이 없습니다.</p>
              )}
            </div>
            <p>{locationInfo.link}</p>
          </div>
          <div className='warning-content'>
            <p>안내사항 문구가 입력됩니다</p>
          </div>
          <button className="delete-button" onClick={handleDelete}>삭제하기</button>
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

export default DetailInfo_Company;





// // 요일 순서대로 안뜨는 오류
// import './DetailInfo_Company.css';
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';

// const DetailInfo_Company = () => {
//   const { location } = useParams();
//   const navigate = useNavigate();
//   const [activeMenu, setActiveMenu] = useState('info');
//   const [locationInfo, setLocationInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const mapElement = useRef(null);

//   useEffect(() => {
//     const fetchLocationInfo = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           throw new Error('User is not authenticated');
//         }

//         const response = await fetch(`http://localhost:8080/popup/company/detail/${location}`, {
//           method: "GET",
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//         }

//         const data = await response.json();
//         if (data && data.data) {
//           const { companyName, title, address, detailAddress, telephone, description, popupImages, link, categories, storeDays, mapx, mapy, startDate, endDate } = data.data;

//           const latlng = new window.naver.maps.LatLng(parseFloat(mapy) / 1e7, parseFloat(mapx) / 1e7);

//           const parseDate = (dateString) => {
//             if (!dateString) return 'N/A';
//             const date = new Date(dateString);
//             return isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
//           };

//           const images = popupImages.length > 0 ? popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) : ['/images/image1.png'];

//           console.log('Converted Image URLs:', images); // 이미지 URL 변환 확인용

//           setLocationInfo({
//             companyName: companyName,
//             title: title || 'No Title',
//             address: address || 'No Address Available',
//             detailAddress: detailAddress || '',
//             telephone: telephone || 'Not available',
//             description: description || 'No description available.',
//             popupImages: images,
//             link: link || '',
//             categories: categories || [],
//             storeDays: storeDays || [],
//             latlng: latlng,
//             startDate: parseDate(startDate),
//             endDate: parseDate(endDate),
//           });
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

//   const handleDelete = async () => {
//     if (window.confirm('정말 삭제하시겠습니까?')) {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await fetch(`http://localhost:8080/popup/company/delete/${location}`, {
//           method: 'DELETE',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//         }

//         alert('삭제되었습니다.');
//         navigate('/auth/company/homepage'); // 삭제 후 홈으로 이동
//       } catch (error) {
//         console.error('Error deleting data:', error);
//         alert('삭제에 실패했습니다.');
//       }
//     }
//   };

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
//         {locationInfo.popupImages.length > 0 ? (
//           <div className="banner-images">
//             {locationInfo.popupImages.map((image, index) => (
//               <img 
//                 key={index} 
//                 src={image} 
//                 alt={`Banner ${index + 1}`} 
//                 className="banner-image" 
//               />
//             ))}
//           </div>
//         ) : (
//           <img src="/images/image1.png" alt="Default Banner" className="banner-image" />
//         )}
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
//             <p>장소: {locationInfo.address} {locationInfo.detailAddress}</p>
//             <p>전화: {locationInfo.telephone}</p>
//             <div className="categories">
//               {locationInfo.categories && locationInfo.categories.length > 0 ? (
//                 locationInfo.categories.map((category, index) => (
//                   <div key={index} className="category-box2">{category.category}</div>
//                 ))
//               ) : (
//                 <p>카테고리가 없습니다.</p>
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
//                 <p>운영 시간이 없습니다.</p>
//               )}
//             </div>
//             <p>{locationInfo.link}</p>
//           </div>
//           <div className='warning-content'>
//             <p>안내사항 문구가 입력됩니다</p>
//           </div>
//           <button className="delete-button" onClick={handleDelete}>삭제하기</button>
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

// export default DetailInfo_Company;
