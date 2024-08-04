import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import './Home_Company.css';

const Home_Company = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch('http://localhost:8080/company/popuplist', {
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
              <Link to={`/popup.details/${location.id}`} className='company-popup-link'>
                <img src={location.image || "/images/image1.png"} alt={location.title} className='company-popup-image'/>
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
              <Link to={`/popup.update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home_Company;







// // 24.08.04 팝업 수정하기 버튼
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
//               <Link to={`/popup.details/${location.id}`} className='company-popup-link'>
//                 <img src={location.image || "/images/image1.png"} alt={location.title} className='company-popup-image'/>
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
//               <Link to={`/popup.update/${location.id}`} className='company-popup-edit-link'>수정하기</Link>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Home_Company;
