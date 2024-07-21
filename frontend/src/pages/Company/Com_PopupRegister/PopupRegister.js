/*
    수정사항 예정 [24.07.15]
    1. 운영기간 수정 - 시작 캘린터 선택 후 자동으로 종료 캘린더로 넘어가도록 설정
                      종료 캘린더에서 날짜를 설정하면 캘린더가 닫히도록 설정
    2. 운영시간 수정 - 날짜를 모두 드롭다운으로 설정
                    - 운영요일 및 시간 영역 빈 공간을 클릭하면 월요일 체크박스가 활성화됨
    3. 첨부할 것: 네이버 주소찾기, 주변 역, 사진은 파일첨부로 변경
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './PopupRegister.css';

const PopupRegistration = () => {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [operatingStartDate, setOperatingStartDate] = useState(null);
    const [operatingEndDate, setOperatingEndDate] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [roadAddress, setRoadAddress] = useState('');
    const [subway, setSubway] = useState('');
    const [image, setImage] = useState(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [operatingDays, setOperatingDays] = useState({
        월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
        화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
        수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
        목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
        금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
        토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
        일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
    });

    const navigate = useNavigate();

    useEffect(() => {
        const loadNaverMapsScript = () => {
            const script = document.createElement('script');
            script.src = 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID';
            script.async = true;
            script.onload = () => {
                if (window.naver && window.naver.maps && window.naver.maps.Service) {
                    setupAddressSearch();
                } else {
                    console.error('Naver Maps API could not be loaded.');
                }
            };
            document.head.appendChild(script);
        };

        loadNaverMapsScript();
    }, []);

    const setupAddressSearch = () => {
        const geocoder = new window.naver.maps.Service.Geocoder();

        document.getElementById('address-search-btn').addEventListener('click', () => {
            const addressInput = document.getElementById('address').value;
            geocoder.addressSearch(addressInput, (result, status) => {
                if (status === window.naver.maps.Service.Status.OK) {
                    const data = result.result.items[0];
                    setAddress(data.address);
                    setSubway(data.subway || ''); // Handle subway data if available
                } else {
                    alert('주소를 찾을 수 없습니다.');
                }
            });
        });

        document.getElementById('road-address-search-btn').addEventListener('click', () => {
            const roadAddressInput = document.getElementById('road-address').value;
            geocoder.addressSearch(roadAddressInput, (result, status) => {
                if (status === window.naver.maps.Service.Status.OK) {
                    const data = result.result.items[0];
                    setRoadAddress(data.roadAddress);
                } else {
                    alert('도로명 주소를 찾을 수 없습니다.');
                }
            });
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const storeDays = Object.keys(operatingDays)
            .filter(day => operatingDays[day].isSelected)
            .map(day => ({
                day,
                openTime: operatingDays[day].startTime,
                closeTime: operatingDays[day].endTime
            }));

        const formData = new FormData();
        formData.append('title', title);
        formData.append('company', company);
        formData.append('startDate', operatingStartDate ? operatingStartDate.toISOString().split('T')[0] : '');
        formData.append('endDate', operatingEndDate ? operatingEndDate.toISOString().split('T')[0] : '');
        formData.append('telephone', phoneNumber);
        formData.append('address', address);
        formData.append('roadAddress', roadAddress);
        formData.append('subway', subway);
        formData.append('description', description);
        formData.append('category', category);
        formData.append('categories', JSON.stringify([{ category }]));
        formData.append('storeDays', JSON.stringify(storeDays));
        if (image) {
            formData.append('image', image);
        }

        fetch('http://your-backend-url/popupstore/register', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            navigate('/');
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const handleOperatingStartDateChange = (date) => {
        setOperatingStartDate(date);
        setOperatingEndDate(null);
    };

    const handleOperatingEndDateChange = (date) => {
        if (operatingStartDate === null || date < operatingStartDate) {
            setOperatingStartDate(date);
        }
        setOperatingEndDate(date);
    };

    const handleDayChange = (day) => {
        setOperatingDays((prevDays) => ({
            ...prevDays,
            [day]: {
                ...prevDays[day],
                isSelected: !prevDays[day].isSelected,
            },
        }));
    };

    const handleTimeChange = (day, timeType, time) => {
        setOperatingDays((prevDays) => ({
            ...prevDays,
            [day]: {
                ...prevDays[day],
                [timeType]: time,
            },
        }));
    };

    const timeOptions = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            timeOptions.push(formattedTime);
        }
    }

    return (
        <div className="popup-registration">
            <h1>팝업 등록</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    제목:
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                    업체명:
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
                </label>
                <label>
                    운영기간:
                    <div className="date-picker-container">
                        <DatePicker
                            selected={operatingStartDate}
                            onChange={handleOperatingStartDateChange}
                            selectsStart
                            startDate={operatingStartDate}
                            endDate={operatingEndDate}
                            placeholderText="운영 시작일"
                            required
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            withPortal
                            closeOnScroll={true}
                        />
                        {' ~ '}
                        <DatePicker
                            selected={operatingEndDate}
                            onChange={handleOperatingEndDateChange}
                            selectsEnd
                            startDate={operatingStartDate}
                            endDate={operatingEndDate}
                            minDate={operatingStartDate}
                            placeholderText="운영 종료일"
                            required
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            withPortal
                            closeOnScroll={true}
                        />
                    </div>
                </label>
                <label>
                    전화번호:
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </label>
                <label>
                    주소:
                    <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    <button type="button" id="address-search-btn">주소 검색</button>
                </label>
                <label>
                    도로명주소:
                    <input type="text" id="road-address" value={roadAddress} onChange={(e) => setRoadAddress(e.target.value)} required />
                    <button type="button" id="road-address-search-btn">도로명주소 검색</button>
                </label>
                <label>
                    전화번호:
                    <input type="text" value={subway} onChange={(e) => setSubway(e.target.value)} required />
                </label>
                <label>
                    사진:
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </label>
                <label>
                    카테고리:
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </label>
                <label>
                    상세 설명:
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <label>
                    운영요일 및 시간:
                    <div className="operating-days-container" onClick={(e) => e.stopPropagation()}>
                        {Object.keys(operatingDays).map((day) => (
                            <div key={day} className="day-container">
                                <input
                                    type="checkbox"
                                    id={`checkbox-${day}`}
                                    checked={operatingDays[day].isSelected}
                                    onChange={() => handleDayChange(day)}
                                />
                                <span>{day}</span>
                                {operatingDays[day].isSelected && (
                                    <div className="time-picker-container">
                                        <select
                                            value={operatingDays[day].startTime}
                                            onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
                                            required
                                        >
                                            {timeOptions.map((time) => (
                                                <option key={`${day}-start-${time}`} value={time}>
                                                    {time}
                                                </option>
                                            ))}
                                        </select>
                                        {' ~ '}
                                        <select
                                            value={operatingDays[day].endTime}
                                            onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
                                            required
                                        >
                                            {timeOptions.map((time) => (
                                                <option key={`${day}-end-${time}`} value={time}>
                                                    {time}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </label>
                <button type="submit">등록</button>
            </form>
            <div id="map" style={{ width: '100%', height: '400px' }}></div>
        </div>
    );
};

export default PopupRegistration;











// //2024.07.18 운영요일 추가 전 코드
// import './PopupRegister.css';
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const PopupRegistration = () => {
//     const [title, setTitle] = useState('');
//     const [company, setCompany] = useState('');
//     const [operatingStartDate, setOperatingStartDate] = useState(null);
//     const [operatingEndDate, setOperatingEndDate] = useState(null);
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [image, setImage] = useState('');
//     const [category, setCategory] = useState('');
//     const [description, setDescription] = useState('');
//     const [operatingDays, setOperatingDays] = useState({
//         월요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//         화요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//         수요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//         목요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//         금요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//         토요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//         일요일: { startTime: '00:00', endTime: '23:59', isSelected: false },
//     });

//     const navigate = useNavigate();

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log({
//             title,
//             company,
//             operatingStartDate,
//             operatingEndDate,
//             phoneNumber,
//             image,
//             category,
//             description,
//             operatingDays,
//         });
//         navigate('/');
//     };

//     const handleOperatingStartDateChange = (date) => {
//         setOperatingStartDate(date);
//         setOperatingEndDate(null);
//     };

//     const handleOperatingEndDateChange = (date) => {
//         if (operatingStartDate === null || date < operatingStartDate) {
//             setOperatingStartDate(date);
//         }
//         setOperatingEndDate(date);
//     };

//     const handleDayChange = (day) => {
//         setOperatingDays((prevDays) => ({
//             ...prevDays,
//             [day]: {
//                 ...prevDays[day],
//                 isSelected: !prevDays[day].isSelected,
//             },
//         }));
//     };

//     const handleTimeChange = (day, timeType, time) => {
//         setOperatingDays((prevDays) => ({
//             ...prevDays,
//             [day]: {
//                 ...prevDays[day],
//                 [timeType]: time,
//             },
//         }));
//     };

//     const timeOptions = [];
//     for (let hour = 0; hour < 24; hour++) {
//         for (let minute = 0; minute < 60; minute += 30) {
//             const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
//             timeOptions.push(formattedTime);
//         }
//     }

//     return (
//         <div className="popup-registration">
//             <h1>팝업 등록</h1>
//             <form onSubmit={handleSubmit}>
//                 <label>
//                     제목:
//                     <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
//                 </label>
//                 <label>
//                     업체명:
//                     <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required />
//                 </label>
//                 <label>
//                     운영기간:
//                     <div className="date-picker-container">
//                         <DatePicker
//                             selected={operatingStartDate}
//                             onChange={handleOperatingStartDateChange}
//                             selectsStart
//                             startDate={operatingStartDate}
//                             endDate={operatingEndDate}
//                             placeholderText="운영 시작일"
//                             required
//                             showMonthDropdown
//                             showYearDropdown
//                             dropdownMode="select"
//                             withPortal
//                             closeOnScroll={true}
//                         />
//                         {' ~ '}
//                         <DatePicker
//                             selected={operatingEndDate}
//                             onChange={handleOperatingEndDateChange}
//                             selectsEnd
//                             startDate={operatingStartDate}
//                             endDate={operatingEndDate}
//                             minDate={operatingStartDate}
//                             placeholderText="운영 종료일"
//                             required
//                             showMonthDropdown
//                             showYearDropdown
//                             dropdownMode="select"
//                             withPortal
//                             closeOnScroll={true}
//                         />
//                     </div>
//                 </label>
//                 <label>
//                     전화번호:
//                     <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
//                 </label>
//                 <label>
//                     사진 URL:
//                     <input type="url" value={image} onChange={(e) => setImage(e.target.value)} required />
//                 </label>
//                 <label>
//                     카테고리:
//                     <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
//                 </label>
//                 <label>
//                     상세 설명:
//                     <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
//                 </label>
//                 <label>
//                     운영요일 및 시간:
//                     <div className="operating-days-container">
//                         {Object.keys(operatingDays).map((day) => (
//                             <div key={day} className="day-container">
//                                 <input
//                                     type="checkbox"
//                                     id={`checkbox-${day}`}
//                                     checked={operatingDays[day].isSelected}
//                                     onChange={() => handleDayChange(day)}
//                                 />
//                                 <span>{day}</span>
//                                 {operatingDays[day].isSelected && (
//                                     <div className="time-picker-container">
//                                         <select
//                                             value={operatingDays[day].startTime}
//                                             onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)}
//                                             required
//                                         >
//                                             {timeOptions.map((time) => (
//                                                 <option key={`${day}-start-${time}`} value={time}>
//                                                     {time}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         {' ~ '}
//                                         <select
//                                             value={operatingDays[day].endTime}
//                                             onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)}
//                                             required
//                                         >
//                                             {timeOptions.map((time) => (
//                                                 <option key={`${day}-end-${time}`} value={time}>
//                                                     {time}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 </label>
//                 <button type="submit">등록</button>
//             </form>
//         </div>
//     );
// };

// export default PopupRegistration;
