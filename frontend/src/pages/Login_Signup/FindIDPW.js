/*
    수정사항 예정 [24.07.15]
    1. 헤더와 푸터 사이에 들어가게 수정
    2. 모든 코드 재수정
*/


import React, { useEffect, useState } from 'react';
import './FindIDPW.css';

const FindIDPW = () => {
    const [selectedTab, setSelectedTab] = useState('findEmail');

    useEffect(() => { //url변경시키기
        const url = selectedTab === 'findEmail' ? '/findIDPW/ID' : '/findIDPW/PW';
        window.history.replaceState({}, '', url);
    }, [selectedTab]);

    const handleFindButtonClick = () => {
        // 나중에 찾기 버튼 누르면 백엔드와 연결코드 삽입할 곳
        console.log("찾기 버튼누름", selectedTab);
    };

    return (
        <>
            <h2 className='find'> 이메일, 비밀번호 찾기 페이지 </h2>
            <div className="findBox">
                <div>
                    <button
                        className={selectedTab === 'findEmail' ? "findID-Button selected" : "findID-Button"}
                        onClick={() => setSelectedTab('findEmail')}
                    >
                        이메일찾기
                    </button>
                    <button
                        className={selectedTab === 'password' ? "findPW-Button selected" : "findPW-Button"}
                        onClick={() => setSelectedTab('password')}
                    >
                        비밀번호찾기
                    </button>
                </div>


                {/* 이름, 생년월일, 전화번호 입력 설정 */}
                {selectedTab === 'findEmail' && ( //이메일 찾기
                    <>
                        <div className='findID_Text'>
                            회원의 성명, 생년월일, 전화번호를 입력해주세요.
                        </div>

                        <div className="findID_InputTitle_Name">
                            이름
                        </div>
                        <div className="findID_Input_Name">
                            <input
                                className="input"
                                maxLength="10"
                                type="text"
                                placeholder="이름 입력"
                            />
                        </div>

                        <div className="findID_InputTitle_Birth">
                            생년월일
                        </div>
                        <div className="findID_Input_Birth">
                            <input
                                className="input"
                                type="date"
                            />
                        </div>

                        <div className="findID_InputTitle_PhoneNum">
                            핸드폰 번호
                        </div>
                        <div className="findID_Input_PhoneNum">
                            <input
                                className="input"
                                type="text"
                                placeholder="01012345678"
                            />
                        </div>
                    </>
                )}

                {selectedTab === 'password' && ( //패스워드 찾기
                    <>
                        <div className='findPW_Text'>
                            회원의 성명, 생년월일, 이메일, 전화번호를 입력해주세요.
                        </div>

                        <div className="findPW_InputTitle_Name">
                            이름
                        </div>
                        <div className="findPW_Input_Name">
                            <input
                                className="input"
                                maxLength="10"
                                type="text"
                                placeholder="이름 입력"
                            />
                        </div>

                        <div className="findPW_InputTitle_Birth">
                            생년월일
                        </div>
                        <div className="findPW_Input_Birth">
                            <input
                                className="input"
                                type="date"
                            />
                        </div>

                        <div className="findPW_InputTitle_Email">
                            이메일 주소
                        </div>
                        <div className="findPW_Input_Email">
                            <input
                                className="input"
                                type="email"
                                placeholder="이메일 입력"
                            />
                        </div>

                        <div className="findPW_InputTitle_PhoneNum">
                            핸드폰 번호
                        </div>
                        <div className="findPW_Input_PhoneNum">
                            <input
                                className="input"
                                type="text"
                                placeholder="01012345678"
                            />
                        </div>
                    </>
                )}

                <button className="findID-Button_Submit" onClick={handleFindButtonClick}>
                    {selectedTab === 'findEmail' ? '이메일찾기' : '비밀번호찾기'}
                </button>
            </div>
        </>
    );
}

export default FindIDPW;
