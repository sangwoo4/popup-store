/*
    수정사항 예정 [24.07.15]
    1. 운영기간 수정 - 시작 캘린터 선택 후 자동으로 종료 캘린더로 넘어가도록 설정
                      종료 캘린더에서 날짜를 설정하면 캘린더가 닫히도록 설정
    2. 운영시간 수정 - 날짜를 모두 드롭다운으로 설정
    3. 첨부할 것: 네이버 주소찾기, 주변 역, 사진은 파일첨부로 변경
*/


import './PopupRegister.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';

const PopupRegistration = () => {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [operatingStartDate, setOperatingStartDate] = useState(null);
    const [operatingStartTime, setOperatingStartTime] = useState('00:00');
    const [operatingEndDate, setOperatingEndDate] = useState(null);
    const [operatingEndTime, setOperatingEndTime] = useState('23:59');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({
            title,
            company,
            operatingStartDate,
            operatingStartTime,
            operatingEndDate,
            operatingEndTime,
            phoneNumber,
            image,
            category,
            description
        });
        navigate('/');
    };

    const handleOperatingStartDateChange = (date) => {
        setOperatingStartDate(date);
        // 시작일을 변경하면 종료일도 초기화
        setOperatingEndDate(null);
    };

    const handleOperatingEndDateChange = (date) => {
        // 종료일이 선택될 때 시작일보다 이전이거나 같으면 시작일을 종료일로 설정하지 않도록 수정
        if (operatingStartDate === null || date < operatingStartDate) {
            setOperatingStartDate(date);
        }
        setOperatingEndDate(date);
    };
    

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
                    운영시간:
                    <div className="time-picker-container">
                        <TimePicker
                            onChange={(time) => setOperatingStartTime(time)}
                            value={operatingStartTime}
                            required
                            clearIcon={null} // 시간 선택기 클리어 아이콘 숨기기
                        />
                        {' ~ '}
                        <TimePicker
                            onChange={(time) => setOperatingEndTime(time)}
                            value={operatingEndTime}
                            required
                            clearIcon={null} // 시간 선택기 클리어 아이콘 숨기기
                        />
                    </div>
                </label>
                <label>
                    전화번호:
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                </label>
                <label>
                    사진 URL:
                    <input type="url" value={image} onChange={(e) => setImage(e.target.value)} required />
                </label>
                <label>
                    카테고리:
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </label>
                <label>
                    상세 설명:
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <button type="submit">등록</button>
            </form>
        </div>
    );
};

export default PopupRegistration;
