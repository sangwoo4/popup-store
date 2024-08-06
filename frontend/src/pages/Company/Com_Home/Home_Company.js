import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home_Company.css';

const Home_Company = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.log(data); // 데이터 구조 확인용
        
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

  return (
    <div>
      <h1>기업 전용 페이지입니다.</h1>
      <div className='company-popup-list-wrapper'>
        <h2>현재 등록한 팝업</h2>
        {locations.length === 0 ? (
          <p>등록된 팝업스토어가 없습니다.</p>
        ) : (
          locations.map(location => (
            <div key={location.id} className='company-popup-item'>
              <Link to={`/popup/company/detail/${location.id}`} className='company-popup-link'>
                <div className="company-category-box">
                  {location.popupImages && location.popupImages.length > 0 ? (
                    location.popupImages.map((image, index) => (
                      <img
                        key={index}
                        src={image.imageUrl} // 서버에서 제공하는 이미지 URL을 직접 사용
                        alt={`Image ${index + 1}`}
                        className="company-popup-image"
                      />
                    ))
                  ) : (
                    <img src="/images/image1.png" alt="Default Image" className="company-popup-image" />
                  )}
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
              <Link to={`/popup/company/update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home_Company;


// import React, { useEffect, useState } from 'react';
// import { Link } from "react-router-dom";
// import './Home_Company.css';

// const Home_Company = () => {
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const response = await fetch('http://localhost:8080/company/popuplist', {
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

//   return (
//     <div>
//       <h1>기업 전용 페이지입니다.</h1>
//       <div className='company-popup-list-wrapper'>
//         <h2>현재 등록한 팝업</h2>
//         {locations.length === 0 ? (
//           <p>등록된 팝업스토어가 없습니다.</p>
//         ) : (
//           locations.map(location => (
//             <div key={location.id} className='company-popup-item'>
//               <Link to={`/popup/company/detail/${location.id}`} className='company-popup-link'>
              
//                 <div className="company-category-box">
//                   {location && location.popupImages && location.popupImages.length > 0 ? (
//                     location.popupImages.map((imageUrl, index) => (
//                       <img key={index} src={imageUrl} alt={`Popup ${index + 1}`} className="company-popup-image" />
//                     ))
//                   ) : (
//                     <img src="/images/image1.png" alt="Default Image" className="company-popup-image" />
//                   )}
//                 </div>

//                 <div className='company-popup-details'>
//                   <h3>{location.title}</h3>
//                   <p>{location.description}</p>
//                   <div className="company-category-box">
//                     {location.categories && location.categories.map((category, index) => (
//                       <div key={index} className="company-category-item">{category.category}</div>
//                     ))}
//                   </div>
//                 </div>
//               </Link>
//               <Link to={`/popup/company/update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home_Company;








// // 24.08.07 이미지 수정 전 코드
// import React, { useEffect, useState } from 'react';
// import { Link } from "react-router-dom";
// import './Home_Company.css';

// const Home_Company = () => {
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchLocations = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const response = await fetch('http://localhost:8080/company/popuplist', {
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

//   return (
//     <div>
//       <h1>기업 전용 페이지입니다.</h1>
//       <div className='company-popup-list-wrapper'>
//         <h2>현재 등록한 팝업</h2>
//         {locations.length === 0 ? (
//           <p>등록된 팝업스토어가 없습니다.</p>
//         ) : (
//           locations.map(location => (
//             <div key={location.id} className='company-popup-item'>
//               <Link to={`/popup/company/detail/${location.id}`} className='company-popup-link'>
//                 <img 
//                   src={location.image ? location.image : "/images/image1.png"} 
//                   alt={location.title} 
//                   className='company-popup-image'
//                 />
//                 <div className='company-popup-details'>
//                   <h3>{location.title}</h3>
//                   <p>{location.description}</p>
//                   <div className="company-category-box">
//                     {location.categories && location.categories.map((category, index) => (
//                       <div key={index} className="company-category-item">{category.category}</div>
//                     ))}
//                   </div>
//                 </div>
//               </Link>
//               <Link to={`/popup/company/update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home_Company;
