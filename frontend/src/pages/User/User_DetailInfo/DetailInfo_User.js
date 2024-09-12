import './DetailInfo_User.css';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";

const DetailInfo_User = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('info');
  const [locationInfo, setLocationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationEnabled, setReservationEnabled] = useState(false);
  const [isHearted, setIsHearted] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const mapElement = useRef(null);

  const handleReservationClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (locationInfo && locationInfo.id) {
      navigate(`/popup/user/popup_pre_reservation/${locationInfo.id}`);
    } else {
      console.error('Location ID is missing.');
    }
  };

  useEffect(() => {
    if (!location) {
      setError('Location parameter is missing.');
      setLoading(false);
      return;
    }

    const fetchLocationInfo = async () => {
      try {
        const response = await fetch(`http://localhost:8080/popup/detail/${location}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok...');
        }

        const data = await response.json();
        console.log(data);

        if (data && data.data) {
          const { id, companyName, companyEmail, title, address, detailInfo, telephone, description, popupImages, link, views, heartCount, categories, storeDays, mapx, mapy, startDate, endDate, reservation, isHearted } = data.data;

          setIsHearted(isHearted);

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
            companyName,
            companyEmail,
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
            latlng,
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

  useEffect(() => {
    if (locationInfo) {
      const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
          const response = await fetch(`http://localhost:8080/popup/review/${locationInfo.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Network response was not ok...');
          }

          const data = await response.json();
          console.log(data);

          setReviews(data.data || []);
        } catch (error) {
          setReviewsError(error.message || 'Failed to fetch reviews');
        } finally {
          setReviewsLoading(false);
        }
      };

      fetchReviews();
    }
  }, [locationInfo]);

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

  const handleHeartClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const method = isHearted ? 'DELETE' : 'POST';
      const response = await fetch(`http://localhost:8080/heart`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          popupStoreId: locationInfo.id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error response:', errorMessage);
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Heart result:', result);
      setIsHearted(!isHearted);
    } catch (error) {
      console.error('Error handling heart click:', error);
      alert('찜 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  const handleReviewClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    setShowReviewForm(true);
  };

  const handleReviewSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/popup/review/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          popupStoreId: locationInfo.id,
          reviewText: reviewText,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error('Error response:', errorMessage);
        throw new Error('Network response was not ok');
      }

      alert('후기가 성공적으로 등록되었습니다.');
      window.location.reload();
      setShowReviewForm(false);
      setReviewText('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('후기 작성 중 오류가 발생했습니다.');
    }
  };
  
  // Delete review handler
  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/popup/review/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,  // 토큰이 제대로 포함되어 있는지 확인
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
  
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
      alert('후기가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('후기 삭제 중 오류가 발생했습니다.');
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
          {reviews.length === 0 ? (
            <p>현재 등록된 후기가 없습니다.</p>
          ) : (
            <div>
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="nickname">{review.nickname}</span>
                    <span className="date">{new Date(review.localDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="review-body">
                    {review.reviewText}
                  </div>
                  <div className="delete-icon">
                    <MdDelete
                      onClick={() => handleDeleteReview(review.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleReviewClick}>후기 작성하기</button>
          {showReviewForm && (
            <div className="review-form">
              <textarea
                placeholder="후기를 작성하세요."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button onClick={handleReviewSubmit}>후기 전송</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailInfo_User;








// //24.09.09 찜, 후기 post가능
// import './DetailInfo_User.css';
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { MdDelete } from "react-icons/md";

// const DetailInfo_User = () => {
//   const { location } = useParams();
//   const navigate = useNavigate();
//   const [activeMenu, setActiveMenu] = useState('info');
//   const [locationInfo, setLocationInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [reservationEnabled, setReservationEnabled] = useState(false);
//   const [isHearted, setIsHearted] = useState(false);
//   const [reviewText, setReviewText] = useState('');
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [reviews, setReviews] = useState([]);
//   const [reviewsLoading, setReviewsLoading] = useState(true);
//   const [reviewsError, setReviewsError] = useState(null);
//   const mapElement = useRef(null);

//   const handleReservationClick = () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }

//     if (locationInfo && locationInfo.id) {
//       navigate(`/popup/user/popup_pre_reservation/${locationInfo.id}`);
//     } else {
//       console.error('Location ID is missing.');
//     }
//   };

//   useEffect(() => {
//     if (!location) {
//       setError('Location parameter is missing.');
//       setLoading(false);
//       return;
//     }

//     const fetchLocationInfo = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/popup/detail/${location}`, {
//           method: 'GET',
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
//           const { id, companyName, companyEmail, title, address, detailInfo, telephone, description, popupImages, link, views, heartCount, categories, storeDays, mapx, mapy, startDate, endDate, reservation, isHearted } = data.data;

//           setIsHearted(isHearted);

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
//             companyName,
//             companyEmail,
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
//             latlng,
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
//     if (locationInfo) {
//       const fetchReviews = async () => {
//         setReviewsLoading(true);
//         try {
//           const response = await fetch(`http://localhost:8080/popup/review/${locationInfo.id}`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           });

//           if (!response.ok) {
//             throw new Error('Network response was not ok...');
//           }

//           const data = await response.json();
//           console.log(data);

//           setReviews(data.data || []);
//         } catch (error) {
//           setReviewsError(error.message || 'Failed to fetch reviews');
//         } finally {
//           setReviewsLoading(false);
//         }
//       };

//       fetchReviews();
//     }
//   }, [locationInfo]);

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

//   const handleHeartClick = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }

//     try {
//       const method = isHearted ? 'DELETE' : 'POST';
//       const response = await fetch(`http://localhost:8080/heart`, {
//         method: method,
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           popupStoreId: locationInfo.id,
//         }),
//       });

//       if (!response.ok) {
//         const errorMessage = await response.text();
//         console.error('Error response:', errorMessage);
//         throw new Error('Network response was not ok');
//       }

//       const result = await response.json();
//       console.log('Heart result:', result);
//       setIsHearted(!isHearted);
//     } catch (error) {
//       console.error('Error handling heart click:', error);
//       alert('찜 상태를 변경하는 중 오류가 발생했습니다.');
//     }
//   };

//   const handleReviewClick = () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }
//     setShowReviewForm(true);
//   };

//   const handleReviewSubmit = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       alert('로그인이 필요합니다.');
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:8080/popup/review/register`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           popupStoreId: locationInfo.id,
//           reviewText: reviewText,
//         }),
//       });

//       if (!response.ok) {
//         const errorMessage = await response.text();
//         console.error('Error response:', errorMessage);
//         throw new Error('Network response was not ok');
//       }

//       alert('후기가 성공적으로 등록되었습니다.');
//       window.location.reload();
//       setShowReviewForm(false);
//       setReviewText('');
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       alert('후기 작성 중 오류가 발생했습니다.');
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
//         <div className="banner-images">
//           {locationInfo.popupImages.map((image, index) => (
//             <img key={index} src={image} alt={`Banner ${index + 1}`} className="banner-image" />
//           ))}
//         </div>
//       </div>
//       <div className="heart-section">
//         <button className="heart-button" onClick={handleHeartClick}>
//           {isHearted ? '♥' : '♡'}
//         </button>
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
//               {locationInfo.storeDays.map((day, index) => (
//                 <div key={index}>
//                   <p>{day.day}: {day.openTime} ~ {day.closeTime}</p>
//                 </div>
//               ))}
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
//           {reviewsLoading ? (
//             <p>Loading reviews...</p>
//           ) : reviewsError ? (
//             <p>Error loading reviews: {reviewsError}</p>
//           ) : reviews.length === 0 ? (
//             <p>현재 등록된 후기가 없습니다.</p>
//           ) : (
//             <div>
//               {reviews.map((review, index) => (
//                 <div key={index} className="review-item">
//                   <div className="review-header">
//                     <span className="nickname">{review.nickname}</span>
//                     <span className="date">{new Date(review.localDateTime).toLocaleDateString()}</span>
//                   </div>
//                   <div className="review-body">
//                     {review.reviewText}
//                   </div>
//                 </div>
//               ))}
//             </div>

//           )}
//           <button onClick={handleReviewClick}>후기 작성하기</button>
//           {showReviewForm && (
//             <div className="review-form">
//               <textarea
//                 placeholder="후기를 작성하세요."
//                 value={reviewText}
//                 onChange={(e) => setReviewText(e.target.value)}
//                 maxLength="300"
//               />
//               <button className="submit-button" onClick={handleReviewSubmit}>후기 전송</button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DetailInfo_User;