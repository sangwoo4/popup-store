import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './ChatbotTest_User.css';
import API_BASE_URL from '../../../URL_API';

const ChatbotTest_User = () => {
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const chatWindowRef = useRef(null);
  const chatbotButtonRef = useRef(null);
  const inputContainerRef = useRef(null); // 인풋 컨테이너 참조 추가

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInput.trim() === '') return;

    const userMessage = { type: 'user', text: userInput };
    setChatMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/talk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from chatbot');
      }

      const data = await response.json();
      const chatbotMessage = { type: 'chatbot', text: data.message };
      setChatMessages((prevMessages) => [...prevMessages, chatbotMessage]);
      setUserInput('');
    } catch (error) {
      console.error('Error during chatbot communication:', error);
    }
  };

  const handleFAQClick = async (text) => {
    const userMessage = { type: 'user', text };
    setChatMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/talk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from chatbot');
      }

      const data = await response.json();
      const chatbotMessage = { type: 'chatbot', text: data.message };
      setChatMessages((prevMessages) => [...prevMessages, chatbotMessage]);
    } catch (error) {
      console.error('Error during chatbot communication:', error);
    }
  };

  useEffect(() => {
    setIsChatOpen(false);
  }, [location]);

  useEffect(() => {
    if (isChatOpen) {
      const greetingMessage = { type: 'chatbot', text: '안녕하세요! 무엇을 도와드릴까요?' };
      setChatMessages((prevMessages) => [...prevMessages, greetingMessage]);
    } else {
      setChatMessages([]);
    }
  }, [isChatOpen]);

  // 자동 스크롤 기능
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // 외부 클릭 시 대화창 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target) &&
        chatbotButtonRef.current && !chatbotButtonRef.current.contains(event.target) &&
        inputContainerRef.current && !inputContainerRef.current.contains(event.target)) { // 인풋 컨테이너 참조 추가
        setIsChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="chatbot-container">
      {isChatOpen && (
        <div className="chat-window" ref={chatWindowRef}>
          <div className="faq-container">
            <div className="faq-title">FAQ</div>
            <button onClick={() => handleFAQClick('예약 내역 조회')}>예약 내역 조회</button>
            <button onClick={() => handleFAQClick('회원 탈퇴')}>회원 탈퇴</button>
            <button onClick={() => handleFAQClick('예약 내역 취소')}>예약 내역 취소</button>
          </div>

          {chatMessages.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.type}`}>
              {message.text}
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`input-container ${isChatOpen ? 'open' : 'closed'}`}
        ref={inputContainerRef} // 인풋 컨테이너 참조 추가
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="질문을 입력해주세요"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e);
            }
          }}
        />
        <button type="submit">Send</button>
      </form>

      <button
        className="chatbot-button"
        onClick={() => setIsChatOpen((prev) => !prev)}
        ref={chatbotButtonRef} // 참조 추가
      >
        💬
      </button>
    </div>
  );
};

export default ChatbotTest_User;













// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom'; // useLocation 임포트
// import './ChatbotTest_User.css';
// import API_BASE_URL from '../../../URL_API';

// const ChatbotTest_User = () => {
//   const [userInput, setUserInput] = useState('');
//   const [chatMessages, setChatMessages] = useState([]);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const location = useLocation(); // 현재 위치 가져오기

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (userInput.trim() === '') return;

//     const userMessage = { type: 'user', text: userInput };
//     setChatMessages((prevMessages) => [...prevMessages, userMessage]);

//     try {
//       const response = await fetch(`${API_BASE_URL}/chatbot/talk`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: userInput }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to get a response from chatbot');
//       }

//       const data = await response.json();
//       const chatbotMessage = { type: 'chatbot', text: data.message };
//       setChatMessages((prevMessages) => [...prevMessages, chatbotMessage]);
//       setUserInput('');
//     } catch (error) {
//       console.error('Error during chatbot communication:', error);
//     }
//   };

//   useEffect(() => {
//     // 페이지 이동 시 채팅창 닫기
//     setIsChatOpen(false);
//   }, [location]); // location이 변경될 때마다 실행

//   return (
//     <div className="chatbot-container">
//       {isChatOpen && (
//         <div className="chat-window">
//           {chatMessages.map((message, index) => (
//             <div key={index} className={`chat-bubble ${message.type}`}>
//               {message.text}
//             </div>
//           ))}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className={`input-container ${isChatOpen ? 'open' : 'closed'}`}>
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="질문을 입력해주세요"
//           onKeyPress={(e) => {
//             if (e.key === 'Enter') {
//               handleSubmit(e);
//             }
//           }}
//         />
//         <button type="submit">Send</button>
//       </form>

//       <button
//         className="chatbot-button"
//         onClick={() => setIsChatOpen((prev) => !prev)} // 버튼 클릭 시 채팅창 열기/닫기
//       >
//         💬
//       </button>
//     </div>
//   );
// };

// export default ChatbotTest_User;
