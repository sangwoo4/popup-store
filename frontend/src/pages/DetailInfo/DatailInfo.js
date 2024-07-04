// 2024.07.04
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const DetailInfo = () => {
  const { location } = useParams();
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
      <div ref={mapElement} style={{ minHeight: '400px', width: '60%', border: '1px solid black' }} />
      <h2>{locationInfo.name}</h2>
      <h4>주소: {locationInfo.address}<br />
        전화: {locationInfo.phone}</h4>
    </>
  );
};

export default DetailInfo;




{/*
  import React, { useEffect, useRef } from 'react';

const DetailInfo = () => {
  const mapElement = useRef(null);
  const { naver } = window;

  useEffect(() => {
    if (!mapElement.current || !naver) return;

    // 지도에 표시할 위치의 위도와 경도 좌표를 파라미터로 넣어줍니다.
    const hansung = new naver.maps.LatLng(37.5824, 127.0105); //한성대학교 좌표
    const map = new naver.maps.Map(mapElement.current, {
      center: hansung,
      zoom: 17,
    });

    const marker = new naver.maps.Marker({
      map: map,
      position: hansung,
    });

    // 정보 창 만들기
    const contentString = `
      <div class="iw_inner">
        <h3>한성대학교</h3>
        <p>서울특별시 성북구 삼선교로 16길 116<br/>
           전화: 02-760-4114</p>
      </div>
    `;

    const infowindow = new naver.maps.InfoWindow({
      content: contentString,
    });
    
    // 마커 클릭 이벤트
    naver.maps.Event.addListener(marker, "click", function(e) {
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker);
        }
    });
    // 정보 창 띄우기
    infowindow.open(map, marker);
  }, [naver]);

  return (
    <>
      <h1>Naver Map - 상세정보 페이지</h1>
      <div ref={mapElement} style={{ minHeight: '400px', width: '60%', border: '1px solid black' }} />
      <h2>한성대학교</h2>
      <h4>주소: 서울특별시 성북구 삼선교로 16길 116<br/>
          전화: 02-760-4114</h4>
    </>
  );
};

export default DetailInfo;

  */}