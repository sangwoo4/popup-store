import React, { useState } from "react";
import './Search_User.css';

const Search_User = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    console.log('검색어:', query);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/search/popup?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다...');
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data);

      setResults(data.data || []);
    } catch (error) {
      setError(error.message || '데이터를 가져오지 못했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <h1>팝업스토어 검색</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="검색어를 입력하세요..."
          className="search-input"
        />
        <button type="submit" className="search-button">검색</button>
      </form>

      {loading && <p>로딩 중...</p>}
      {error && <p>오류: {error}</p>}

      <div className="search-results">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="result-item">
              <h2>{result.title}</h2>
              <div className="result-categories">
                {result.categories.map((categoryObj, catIndex) => (
                  <span key={catIndex} className="result-category">
                    {categoryObj.category}
                  </span>
                ))}
              </div>
              {result.popupImages && result.popupImages.length > 0 && (
                <img
                  src={`http://localhost:8080/${result.popupImages[0].imageUrl}`}
                  alt={result.title}
                  className="result-image"
                />
              )}
              </div>
            ))
          ) : (
            !loading && <p>검색 결과가 없습니다.</p>
          )}
      </div>
    </div>
  );
};

export default Search_User;
