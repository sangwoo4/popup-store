import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import './Home_User.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home_User = () => {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
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

      // Fetch user nickname
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
        }
      })
      .catch(error => {
        console.error('닉네임 가져오기 중 오류 발생:', error);
      });

      // Fetch locations data
      fetch("http://localhost:8080/search/popup/all", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      .then((res) => res.json())
      .then(res => {
        if (res.result && res.data) {
          setLocations(res.data);
        } else {
          console.error("Received data does not contain valid locations:", res);
          setLocations([]);
        }
        setLoading(false);  // Set loading to false after fetching locations
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error);
        setLoading(false); // Set loading to false in case of error
      });

      // Fetch categories data
      fetch("http://localhost:8080/popup/ai/recommend/category", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then((res) => res.json())
      .then(res => {
        if (res.result && res.data) {
          setCategories(res.data);
        }
      })
      .catch(error => {
        console.error('카테고리 가져오기 중 오류 발생:', error);
      });
    } else {
      setIsLoggedIn(false);
    }
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

  return (
    <div>
      {/* 상단 추천 팝업 리스트 */}
      <div className='recommended-popup-wrapper'>
        {isLoggedIn ? (
          <h2>{userName}님을 위한 신규 추천 팝업 리스트~!</h2>
        ) : (
          <h2>신규 추천 팝업 리스트</h2>
        )}
        <Slider {...settings}>
          {locations.map(location => {
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
      <h1>"{userName}"님만을 위한 팝업리스트!!</h1>
      <div className='category-search-wrapper'>
        {categories.map((category, index) => {
          const categoryTitle = category.title;

          return (
            <div key={index} className='category-section'>
              <h2>{categoryTitle}</h2>
              {category && category.id ? (
                <div className='lower-popup-wrapper'>
                  <Link to={`/popup/user/detail/${category.id}`} className='lower-popup-link'>
                    <div className="lower-popup-item">
                      <div className="lower-popup-image-box">
                        {/* Handling empty images */}
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
              ) : (
                <p>No popups available for this category.</p>
              )}
            </div>
          );
        })}
      </div>
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

//   // 중복되지 않게 카테고리를 필터링합니다.
//   const uniqueCategories = [];
//   const categorySet = new Set();
//   categories.forEach(categoryObj => {
//     const categoryTitle = categoryObj.categories[0].category; // 첫 번째 카테고리 사용
//     if (!categorySet.has(categoryTitle)) {
//       uniqueCategories.push(categoryObj);
//       categorySet.add(categoryTitle);
//     }
//   });

//   return (
//     <div>
//       <div className='recommended-popup-wrapper'>
//         {isLoggedIn ? (
//           <h2>{userName}님을 위한 신규 추천 팝업 리스트~!</h2>
//         ) : (
//           <h2>신규 추천 팝업 리스트</h2>
//         )}
//         <Slider {...settings}>
//           {locations.map(location => {
//             const images = location.popupImages && location.popupImages.length > 0 
//               ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
//               : ['/images/image1.png'];

//             return (
//               <div key={location.id} className='popup-item'>
//                 <Link to={`/popup/user/detail/${location.id}`} className='popup-link'>
//                   <div className="popup-image-box">
//                     {images.map((image, index) => (
//                       <img
//                         key={index} 
//                         src={image} 
//                         alt={`Banner ${index + 1}`} 
//                         className='popup-image'
//                       />
//                     ))}
//                   </div>
//                   <div className='popup-details'>
//                     <h3>{location.title}</h3>
//                     <p>{location.startDate} ~ {location.endDate}</p>
//                     <div className="category-box1">
//                       {location.categories && location.categories.map((category, index) => (
//                         <div key={index} className="category-item">{category.category}</div>
//                       ))}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             );
//           })}
//         </Slider>
//       </div>

//       <br/><br/><br/><br/><br/>
//       <h1>"{userName}"님의 선호 카테고리별</h1>
//       <div className='category-search-wrapper'>
//         {uniqueCategories.map((categoryObj, index) => {
//           const categoryTitle = categoryObj.categories[0].category; // 첫 번째 카테고리 사용
//           const filteredLocations = locations.filter(location =>
//             location.categories && location.categories.some(locCategory => locCategory.category === categoryTitle)
//           );

//           return (
//             <div key={index} className='category-section'>
//               <h2>{categoryTitle}</h2>
//               <div className='category-slider-wrapper'>
//                 <Slider {...settings}>
//                   {filteredLocations.map(location => {
//                     const images = location.popupImages && location.popupImages.length > 0 
//                       ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
//                       : ['/images/image1.png'];

//                     return (
//                       <div key={location.id} className='popup-item'>
//                         <Link to={`/popup/user/detail/${location.id}`} className='popup-link'>
//                           <div className="popup-image-box">
//                             {images.map((image, index) => (
//                               <img
//                                 key={index} 
//                                 src={image} 
//                                 alt={`Banner ${index + 1}`} 
//                                 className='popup-image'
//                               />
//                             ))}
//                           </div>
//                           <div className='popup-details'>
//                             <h3>{location.title}</h3>
//                             <p>{location.startDate} ~ {location.endDate}</p>
//                             <div className="category-box1">
//                               {location.categories && location.categories.map((locCategory, index) => (
//                                 <div key={index} className="category-item">{locCategory.category}</div>
//                               ))}
//                             </div>
//                           </div>
//                         </Link>
//                       </div>
//                     );
//                   })}
//                 </Slider>
//               </div>
//             </div>
//           );
//         })}
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











// // 24.08.08 유저별 카테고리별 분류 전
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
//         }
//       })
//       .catch(error => {
//         console.error('닉네임 가져오기 중 오류 발생:', error);
//       });

//       fetch("http://localhost:8080/user/categories", {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       })
//       .then((res) => res.json())
//       .then(res => {
//         if (Array.isArray(res)) {
//           setCategories(res);
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
//         console.log(data); // 데이터 구조 확인용

//         if (Array.isArray(data.data)) {
//           setLocations(data.data);
//         } else {
//           console.error("Received data does not contain an array of locations:", data);
//           setLocations([]); // Fallback to an empty array if no locations found
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

//   return (
//     <div>
//       <div className='recommended-popup-wrapper'>
//         {isLoggedIn ? (
//           <h2>{userName}님을 위한 신규 추천 팝업 리스트~!</h2>
//         ) : (
//           <h2>신규 추천 팝업 리스트</h2>
//         )}
//         <Slider {...settings}>
//           {locations.map(location => {
//             const images = location.popupImages && location.popupImages.length > 0 
//               ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
//               : ['/images/image1.png'];

//             return (
//               <div key={location.id} className='popup-item'>
//                 <Link to={`/popup/user/detail/${location.id}`} className='popup-link'>
//                   <div className="popup-image-box">
//                     {images.map((image, index) => (
//                       <img
//                         key={index} 
//                         src={image} 
//                         alt={`Banner ${index + 1}`} 
//                         className='popup-image'
//                       />
//                     ))}
//                   </div>
//                   <div className='popup-details'>
//                     <h3>{location.title}</h3>
//                     <p>{location.startDate} ~ {location.endDate}</p>
//                     <div className="category-box1">
//                       {location.categories && location.categories.map((category, index) => (
//                         <div key={index} className="category-item">{category.category}</div>
//                       ))}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             );
//           })}
//         </Slider>
//       </div>

//       <br/><br/><br/><br/><br/>
//       <h1>"{userName}"님의 선호 카테고리별</h1>
//       <div className='category-search-wrapper'>
//         {categories.map(category => (
//           <div key={category} className='category-section'>
//             <h2>{category}</h2>
//             <div className='category-items'>
//               {locations.filter(location =>
//                 location.categories && location.categories.some(locCategory => locCategory.category === category)
//               ).map(location => {
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
//                         <p>{location.description}</p>
//                         <div className="category-box1">
//                           {location.categories && location.categories.map((locCategory, index) => (
//                             <div key={index} className="category-item">{locCategory.category}</div>
//                           ))}
//                         </div>
//                       </div>
//                     </Link>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
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



