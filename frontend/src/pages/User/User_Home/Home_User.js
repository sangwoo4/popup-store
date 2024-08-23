import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import './Home_User.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home_User = () => {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [distanceLocations, setDistanceLocations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setToken(token);

      fetch("http://localhost:8080/user/nickname", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then((res) => res.text())
      .then(res => {
        if (res) {
          setUserName(res);
          console.log('User nickname:', res);
        }
      })
      .catch(error => {
        console.error('닉네임 가져오기 중 오류 발생:', error);
      });

      fetch("http://localhost:8080/popup/ai/recommend/category", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then((res) => res.json())
      .then(res => {
        console.log('Received categories:', res);
        if (res.data) {
          setCategories(res.data);
        }
      })
      .catch(error => {
        console.error('카테고리 가져오기 중 오류 발생:', error);
      });

      fetch("http://localhost:8080/popup/ai/recommend/distance", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then((res) => res.json())
      .then(res => {
        console.log('Received distance popup store:', res);
        if (res.data) {
          setDistanceLocations(res.data); // 거리별 팝업스토어 데이터 저장
        }
      })
      .catch(error => {
        console.error('거리 가져오기 중 오류 발생:', error);
      });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/search/popup/all', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Received locations:', data);

        if (Array.isArray(data.data)) {
          setLocations(data.data);
        } else {
          console.error("Received data does not contain an array of locations:", data);
          setLocations([]);
        }
        setLoading(false);
      } catch (error) {
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />
  };

  // 카테고리별로 팝업스토어를 분류
  const categorizedByCategory = {};
  locations.forEach((location) => {
    if (location.categories && location.categories.length > 0) {
      location.categories.forEach((category) => {
        if (!categorizedByCategory[category.category]) {
          categorizedByCategory[category.category] = [];
        }
        categorizedByCategory[category.category].push(location);
      });
    } else {
      // 카테고리가 없을 경우 "기타"로 분류
      if (!categorizedByCategory["기타"]) {
        categorizedByCategory["기타"] = [];
      }
      categorizedByCategory["기타"].push(location);
    }
  });

  return (
    <div>
      {/* 상단 추천 팝업 리스트 */}
      <div className='recommended-popup-wrapper'>
        {isLoggedIn ? (
          <h2>{userName}님을 위한 신규 추천 팝업 리스트~!</h2>
        ) : (
          <h2>이달의 추천 팝업 리스트</h2>
        )}
          <Slider {...settings}>
            {locations.slice(0, 5).map(location => {
            const images = location.popupImages && location.popupImages.length > 0 
              ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
              : ['/images/image1.png'];

            return (
              <div key={location.id} className='popup-item'>
                <Link to={`/popup/user/detail/${location.id}`} className='popup-link'>
                  <div className="popup-image-box">
                    {images.map((image, index) => (
                      <img
                        key={index} 
                        src={image} 
                        alt={`Banner ${index + 1}`} 
                        className='popup-image'
                      />
                    ))}
                  </div>
                  <div className='popup-details'>
                    <h3>{location.title}</h3>
                    <p>{location.startDate ? `${location.startDate} ~ ${location.endDate}` : '상시 운영'}</p>
                    <div className="category-box1">
                      {location.categories && location.categories.map((category, index) => (
                        <div key={index} className="category-item">{category.category}</div>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </Slider>
      </div>
  
      <br/><br/><br/><br/><br/>
      {/* 하단 카테고리별 팝업 리스트 */}
      {isLoggedIn ? (
        <>
          <div className='category-search-wrapper'>
            <h1>"{userName}"님만을 위한 팝업리스트!!</h1>
            {/* 로그인 했을 때, 카테고리별로 분류된 팝업 리스트 */}
            {categories.map((category, index) => (
              <div key={index} className='category-section'>
                {/*<h2>{category.title}</h2>*/}
                <div className='lower-popup-wrapper'>
                  <Link to={`/popup/user/detail/${category.id}`} className='lower-popup-link'>
                    <div className="lower-popup-item">
                      <div className="lower-popup-image-box">
                        {category.popupImages && category.popupImages.length > 0 ? (
                          category.popupImages.map((image, imageIndex) => (
                            <img
                              key={imageIndex} 
                              src={`http://localhost:8080/${image.imageUrl}`} 
                              alt={`Banner ${imageIndex + 1}`} 
                              className='lower-popup-image'
                            />
                          ))
                        ) : (
                          <img src='/images/image1.png' alt='Default Banner' className='lower-popup-image' />
                        )}
                      </div>
                      <div className='lower-popup-details'>
                        <h3>{category.title}</h3>
                        <p>{category.startDate ? `${category.startDate} ~ ${category.endDate}` : '상시 운영'}</p>
                        <div className="lower-category-box">
                          {category.categories && category.categories.map((locCategory, index) => (
                            <div key={index} className="lower-category-item">{locCategory.category}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
  
          <div className='category-search-wrapper'>
            <h1>"{userName}"님 집근처에는 이런 팝업스토어가 있어요!</h1>
            {distanceLocations.map((distance, index) => ( // location 대신 distance 사용
              <div key={index} className='category-section'>
                <div className='lower-popup-wrapper'>
                  <Link to={`/popup/user/detail/${distance.id}`} className='lower-popup-link'>
                    <div className="lower-popup-item">
                      <div className="lower-popup-image-box">
                        {distance.popupImages && distance.popupImages.length > 0 ? (
                          distance.popupImages.map((image, imageIndex) => (
                            <img
                              key={imageIndex} 
                              src={`http://localhost:8080/${image.imageUrl}`} 
                              alt={`Banner ${imageIndex + 1}`} 
                              className='lower-popup-image'
                            />
                          ))
                        ) : (
                          <img src='/images/image1.png' alt='Default Banner' className='lower-popup-image' />
                        )}
                      </div>
                      <div className='lower-popup-details'>
                        <h3>{distance.title}</h3>
                        <p>{distance.startDate ? `${distance.startDate} ~ ${distance.endDate}` : '상시 운영'}</p>
                        <div className="lower-category-box">
                          {distance.categories && distance.categories.map((locCategory, index) => (
                            <div key={index} className="lower-category-item">{locCategory.category}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className='category-search-wrapper'>
            <h2>카테고리별 팝업스토어</h2>
            {Object.keys(categorizedByCategory).map((category, index) => (
              <div key={index} className='category-section'>
                <h2>{category}</h2>
                {categorizedByCategory[category].map((location, locationIndex) => (
                  <div key={locationIndex} className='lower-popup-wrapper'>
                    <Link to={`/popup/user/detail/${location.id}`} className='lower-popup-link'>
                      <div className="lower-popup-item">
                        <div className="lower-popup-image-box">
                          {location.popupImages && location.popupImages.length > 0 ? (
                            location.popupImages.map((image, imageIndex) => (
                              <img
                                key={imageIndex} 
                                src={`http://localhost:8080/${image.imageUrl}`} 
                                alt={`Banner ${imageIndex + 1}`} 
                                className='lower-popup-image'
                              />
                            ))
                          ) : (
                            <img src='/images/image1.png' alt='Default Banner' className='lower-popup-image' />
                          )}
                        </div>
                        <div className='lower-popup-details'>
                          <h3>{location.title}</h3>
                          <p>{location.startDate ? `${location.startDate} ~ ${location.endDate}` : '상시 운영'}</p>
                          <div className="lower-category-box">
                            {location.categories && location.categories.map((locCategory, index) => (
                              <div key={index} className="lower-category-item">{locCategory.category}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );  
};

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", right: '-5px' }}
      onClick={onClick}
    />
  );
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", left: '-20px' }}
      onClick={onClick}
    />
  );
}

export default Home_User;





// // 24.08.18 로그인 전 후 화면 분할 코드 (추천 카테고리 유무 및 카테고리별 띄우기)
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import Slider from 'react-slick';
// import './Home_User.css';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const Home_User = () => {
//   const [locations, setLocations] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [token, setToken] = useState('');
//   const [userName, setUserName] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsLoggedIn(true);
//       setToken(token);

//       fetch("http://localhost:8080/user/nickname", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then((res) => res.text())
//       .then(res => {
//         if (res) {
//           setUserName(res);
//           console.log('User nickname:', res);
//         }
//       })
//       .catch(error => {
//         console.error('닉네임 가져오기 중 오류 발생:', error);
//       });

//       fetch("http://localhost:8080/popup/ai/recommend/category", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then((res) => res.json())
//       .then(res => {
//         console.log('Received categories:', res);
//         if (res.data) {
//           setCategories(res.data);
//         }
//       })
//       .catch(error => {
//         console.error('카테고리 가져오기 중 오류 발생:', error);
//       });
//     } else {
//       setIsLoggedIn(false);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const response = await fetch('http://localhost:8080/search/popup/all', {
//           method: "GET",
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });
//         if (!response.ok) {
//           throw new Error(`Network response was not ok: ${response.statusText}`);
//         }
//         const data = await response.json();
//         console.log('Received locations:', data);

//         if (Array.isArray(data.data)) {
//           setLocations(data.data);
//         } else {
//           console.error("Received data does not contain an array of locations:", data);
//           setLocations([]);
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError(error);
//         setLoading(false);
//       }
//     };

//     fetchLocations();
//   }, []);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error.message}</p>;
//   }

//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 3,
//     slidesToScroll: 1,
//     nextArrow: <SampleNextArrow />,
//     prevArrow: <SamplePrevArrow />
//   };

//   // 카테고리별로 팝업스토어를 분류
//   const categorizedByCategory = {};
//   locations.forEach((location) => {
//     if (location.categories && location.categories.length > 0) {
//       location.categories.forEach((category) => {
//         if (!categorizedByCategory[category.category]) {
//           categorizedByCategory[category.category] = [];
//         }
//         categorizedByCategory[category.category].push(location);
//       });
//     } else {
//       // 카테고리가 없을 경우 "기타"로 분류
//       if (!categorizedByCategory["기타"]) {
//         categorizedByCategory["기타"] = [];
//       }
//       categorizedByCategory["기타"].push(location);
//     }
//   });

//   return (
//     <div>
//       {/* 상단 추천 팝업 리스트 */}
//       <div className='recommended-popup-wrapper'>
//         {isLoggedIn ? (
//           <>
//             <h2>{userName}님을 위한 신규 추천 팝업 리스트~!</h2>
//             <Slider {...settings}>
//               {categories.map((category, index) => (
//                 <div key={index} className='popup-item'>
//                   <Link to={`/popup/user/detail/${category.id}`} className='popup-link'>
//                     <div className="popup-image-box">
//                       {/* Handling empty images */}
//                       {category.popupImages && category.popupImages.length > 0 ? (
//                         category.popupImages.map((image, imageIndex) => (
//                           <img
//                             key={imageIndex} 
//                             src={`http://localhost:8080/${image.imageUrl}`} 
//                             alt={`Banner ${imageIndex + 1}`} 
//                             className='popup-image'
//                           />
//                         ))
//                       ) : (
//                         <img src='/images/image1.png' alt='Default Banner' className='popup-image' />
//                       )}
//                     </div>
//                     <div className='popup-details'>
//                       <h3>{category.title}</h3>
//                       <p>{category.startDate ? `${category.startDate} ~ ${category.endDate}` : '상시 운영'}</p>
//                       <div className="category-box1">
//                         {category.categories && category.categories.map((locCategory, index) => (
//                           <div key={index} className="category-item">{locCategory.category}</div>
//                         ))}
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               ))}
//             </Slider>
//           </>
//         ) : (
//           <>
//             <h2>이달의 추천 팝업 리스트</h2>
//             <Slider {...settings}>
//               {locations.map(location => {
//                 const images = location.popupImages && location.popupImages.length > 0 
//                   ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
//                   : ['/images/image1.png'];

//                 return (
//                   <div key={location.id} className='popup-item'>
//                     <Link to={`/popup/user/detail/${location.id}`} className='popup-link'>
//                       <div className="popup-image-box">
//                         {images.map((image, index) => (
//                           <img
//                             key={index} 
//                             src={image} 
//                             alt={`Banner ${index + 1}`} 
//                             className='popup-image'
//                           />
//                         ))}
//                       </div>
//                       <div className='popup-details'>
//                         <h3>{location.title}</h3>
//                         <p>{location.startDate ? `${location.startDate} ~ ${location.endDate}` : '상시 운영'}</p>
//                         <div className="category-box1">
//                           {location.categories && location.categories.map((category, index) => (
//                             <div key={index} className="category-item">{category.category}</div>
//                           ))}
//                         </div>
//                       </div>
//                     </Link>
//                   </div>
//                 );
//               })}
//             </Slider>
//           </>
//         )}
//       </div>

//       <br/><br/><br/><br/><br/>
//       {/* 하단 카테고리별 팝업 리스트 */}
//       <div className='category-search-wrapper'>
//         {isLoggedIn ? (
//           <>
//             <h1>"{userName}"님만을 위한 팝업리스트!!</h1>
//             {/* 로그인 했을 때, 카테고리별로 분류된 팝업 리스트 */}
//             {categories.map((category, index) => (
//               <div key={index} className='category-section'>
//                 <h2>{category.title}</h2>
//                 <div className='lower-popup-wrapper'>
//                   <Link to={`/popup/user/detail/${category.id}`} className='lower-popup-link'>
//                     <div className="lower-popup-item">
//                       <div className="lower-popup-image-box">
//                         {category.popupImages && category.popupImages.length > 0 ? (
//                           category.popupImages.map((image, imageIndex) => (
//                             <img
//                               key={imageIndex} 
//                               src={`http://localhost:8080/${image.imageUrl}`} 
//                               alt={`Banner ${imageIndex + 1}`} 
//                               className='lower-popup-image'
//                             />
//                           ))
//                         ) : (
//                           <img src='/images/image1.png' alt='Default Banner' className='lower-popup-image' />
//                         )}
//                       </div>
//                       <div className='lower-popup-details'>
//                         <h3>{category.title}</h3>
//                         <p>{category.startDate ? `${category.startDate} ~ ${category.endDate}` : '상시 운영'}</p>
//                         <div className="lower-category-box">
//                           {category.categories && category.categories.map((locCategory, index) => (
//                             <div key={index} className="lower-category-item">{locCategory.category}</div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </>
//         ) : (
//           <>
//             <h2>카테고리별 팝업스토어</h2>
//             {Object.keys(categorizedByCategory).map((category, index) => (
//               <div key={index} className='category-section'>
//                 <h2>{category}</h2>
//                 {categorizedByCategory[category].map((location, locationIndex) => (
//                   <div key={locationIndex} className='lower-popup-wrapper'>
//                     <Link to={`/popup/user/detail/${location.id}`} className='lower-popup-link'>
//                       <div className="lower-popup-item">
//                         <div className="lower-popup-image-box">
//                           {location.popupImages && location.popupImages.length > 0 ? (
//                             location.popupImages.map((image, imageIndex) => (
//                               <img
//                                 key={imageIndex} 
//                                 src={`http://localhost:8080/${image.imageUrl}`} 
//                                 alt={`Banner ${imageIndex + 1}`} 
//                                 className='lower-popup-image'
//                               />
//                             ))
//                           ) : (
//                             <img src='/images/image1.png' alt='Default Banner' className='lower-popup-image' />
//                           )}
//                         </div>
//                         <div className='lower-popup-details'>
//                           <h3>{location.title}</h3>
//                           <p>{location.startDate ? `${location.startDate} ~ ${location.endDate}` : '상시 운영'}</p>
//                           <div className="lower-category-box">
//                             {location.categories && location.categories.map((locCategory, index) => (
//                               <div key={index} className="lower-category-item">{locCategory.category}</div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// function SampleNextArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ ...style, display: "block", right: '-5px' }}
//       onClick={onClick}
//     />
//   );
// }

// function SamplePrevArrow(props) {
//   const { className, style, onClick } = props;
//   return (
//     <div
//       className={className}
//       style={{ ...style, display: "block", left: '-20px' }}
//       onClick={onClick}
//     />
//   );
// }

// export default Home_User;
