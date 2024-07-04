import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const DetailInfo = () => {
  const { location } = useParams();
  const [activeMenu, setActiveMenu] = useState('info');
  const mapElement = useRef(null);
  const { naver } = window;

  const locations = {
    hansung: {
      name: "한성대학교",
      latlng: new naver.maps.LatLng(37.5824, 127.0105),
      address: "서울특별시 성북구 삼선교로 16길 116",
      phone: "02-760-4114",
    },
    cityhall: {
      name: "서울시청",
      latlng: new naver.maps.LatLng(37.5663, 126.9779),
      address: "서울특별시 중구 세종대로 110",
      phone: "02-120",
    }
  };
  const locationInfo = locations[location];

  useEffect(() => {
    if (!mapElement.current || !naver || !locationInfo) return;

    const map = new naver.maps.Map(mapElement.current, {
      center: locationInfo.latlng,
      zoom: 17,
    });

    const marker = new naver.maps.Marker({
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

    const infowindow = new naver.maps.InfoWindow({
      content: contentString,
    });

    naver.maps.Event.addListener(marker, "click", function (e) {
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker);
      }
    });

    infowindow.open(map, marker);
  }, [naver, locationInfo]);

  if (!locationInfo) {
    return <h1>잘못된 URL입니다.</h1>;
  }

  return (
    <>
      <h1>Naver Map - {locationInfo.name} 상세정보 페이지</h1>
      <div>
        <button onClick={() => setActiveMenu('info')}>상세정보</button>
        <button onClick={() => setActiveMenu('map')}>지도</button>
        <button onClick={() => setActiveMenu('review')}>후기</button>
      </div>
      {activeMenu === 'info' && (
        <div>
          <h2>{locationInfo.name}</h2>
          <h4>주소: {locationInfo.address}<br />
            전화: {locationInfo.phone}</h4>
        </div>
      )}
      {activeMenu === 'map' && (
        <div ref={mapElement} style={{ minHeight: '400px', width: '60%', border: '1px solid black' }} />
      )}
      {activeMenu === 'review' && (
        <div>
          <h2>후기</h2>
          <p>이 장소에 대한 후기를 작성해주세요.</p>
        </div>
      )}
    </>
  );
};

export default DetailInfo;




// // 2024.07.04
// import React, { useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';

// const DetailInfo = () => {
//   const { location } = useParams();
//   const mapElement = useRef(null);
//   const { naver } = window;

//   const locations = {
//     hansung: {
//       name: "한성대학교",
//       latlng: new naver.maps.LatLng(37.5824, 127.0105),
//       address: "서울특별시 성북구 삼선교로 16길 116",
//       phone: "02-760-4114",
//     },
//     cityhall: {
//       name: "서울시청",
//       latlng: new naver.maps.LatLng(37.5663, 126.9779),
//       address: "서울특별시 중구 세종대로 110",
//       phone: "02-120",
//     }
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
//     `;

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
//       <h1>Naver Map - {locationInfo.name} 상세정보 페이지</h1>
//       <div ref={mapElement} style={{ minHeight: '400px', width: '60%', border: '1px solid black' }} />
//       <h2>{locationInfo.name}</h2>
//       <h4>주소: {locationInfo.address}<br />
//         전화: {locationInfo.phone}</h4>
//     </>
//   );
// };

// export default DetailInfo;
