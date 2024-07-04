

import React from 'react';
import { Link } from "react-router-dom";
import './Home.css';

const Home = () => {
  return (
    <div>
      <h1>메인 홈 화면</h1>

      <div className='hansung'>
        <Link to="/popup.details/hansung">한성대학교</Link>
      </div>

      <div className='cityhall'>
        <Link to="/popup.details/cityhall">서울시청</Link>
      </div>
    </div>
  );
};

export default Home;
