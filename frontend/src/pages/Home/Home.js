
// import React from 'react';
// import { Link } from "react-router-dom";
// import './Home.css';

// const Home = () => {
//   return (
//     <div>
//       <h1>메인 홈 화면</h1>

//       <div className='hansung'>
//         <Link to="/popup.details/hansung">한성대학교</Link>
//       </div>

//       <div className='cityhall'>
//         <Link to="/popup.details/cityhall">서울시청</Link>
//       </div>

//       <div className='location'>
//         <Link to="localhost:8080/search/popup/all">팝업 조회</Link>
//       </div>
//     </div>
//   );
// };

// export default Home;



// 24.07.08 백엔드 동적 통신코드 삽입 예제
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:8080/search/popup/all');
        if (!response.ok) {
          throw new Error('Network response was not ok: ${response.statusText}');
        }
        const data = await response.json();
        setLocations(data);
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
      <h1>메인 홈 화면</h1>
      {locations.map(location => (
        <div key={location.id} className='location'>
          <Link to={`/popup.details/${location.id}`}>{location.title}</Link>
        </div>
      ))}
    </div>
  );
};

export default Home;
