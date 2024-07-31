//24.07.15 카테고리별 팝업 따로 뜨게 설정

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

        console.log(data); // 데이터 구조 확인용

        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }

        if (Array.isArray(data.data)) {
          setLocations(data.data);
        } else {
          console.error("Received data does not contain an array of locations:", data);
          setLocations([]); // Fallback to an empty array if no locations found
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

  return (
    <div>
      <div className='recommended-popup-wrapper'>
        <h2>추천 팝업</h2>
        <Slider {...settings}>
          {locations.map(location => (
            <div key={location.id} className='popup-item'>
              <Link to={`/popup.details/${location.id}`} className='popup-link'>
                <img src={location.image || "/images/image1.png"} alt={location.title} className='popup-image'/>
                <div className='popup-details'>
                  <h3>{location.title}</h3>
                  <p>{location.description}</p>
                  <div className="category-box1">
                    {location.categories && location.categories.map((category, index) => (
                      <div key={index} className="category-item">{category.category}</div>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>

      <br/><br/><br/><br/><br/>
      <h1>카테고리별</h1>
      <div className='category-search-wrapper'>
        <div className='category-section'>
          <h2>캐릭터</h2>
          <div className='category-items'>
            {locations.filter(location =>
              location.categories && location.categories.some(locCategory => locCategory.category === "도서/음반")
            ).map(location => (
              <div key={location.id} className='popup-item'>
                <Link to={`/popup.details/${location.id}`} className='popup-link'>
                  <img src={location.image || "/images/image1.png"} alt={location.title} className='popup-image'/>
                  <div className='popup-details'>
                    <h3>{location.title}</h3>
                    <p>{location.description}</p>
                    <div className="category-box1">
                      {location.categories && location.categories.map((locCategory, index) => (
                        <div key={index} className="category-item">{locCategory.category}</div>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
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

export default Home;











// //24.07.15 카테고리별 팝업 따로 뜨게 설정

// import React, { useEffect, useState } from 'react';
// import { Link } from "react-router-dom";
// import Slider from "react-slick";
// import './Home.css';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const Home = () => {
//   const [locations, setLocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [categories, setCategories] = useState([]);

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

//         if (data.categories && Array.isArray(data.categories)) {
//           setCategories(data.categories);
//         }

//         console.log(data);
//         if (Array.isArray(data)) {
//           setLocations(data);
//         } else {
//           console.error("Received data is not an array:", data);
//           setLocations([]); // Empty array as fallback
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

//   const recommendedLocations = Array.isArray(locations) ? locations.slice(0) : [];

//   return (
//     <div>
//       <div className='recommended-popup-wrapper'>
//         <h2>추천 팝업</h2>
//         <Slider {...settings}>
//           {recommendedLocations.map(location => (
//             <div key={location.id} className='popup-item'>
//               <Link to={`/popup.details/${location.id}`} className='popup-link'>
//                 <img src={location.image || "/images/image1.png"} alt={location.title} className='popup-image'/>
//                 <div className='popup-details'>
//                   <h3>{location.title}</h3>
//                   <p>{location.description}</p>
//                   <div className="category-box1">
//                     {location.categories && location.categories.map((category, index) => (
//                       <div key={index} className="category-item">{category.name}</div>
//                     ))}
//                   </div>
//                 </div>
//               </Link>
//             </div>
//           ))}
//         </Slider>
//       </div>

//       <br/><br/><br/><br/><br/>
//       <h1>카테고리별</h1>
//       <div className='category-search-wrapper'>
//         <div className='category-section'>
//           <h2>캐릭터</h2>
//           <div className='category-items'>
//             {locations.filter(location =>
//               location.categories && location.categories.some(locCategory => locCategory.name === "캐릭터")
//             ).map(location => (
//               <div key={location.id} className='popup-item'>
//                 <Link to={`/popup.details/${location.id}`} className='popup-link'>
//                   <img src={location.image || "/images/image1.png"} alt={location.title} className='popup-image'/>
//                   <div className='popup-details'>
//                     <h3>{location.title}</h3>
//                     <p>{location.description}</p>
//                     <div className="category-box1">
//                       {location.categories && location.categories.map((locCategory, index) => (
//                         <div key={index} className="category-item">{locCategory.name}</div>
//                       ))}
//                     </div>
//                   </div>
//                 </Link>
//               </div>
//             ))}
//           </div>
//         </div>
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

// export default Home;
