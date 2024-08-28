import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./Dashboard_Company.css";

// 왼쪽 사이드바 관리
const Sidebar = ({ onSelect }) => {
  return (
    <div className="sidebar">
      <h2>대시보드</h2>
      <ul className="menu-list">
        <li onClick={() => onSelect("registration")}>팝업스토어 등록 현황</li>
        <li onClick={() => onSelect("reservationRate")}>사전예약률</li>
        <li onClick={() => onSelect("reservationStatus")}>사전예약 현황</li>
        <li onClick={() => onSelect("management")}>팝업스토어 관리</li>
      </ul>
    </div>
  );
};

// 메인 대시보드 출력 화면
const Dashboard_Company = () => {
  const [selectedSection, setSelectedSection] = useState("registration");
  const [locations, setLocations] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/company/popuplist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        
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

  const fetchReservations = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/popup/reservation/list/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.result && Array.isArray(data.data)) {
        setReservations(data.data);
      } else {
        console.error("Received data does not contain an array of reservations:", data);
        setReservations([]);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError(error);
    }
  };

  const handlePopupClick = (id) => {
    if (selectedSection === "reservationStatus") {
      fetchReservations(id);
      setSelectedPopupId(id); // 현재 선택된 팝업스토어 ID 설정
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case "registration":
        return (
          <div className='company-popup-list-wrapper'>
            <h2>현재 등록한 팝업</h2>
            {locations.length === 0 ? (
              <p>등록된 팝업스토어가 없습니다.</p>
            ) : (
              locations.map(location => {
                const images = location.popupImages && location.popupImages.length > 0 
                  ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
                  : ['/images/image1.png'];
                console.log('Converted Image URLs:', images);

                return (
                  <div key={location.id} className='company-popup-item'>
                    <Link to={`/popup/company/detail/${location.id}`} className='company-popup-link'>
                      <div className="company-category-box">
                        {images.map((image, index) => (
                          <img
                            key={index} 
                            src={image} 
                            alt={`Banner ${index + 1}`} 
                            className="company-popup-image"
                          />
                        ))}
                      </div>
                      <div className='company-popup-details'>
                        <h3>{location.title}</h3>
                        <p>{location.description}</p>
                        <div className="company-category-box">
                          {location.categories && location.categories.map((category, index) => (
                            <div key={index} className="company-category-item">{category.category}</div>
                          ))}
                        </div>
                      </div>
                    </Link>
                    <div className='company-popup-edit-buttons'>
                      <Link to={`/popup/company/update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
                      <Link to={`/popup/company/pre-reservation/update/${location.id}`} className='company-popup-edit-link'>사전예약 관리</Link> 
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );

      case "reservationRate":
        return <div>사전예약률</div>;

      case "reservationStatus":
        return (
          <div>
            <h2>사전예약 현황</h2>
            {locations.length === 0 ? (
              <p>등록된 팝업스토어가 없습니다.</p>
            ) : (
              <div className='company-popup-list-wrapper'>
                <h3>팝업스토어 목록:</h3>
                {locations.map(location => (
                  <div key={location.id} className='company-popup-item'>
                    <h4 
                      onClick={() => handlePopupClick(location.id)} 
                      className="popup-title"
                    >
                      {location.title}
                    </h4>
                    {selectedPopupId === location.id && (
                      <div className="reservation-status-details">
                        <h4>사전예약 내역:</h4>
                        {reservations.length === 0 ? (
                          <p>사전예약 내역이 없습니다.</p>
                        ) : (
                          <div className="reservation-list">
                            {reservations.map(reservation => (
                              <div key={reservation.reservationId} className='reservation-card'>
                                <p><strong>날짜:</strong> {reservation.date}</p>
                                <p><strong>시간:</strong> {reservation.startTime}</p>
                                <p><strong>예약자명:</strong> {reservation.name}</p>
                                <p><strong>참여 인원:</strong> {reservation.numberOfPeople}</p>
                                <p><strong>예약 ID:</strong> {reservation.reservationId}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "management":
        return <div>팝업스토어 관리</div>;

      default:
        return <div>기업 대시보드 화면입니다</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onSelect={setSelectedSection} />
      <div className="content">
        <h1>대시보드</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard_Company;












// //24.08.28 사전예약 현황 추가 전 코드
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom"; // Link 컴포넌트 사용을 위해 react-router-dom을 임포트
// import "./Dashboard_Company.css";

// // 왼쪽 사이드바 관리
// const Sidebar = ({ onSelect }) => {
//   return (
//     <div className="sidebar">
//       <h2>대시보드</h2>
//       <ul className="menu-list">
//         <li onClick={() => onSelect("registration")}>팝업스토어 등록 현황</li>
//         <li onClick={() => onSelect("reservationRate")}>사전예약률</li>
//         <li onClick={() => onSelect("management")}>팝업스토어 관리</li>
//       </ul>
//     </div>
//   );
// };

// // 메인 대시보드 출력 화면
// const Dashboard_Company = () => {
//   const [selectedSection, setSelectedSection] = useState("registration");
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch('http://localhost:8080/company/popuplist', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
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

//   const renderContent = () => {
//     switch (selectedSection) {
//       case "registration":
//         return (
//           <div className='company-popup-list-wrapper'>
//             <h2>현재 등록한 팝업</h2>
//             {locations.length === 0 ? (
//               <p>등록된 팝업스토어가 없습니다.</p>
//             ) : (
//               locations.map(location => {
//                 const images = location.popupImages && location.popupImages.length > 0 
//                   ? location.popupImages.map(image => `http://localhost:8080/${image.imageUrl}`) 
//                   : ['/images/image1.png'];
//                 console.log('Converted Image URLs:', images);

//                 return (
//                   <div key={location.id} className='company-popup-item'>
//                     <Link to={`/popup/company/detail/${location.id}`} className='company-popup-link'>
//                       <div className="company-category-box">
//                         {images.map((image, index) => (
//                           <img
//                             key={index} 
//                             src={image} 
//                             alt={`Banner ${index + 1}`} 
//                             className="company-popup-image"
//                           />
//                         ))}
//                       </div>
//                       <div className='company-popup-details'>
//                         <h3>{location.title}</h3>
//                         <p>{location.description}</p>
//                         <div className="company-category-box">
//                           {location.categories && location.categories.map((category, index) => (
//                             <div key={index} className="company-category-item">{category.category}</div>
//                           ))}
//                         </div>
//                       </div>
//                     </Link>
//                     <div className='company-popup-edit-buttons'> {/* 버튼들을 감싸는 컨테이너 */}
//                       <Link to={`/popup/company/update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
//                       <Link to={`/popup/company/pre-reservation/update/${location.id}`} className='company-popup-edit-link'>사전예약 관리</Link> 
//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         );
        
//       case "reservationRate":
//         return <div>사전예약률</div>;
//       case "management":
//         return <div>팝업스토어 관리</div>;
//       default:
//         return <div>기업 대시보드 화면입니다</div>;
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <Sidebar onSelect={setSelectedSection} />
//       <div className="content">
//         <h1>대시보드</h1>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Dashboard_Company;
