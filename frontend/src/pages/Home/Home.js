// 2024.07.11 백엔드 api 통신 가능 - 카테고리있으면 가져오기 가능

import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Slider from "react-slick";
import './Home.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // --------------------------백엔드 GET 통신 240713--------------------------------------
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/search/popup/all', { // 백엔드 api 주소
          method: "GET", // GET 방식을 사용
          headers: {
            'Content-Type': 'application/json', //서버가 JSON 형식의 데이터를 처리하는 것을 기대함
          },
        });
        if (!response.ok) { //서버 응답 여부 확인: 서버에 오류가 있으면 오류 원인을 띄워줌
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json(); // 서버에서 받은 응답을 JSON형식으로 변환

        // 서버에서 categories 배열이 있는지 확인하고 있다면 배열을 가져와서 상태에 설정
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }

        console.log(data); // 데이터를 콘솔에 로그하여 확인
        setLocations(data); //서버에서 받은 데이터로 업데이트
        setLoading(false);
      } catch (error) { //에러 발생시 원인 띄움
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  // --------------------------백엔드 GET 통신--------------------------------------



  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };

  return (
    <div>
      <div className='recommended-popup-wrapper'>
        <h2>추천 팝업</h2>
        <Slider {...settings}>
          {locations.map(location => ( // 37번째 줄에서 위치를 백엔드 data로 업데이트 시킨다는 것을 명시
            //ex) location.aaa -> aaa는 백엔드 key value
            <div key={location.id} className='popup-item'> {/* 백엔드 id값을 활용*/}
              <Link to={`/popup.details/${location.id}`} className='popup-link'> {/* 백엔드 id값으로 각 상세정보 링크 실행 이동*/}
                <img src={location.image || "/images/image1.png"} alt={location.title} className='popup-image'/> {/* 백엔드 image을 활용, 사진이 없으면 리액트 내장된 사진 이용*/}
                <div className='popup-details'>
                  <h3>{location.title}</h3> {/* 백엔드 title 가져옴*/}
                  <p>{location.description}</p> {/* 백엔드 description 가져옴*/}
                  <div className="category-box">
                    {/* 각각의 카테고리를 별도의 상자에 나타내기 */}
                    {location.categories && location.categories.map((category, index) => (  //백엔드 categories 가져옴
                      <div key={index} className="category-item">{category.name}</div>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
      <h1>카테고리 검색</h1>
    </div>
  );
};

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "black" }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "black" }}
      onClick={onClick}
    />
  );
}

export default Home;



// -----------------------------------------------------------------------
// // GET 방식 사용 전 링크 예제
// import React from 'react';
// import { Link } from "react-router-dom";
// import Slider from "react-slick";
// import './Home.css';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const Home = () => {
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     nextArrow: <SampleNextArrow />,
//     prevArrow: <SamplePrevArrow />
//   };

//   return (
//     <div>
//       <h1>메인 홈 화면</h1>

//       <div className='recommended-popup-wrapper'>
//         <h2>추천 팝업</h2>
//         <Slider {...settings}>
//           <div className='popup-item'>
//             <Link to="/popup.details/shinchan" className='popup-link'>
//               <img src="/images/image1.png" alt="짱구 팝업 이미지" className='popup-image'/>
//               <div className='popup-details'>
//                 <h2>짱구는 여행중!</h2>
//                 <p>기간: 2024-07-01 ~ 2024-07-10</p>
//                 <p>장소: 서울 잠실 롯데월드몰</p>
//                 <div className="category-box">캐릭터</div>
//               </div>
//             </Link>
//           </div>
//           <div className='popup-item'>
//             <Link to="/popup.details/shinchan" className='popup-link'>
//               <img src="/images/image1.png" alt="짱구 팝업 이미지" className='popup-image'/>
//               <div className='popup-details'>
//                 <h2>짱구는 여행중!</h2>
//                 <p>기간: 2024-07-01 ~ 2024-07-10</p>
//                 <p>장소: 서울 잠실 롯데월드몰</p>
//                 <div className="category-box">캐릭터</div>
//               </div>
//             </Link>
//           </div>
//           <div className='popup-item'>
//             <Link to="/popup.details/shinchan" className='popup-link'>
//               <img src="/images/image1.png" alt="짱구 팝업 이미지" className='popup-image'/>
//               <div className='popup-details'>
//                 <h2>짱구는 여행중!</h2>
//                 <p>기간: 2024-07-01 ~ 2024-07-10</p>
//                 <p>장소: 서울 잠실 롯데월드몰</p>
//                 <div className="category-box">캐릭터</div>
//               </div>
//             </Link>
//           </div>
//           <div className='popup-item'>
//             <Link to="/popup.details/cityhall" className='popup-link'>
//               <img src="/images/image2.png" alt="서울시청 팝업 이미지" className='popup-image'/>
//               <div className='popup-details'>
//                 <h2>서울시청</h2>
//                 <p>기간: 2024-07-11 ~ 2024-07-20</p>
//                 <div className="category-box">문화</div>
//               </div>
//             </Link>
//           </div>
//           <div className='popup-item'>
//             <Link to="localhost:8080/search/popup/all" className='popup-link'>
//               <img src="/images/image3.png" alt="팝업 조회 이미지" className='popup-image'/>
//               <div className='popup-details'>
//                 <h2>팝업 조회</h2>
//                 <p>기간: 2024-07-21 ~ 2024-07-30</p>
//                 <div className="category-box">이벤트</div>
//               </div>
//             </Link>
//           </div>
//           {/* Add more popup items here */}
//         </Slider>
//       </div>
//     </div>
//   );
// };

// function SampleNextArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ ...style, display: "block", background: "black" }}
//       onClick={onClick}
//     />
//   );
// }

// function SamplePrevArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ ...style, display: "block", background: "black" }}
//       onClick={onClick}
//     />
//   );
// }

// export default Home;