import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Mypage_User.css';
import { MdDelete } from "react-icons/md";
import API_BASE_URL from '../../../URL_API';

const Sidebar = ({ onSelect }) => {
  return (
    <div className="sidebar">
      <h2>마이페이지</h2>
      <ul className="menu-list">
        <li onClick={() => onSelect("myPage")}>마이페이지</li>
        <li onClick={() => onSelect("myHeart")}>나의 찜 목록</li>
        <li onClick={() => onSelect("myReservation")}>나의 사전예약</li>
        <li onClick={() => onSelect("myReview")}>나의 리뷰</li>
        <li onClick={() => onSelect("editMember")}>회원정보 수정</li>
        <li onClick={() => onSelect("deleteMember")}>회원탈퇴</li>
      </ul>
    </div>
  );
};

const Mypage_User = () => {
  const [selectedSection, setSelectedSection] = useState("myPage");
  const [userMypage, setUserMypage] = useState({});
  const [userReservations, setUserReservations] = useState({});
  const [userHearts, setUserHearts] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/auth/user/mypage/confirm.pw`);
  };

  const handleDeleteClick = () => {
    navigate(`/auth/user/mypage/delete/userinfo`);
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId) => {
    console.log('Deleting review with ID:', reviewId); // 리뷰 ID 확인
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE_URL}/popup/review/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
      alert('후기가 성공적으로 삭제되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('후기 삭제 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate("/auth/user/login");
      return;
    }

    // 회원정보 조회 (수정 전 get 띄우기)
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${API_BASE_URL}/mypage/getinfo`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json();

        setUserInfo(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // 마이페이지 조회
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/mypage/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json();
        setUserMypage(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // 예약내역 조회
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/popup/reservation/user/list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reservations. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        const groupedData = data.data.reduce((acc, curr) => {
          if (!acc[curr.title]) {
            acc[curr.title] = [];
          }
          acc[curr.title].push(curr);
          return acc;
        }, {});

        setUserReservations(groupedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    // 찜목록 조회
    const fetchUserHearts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/heart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data. Status: ${response.status}`);
        }

        const data = await response.json();
        setUserHearts(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (selectedSection === "myPage") {
      fetchUserData();
    }
    if (selectedSection === "myHeart") {
      fetchUserHearts();
    }
    if (selectedSection === "myReservation") {
      fetchReservations();
    }
    if (selectedSection === "myReview") {
      fetchUserData();
    }
    if (selectedSection === "editMember") {
      fetchUserInfo();
    }
    if (selectedSection === "deleteMember") {
      handleDeleteClick();
    }

  }, [selectedSection, navigate]);

  const handleCardClick = (reservation) => {
    navigate(`/popup/user/popup_reservation/confirm/${reservation.Id}`, {
      state: { reservationDetails: reservation }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const mypageContent = () => {
    switch (selectedSection) {
      case "myPage":
        return (
          <div className="myPage-container">
            <h2>마이페이지 정보</h2>
            <p><strong>닉네임:</strong> {userMypage.nickname}</p>
            <p><strong>이메일:</strong> {userMypage.email}</p>
            <br />
            <h3>예약 내역 확인은 [나의 사전예약]에서 확인 가능합니다!</h3>
            <p className="heart-count"><strong>찜 개수:</strong> {userMypage.allHearts}</p>
            <p className="review-count"><strong>나의 리뷰:</strong> {userMypage.allReviews}</p>
            <p className="reservation-count"><strong>예약 개수:</strong> {userMypage.allReservations}</p>
            <p><strong>카테고리:</strong></p>
            <div className="category-list">
              {userMypage.categories.map((category, index) => (
                <div key={index} className="category-box">
                  {category}
                </div>
              ))}
            </div>
          </div>
        );



      case "myHeart":
        return (
          <div className="myHeart-container">
            <h3>나의 찜 목록</h3>
            {userHearts && userHearts.length > 0 ? (
              userHearts.map((heart) => (
                <div key={heart.id}>
                  <p>[{heart.popupStoreId}] {heart.popupTitle}</p>
                </div>
              ))
            ) : (
              <p>찜한 팝업스토어가 없습니다.</p>
            )}
          </div>
        );

      case "myReservation":
        return (
          <div className="reservation-container">
            <h1>예약내역 페이지</h1>
            {Object.keys(userReservations).map((title) => (
              <div key={title} className="popupstore-container">
                <h2 className="popupstore-title">{title}</h2>
                <div className="reservation-cards">
                  {userReservations[title].map((reservation) => (
                    <div
                      key={reservation.reservationId}
                      className="reservation-card"
                      onClick={() => handleCardClick(reservation)}
                    >
                      <p><strong>날짜:</strong> {reservation.date}</p>
                      <p><strong>시간:</strong> {reservation.startTime}</p>
                      <p><strong>참여 인원:</strong> {reservation.numberOfPeople}</p>
                      <p><strong>예약 ID:</strong> {reservation.Id}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "myReview":
        return (
          <div className="myReview-container">
            <p><strong>나의 리뷰:</strong> {userMypage.allReviews}</p>

            <div className="review-content">
              {userMypage.reviews && userMypage.reviews.length === 0 ? (
                <p>현재 등록된 후기가 없습니다.</p>
              ) : (
                <div>
                  {userMypage.reviews && userMypage.reviews.map((review, index) => (
                    <div key={index} className="review-item">
                      <div className="review-header">
                        <span className="date">{new Date(review.localDateTime).toLocaleString()}</span>
                      </div>
                      <div className="review-body">
                        <h3>{review.popupStoretitle}</h3>
                        {review.reviewId}
                        {review.reviewText}
                      </div>
                      <div className="delete-icon">
                        <MdDelete
                          onClick={() => handleDeleteReview(review.reviewId)} // 수정된 부분
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );


      case "editMember":
        return (
          <div className="editMember-container">
            <h3>회원정보 수정</h3>
            {userInfo ? (
              <form>
                <div className="form-group">
                  <label>아이디:</label>
                  <input type="text" value={userInfo.username} disabled />
                </div>
                <div className="form-group">
                  <label>이메일:</label>
                  <input type="email" value={userInfo.email} disabled />
                </div>
                <div className="form-group">
                  <label>닉네임:</label>
                  <input type="text" value={userInfo.nickname} disabled />
                </div>
                <div className="form-group">
                  <label>생년월일:</label>
                  <input type="text" value={userInfo.birth} disabled />
                </div>
                <div className="form-group">
                  <label>성별:</label>
                  <input type="text" value={userInfo.gender} disabled />
                </div>
                <div className="form-group">
                  <label>전화번호:</label>
                  <input type="text" value={userInfo.phone} disabled />
                </div>
                <div className="form-group">
                  <label>우편번호:</label>
                  <input type="text" value={userInfo.postcode} disabled />
                </div>
                <div className="form-group">
                  <label>도로명 주소:</label>
                  <input type="text" value={userInfo.address} disabled />
                </div>
                <div className="form-group">
                  <label>지번 주소:</label>
                  <input type="text" value={userInfo.roadAddress} disabled />
                </div>
                <div className="form-group">
                  <label>상세주소:</label>
                  <input type="text" value={userInfo.detailAddress} disabled />
                </div>
                <div className="form-group">
                  <label>카테고리:</label>
                  <ul>
                    {userInfo.categories.map((category) => (
                      <li key={category.categoryId}>{category.category}</li>
                    ))}
                  </ul>
                </div>
              </form>
            ) : (
              <p>회원정보를 불러오는 중입니다...</p>
            )}
            <button onClick={handleEditClick}>수정하기</button>
          </div>
        );


      case "deleteMember":
        return <div>회원탈퇴</div>;

      default:
        return <div>유저 마이페이지 화면입니다.</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onSelect={setSelectedSection} />
      <div className="content">
        <h1>마이페이지</h1>
        {mypageContent()}
      </div>
    </div>
  );
};

export default Mypage_User;





// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import './Mypage_User.css';
// import { MdDelete } from "react-icons/md";
// import API_BASE_URL from '../../../URL_API';

// const Sidebar = ({ onSelect }) => {
//   return (
//     <div className="sidebar">
//       <h2>마이페이지</h2>
//       <ul className="menu-list">
//         <li onClick={() => onSelect("myPage")}>마이페이지</li>
//         <li onClick={() => onSelect("myHeart")}>나의 찜 목록</li>
//         <li onClick={() => onSelect("myReservation")}>나의 사전예약</li>
//         <li onClick={() => onSelect("myReview")}>나의 리뷰</li>
//         <li onClick={() => onSelect("editMember")}>회원정보 수정</li>
//         <li onClick={() => onSelect("deleteMember")}>회원탈퇴</li>
//       </ul>
//     </div>
//   );
// };

// const Mypage_User = () => {
//   const [selectedSection, setSelectedSection] = useState("myPage");
//   const [userMypage, setUserMypage] = useState({});
//   const [userReservations, setUserReservations] = useState({});
//   const [userHearts, setUserHearts] = useState({});
//   const [userInfo, setUserInfo] = useState(null);
//   const [reviews, setReviews] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   const handleEditClick = () => {
//     navigate(`/auth/user/mypage/confirm.pw`);
//   };

//   const handleDeleteClick = () => {
//     navigate(`/auth/user/mypage/delete/userinfo`);
//   };

//   // 리뷰 삭제
//   const handleDeleteReview = async (reviewId) => {
//     console.log('Deleting review with ID:', reviewId); // 리뷰 ID 확인
//     const token = localStorage.getItem('token');

//     try {
//       const response = await fetch(`${API_BASE_URL}/popup/review/delete`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ reviewId }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete review');
//       }

//       setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
//       alert('후기가 성공적으로 삭제되었습니다.');
//       window.location.reload();
//     } catch (error) {
//       console.error('Error deleting review:', error);
//       alert('후기 삭제 중 오류가 발생했습니다.');
//     }
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert('로그인이 필요합니다.');
//       navigate("/auth/user/login");
//       return;
//     }

//     // 회원정보 조회 (수정 전 get 띄우기)
//     const fetchUserInfo = async () => {
//       const token = localStorage.getItem("token");

//       try {
//         const response = await fetch(`${API_BASE_URL}/mypage/getinfo`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch user data. Status: ${response.status}`);
//         }

//         const data = await response.json();

//         setUserInfo(data.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     // 마이페이지 조회
//     const fetchUserData = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/mypage/user`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch user data. Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setUserMypage(data.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     // 예약내역 조회
//     const fetchReservations = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/popup/reservation/user/list`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch reservations. Status: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log(data);

//         const groupedData = data.data.reduce((acc, curr) => {
//           if (!acc[curr.title]) {
//             acc[curr.title] = [];
//           }
//           acc[curr.title].push(curr);
//           return acc;
//         }, {});

//         setUserReservations(groupedData);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     // 찜목록 조회
//     const fetchUserHearts = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/heart`, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error(`Failed to fetch user data. Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setUserHearts(data.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     if (selectedSection === "myPage") {
//       fetchUserData();
//     }
//     if (selectedSection === "myHeart") {
//       fetchUserHearts();
//     }
//     if (selectedSection === "myReservation") {
//       fetchReservations();
//     }
//     if (selectedSection === "myReview") {
//       fetchUserData();
//     }
//     if (selectedSection === "editMember") {
//       fetchUserInfo();
//     }
//     if (selectedSection === "deleteMember") {
//       handleDeleteClick();
//     }

//   }, [selectedSection, navigate]);

//   const handleCardClick = (reservation) => {
//     navigate(`/popup/user/popup_reservation/confirm/${reservation.Id}`, {
//       state: { reservationDetails: reservation }
//     });
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   const mypageContent = () => {
//     switch (selectedSection) {
//       case "myPage":
//         return (
//           <div className="myPage-container">
//             <h2>마이페이지 정보</h2>
//             <p><strong>닉네임:</strong> {userMypage.nickname}</p>
//             <p><strong>이메일:</strong> {userMypage.email}</p>
//             <br />
//             <h3>예약 내역 확인은 [나의 사전예약]에서 확인 가능합니다!</h3>
//             <p className="heart-count"><strong>찜 개수:</strong> {userMypage.allHearts}</p>
//             <p className="review-count"><strong>나의 리뷰:</strong> {userMypage.allReviews}</p>
//             <p className="reservation-count"><strong>예약 개수:</strong> {userMypage.allReservations}</p>
//             <p><strong>카테고리:</strong> <span className="categories">[{userMypage.categories.join('], [')}]</span></p>
//           </div>
//         );


//       case "myHeart":
//         return (
//           <div className="myHeart-container">
//             <h3>나의 찜 목록</h3>
//             {userHearts && userHearts.length > 0 ? (
//               userHearts.map((heart) => (
//                 <div key={heart.id}>
//                   <p>[{heart.popupStoreId}] {heart.popupTitle}</p>
//                 </div>
//               ))
//             ) : (
//               <p>찜한 팝업스토어가 없습니다.</p>
//             )}
//           </div>
//         );

//       case "myReservation":
//         return (
//           <div className="reservation-container">
//             <h1>예약내역 페이지</h1>
//             {Object.keys(userReservations).map((title) => (
//               <div key={title} className="popupstore-container">
//                 <h2 className="popupstore-title">{title}</h2>
//                 <div className="reservation-cards">
//                   {userReservations[title].map((reservation) => (
//                     <div
//                       key={reservation.reservationId}
//                       className="reservation-card"
//                       onClick={() => handleCardClick(reservation)}
//                     >
//                       <p><strong>날짜:</strong> {reservation.date}</p>
//                       <p><strong>시간:</strong> {reservation.startTime}</p>
//                       <p><strong>참여 인원:</strong> {reservation.numberOfPeople}</p>
//                       <p><strong>예약 ID:</strong> {reservation.Id}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         );

//       case "myReview":
//         return (
//           <div className="myReview-container">
//             <p><strong>나의 리뷰:</strong> {userMypage.allReviews}</p>

//             <div className="review-content">
//               {userMypage.reviews && userMypage.reviews.length === 0 ? (
//                 <p>현재 등록된 후기가 없습니다.</p>
//               ) : (
//                 <div>
//                   {userMypage.reviews && userMypage.reviews.map((review, index) => (
//                     <div key={index} className="review-item">
//                       <div className="review-header">
//                         <span className="date">{new Date(review.localDateTime).toLocaleString()}</span>
//                       </div>
//                       <div className="review-body">
//                         <h3>{review.popupStoretitle}</h3>
//                         {review.reviewId}
//                         {review.reviewText}
//                       </div>
//                       <div className="delete-icon">
//                         <MdDelete
//                           onClick={() => handleDeleteReview(review.reviewId)} // 수정된 부분
//                           style={{ cursor: 'pointer' }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         );


//       case "editMember":
//         return (
//           <div className="editMember-container">
//             <h3>회원정보 수정</h3>
//             {userInfo ? (
//               <form>
//                 <div className="form-group">
//                   <label>아이디:</label>
//                   <input type="text" value={userInfo.username} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>이메일:</label>
//                   <input type="email" value={userInfo.email} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>닉네임:</label>
//                   <input type="text" value={userInfo.nickname} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>생년월일:</label>
//                   <input type="text" value={userInfo.birth} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>성별:</label>
//                   <input type="text" value={userInfo.gender} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>전화번호:</label>
//                   <input type="text" value={userInfo.phone} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>우편번호:</label>
//                   <input type="text" value={userInfo.postcode} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>도로명 주소:</label>
//                   <input type="text" value={userInfo.address} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>지번 주소:</label>
//                   <input type="text" value={userInfo.roadAddress} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>상세주소:</label>
//                   <input type="text" value={userInfo.detailAddress} disabled />
//                 </div>
//                 <div className="form-group">
//                   <label>카테고리:</label>
//                   <ul>
//                     {userInfo.categories.map((category) => (
//                       <li key={category.categoryId}>{category.category}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </form>
//             ) : (
//               <p>회원정보를 불러오는 중입니다...</p>
//             )}
//             <button onClick={handleEditClick}>수정하기</button>
//           </div>
//         );


//       case "deleteMember":
//         return <div>회원탈퇴</div>;

//       default:
//         return <div>유저 마이페이지 화면입니다.</div>;
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <Sidebar onSelect={setSelectedSection} />
//       <div className="content">
//         <h1>마이페이지</h1>
//         {mypageContent()}
//       </div>
//     </div>
//   );
// };

// export default Mypage_User;
