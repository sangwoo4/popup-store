// 2024.07.14 상세정보 css 수정 중
import './DetailInfo.css';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const DetailInfo = () => {
  const { location } = useParams();

  const [activeMenu, setActiveMenu] = useState('info');
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapElement = useRef(null);

  // --------------------------백엔드 GET 통신--------------------------------------
  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8080/popup/register/${location}`); // 백엔드 api 주소, 각 팝업에 대한 상세정보이므로 location으로 api 설정
        if (!response.ok) { // 서버 응답 확인
          throw new Error('Network response was not ok...');
        }
        const data = await response.json(); // 서버에서 받은 응답을 JSON형식으로 변환
        setLocationInfo({ //백엔드 key value와 맞춤 오른쪽 . 이후 값!!!
          name: data.title,
          latlng: new window.naver.maps.LatLng(data.mapy / 1e7, data.mapx / 1e7),
          address: data.address,
          phone: data.telephone || 'Not available',
          description: data.description,
          categories: data.categories,
        });
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchLocationInfo();
  }, [location]);
  // --------------------------백엔드 GET 통신--------------------------------------


  useEffect(() => {
    if (activeMenu === 'map' && mapElement.current && window.naver && locationInfo) {
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
          <h3>${locationInfo.name}</h3>
          <p>${locationInfo.address}<br/>
             전화: ${locationInfo.phone}</p>
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
    }
  }, [activeMenu, locationInfo]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!locationInfo) {
    return <h1>잘못된 URL입니다.</h1>;
  }

  return (
    <div className="detail-info-container">
      <div className="banner">
        <img src="/images/image1.png" alt="Banner" className="banner-image" />
      </div>
      <nav className="menu">
        <button className={`menu-button ${activeMenu === 'info' ? 'active' : ''}`} onClick={() => setActiveMenu('info')}>상세정보</button>
        <button className={`menu-button ${activeMenu === 'map' ? 'active' : ''}`} onClick={() => setActiveMenu('map')}>지도</button>
        <button className={`menu-button ${activeMenu === 'review' ? 'active' : ''}`} onClick={() => setActiveMenu('review')}>후기</button>
      </nav>
      {activeMenu === 'info' && (
        <div className='datail-info'>
          <div className="info-content">
            <h2>{locationInfo.name}</h2>
            <p>기간: 24.06.05 ~ 24.06.16</p>
            <p>장소: {locationInfo.address}</p>
            <div className="categories">
              {locationInfo.categories && locationInfo.categories.map((category, index) => (
                <div key={index} className="category-box2">{category.name}</div>
              ))}
            </div>
            <p>{locationInfo.description}</p>
          </div>
          <div className='warning-content'>
            <p> 안내사항 문구가 입력됩니다 </p>
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

export default DetailInfo;



// // 2024.07.11 상세정보 화면 백엔드 api 설정 완료

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
//     const fetchLocationInfo = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/popup/register/${location}`); // 백엔드 api 주소, 각 팝업에 대한 상세정보이므로 location으로 api 설정
//         if (!response.ok) { // 서버 응답 확인
//           throw new Error('Network response was not ok...');
//         }
//         const data = await response.json(); // 서버에서 받은 응답을 JSON형식으로 변환
//         setLocationInfo({ //백엔드 key value와 맞춤 오른쪽 . 이후 값!!!
//           name: data.title,
//           latlng: new window.naver.maps.LatLng(data.mapy / 1e7, data.mapx / 1e7),
//           address: data.address,
//           phone: data.telephone || 'Not available',
//           description: data.description,
//           category: data.categories,
//         });
//         setLoading(false);
//       } catch (error) {
//         setError(error);
//         setLoading(false);
//       }
//     };

//     fetchLocationInfo();
//   }, [location]);
//   // --------------------------백엔드 GET 통신--------------------------------------


//   useEffect(() => {
//     if (activeMenu === 'map' && mapElement.current && window.naver && locationInfo) {
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
//           <h3>${locationInfo.name}</h3>
//           <p>${locationInfo.address}<br/>
//              전화: ${locationInfo.phone}</p>
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
//     }
//   }, [activeMenu, locationInfo]);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   if (!locationInfo) {
//     return <h1>잘못된 URL입니다.</h1>;
//   }

//   return (
//     <>
//       <h1>Naver Map - {locationInfo.name} 상세정보 페이지</h1>
//       <div>
//         <button className='info' onClick={() => setActiveMenu('info')}>상세정보</button>
//         <button className='map' onClick={() => setActiveMenu('map')}>지도</button>
//         <button className='review' onClick={() => setActiveMenu('review')}>후기</button>
//       </div>

//       {activeMenu === 'info' && (
//         <div>
//           <h2>{locationInfo.name}</h2>
//           <h4>주소: {locationInfo.address}<br />
//             전화: {locationInfo.phone}</h4>
//           <hr />
//           상세정보: {locationInfo.description}
//           카테고리: {locationInfo.categories}
//         </div>
//       )}

//       {activeMenu === 'map' && (
//         <div ref={mapElement} style={{ minHeight: '400px', width: '60%', border: '1px solid black' }} />
//       )}

//       {activeMenu === 'review' && (
//         <div>
//           <h2>후기</h2>
//           <p>이 장소에 대한 후기를 작성해주세요.</p>
//         </div>
//       )}
//     </>
//   );
// };

// export default DetailInfo;




// // 24-07-06 수정 전 (백엔드 get 받아오기 전)
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams } from 'react-router-dom';

// const DetailInfo = () => {
//   const { location } = useParams();
//   const [activeMenu, setActiveMenu] = useState('info');
//   const mapElement = useRef(null);
//   const { naver } = window;

//   const locations = {
//     shinchan: {
//       company: "짱구는 못말려",
//       title: "짱구는 여행중!",
//       period: "24.06.05 ~ 24.06.16",
//       latlng: new naver.maps.LatLng(37.5133, 127.1024),
//       address: "서울특별시 송파구 올림픽로 300",
//       phone: "1661-2000",
//       heart: "52",
//       naver_url: "null",
//       insta_url: "https://www.instagram.com/p/C7gWtafhQQW/",
//     },

//     // cityhall: {
//     //   name: "서울시청",
//     //   latlng: new naver.maps.LatLng(37.5663, 126.9779),
//     //   address: "서울특별시 중구 세종대로 110",
//     //   phone: "02-120",
//     // }
//   };
//   const locationInfo = locations[location];

//   useEffect(() => {
//     if (!mapElement.current || !naver || !locationInfo) return;

//     const map = new naver.maps.Map(mapElement.current, {
//       center: locationInfo.latlng,
//       zoom: 17,
//     });

//     const marker = new naver.maps.Marker({
//       map: map,
//       position: locationInfo.latlng,
//     });

//     const contentString = `
//       <div class="iw_inner">
//         <h3>${locationInfo.name}</h3>
//         <p>${locationInfo.address}<br/>
//            전화: ${locationInfo.phone}</p>
//       </div>
//     `; // 지도 마커에 뜨는 정보

//     const infowindow = new naver.maps.InfoWindow({
//       content: contentString,
//     });

//     naver.maps.Event.addListener(marker, "click", function (e) {
//       if (infowindow.getMap()) {
//         infowindow.close();
//       } else {
//         infowindow.open(map, marker);
//       }
//     });

//     infowindow.open(map, marker);
//   }, [naver, locationInfo]);

//   if (!locationInfo) {
//     return <h1>잘못된 URL입니다.</h1>;
//   }

//   return (
//     <>
//       <h1 className='detail-popup'>Naver Map - {locationInfo.title} 상세정보 페이지</h1>
//       <div>
//         <button className='info' onClick={() => setActiveMenu('info')}>상세정보</button>
//         <button className='map' onClick={() => setActiveMenu('map')}>지도</button>
//         <button className='review' onClick={() => setActiveMenu('review')}>후기</button>
//       </div>
//       {activeMenu === 'info' && (
//         <div>
//           <h2>{locationInfo.title}</h2>
//           <h4>주소: {locationInfo.address}<br />
//             전화: {locationInfo.phone}</h4>
//         </div>
//       )}
//       {activeMenu === 'map' && (
//         <div ref={mapElement} style={{ minHeight: '400px', width: '60%', border: '1px solid black' }} />
//       )}
//       {activeMenu === 'review' && (
//         <div>
//           <h2>후기</h2>
//           <p>이 장소에 대한 후기를 작성해주세요.</p>
//         </div>
//       )}
//     </>
//   );
// };

// export default DetailInfo;