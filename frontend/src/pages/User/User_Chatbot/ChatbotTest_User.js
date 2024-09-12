import React, { useState } from 'react';
import './ChatbotTest_User.css';

const ChatbotTest_User = () => {
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]); // Stores an array of chat messages

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInput.trim() === '') return;

    // Add user's message to the chat
    const userMessage = { type: 'user', text: userInput };
    setChatMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      console.log('Sending message:', userInput); // Log the message being sent

      // Send user message to chatbot via POST request
      const response = await fetch('http://localhost:8080/chatbot/talk', {
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
      console.log('Received response:', data);

      const chatbotMessage = { type: 'chatbot', text: data.message };
      setChatMessages((prevMessages) => [...prevMessages, chatbotMessage]);
      setUserInput('');
    } catch (error) {
      console.error('Error during chatbot communication:', error);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {/* Display all chat messages */}
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`chat-bubble ${message.type}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="질문을 입력해주세요"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e); // Ensure pressing Enter also submits the form
            }
          }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatbotTest_User;
