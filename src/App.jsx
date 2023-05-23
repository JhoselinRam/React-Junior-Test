// import { goodResponse } from './mocks/api-response';
import './index.css';
import { useEffect, useRef, useState } from 'react';

function App () {
  const [response, setResponce] = useState({ Search: [], totalResults: '0', Response: 'True' });
  const textInput = useRef(null);
  const [badResponse, setBadResponse] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef(null);

  useEffect(() => {
    if (page === 1) return;

    appendNewData();
  }, [page]);

  useEffect(() => {
    setLoading(false);
  }, [response]);

  useEffect(() => {
    if (!loading) return;

    const maxPages = Math.ceil(response.totalResults / 10);
    if (page < maxPages) {
      setPage(current => current + 1);
    }
  }, [loading]);

  async function onSearch () {
    const query = textInput.current.value;
    const url = `http://www.omdbapi.com/?apikey=31f1f93e&s=${query}`;

    const dataFetch = await fetch(url);
    const data = await dataFetch.json();
    if (data.Response === 'False') {
      setBadResponse(true);
      return;
    }

    setBadResponse(false);
    setResponce(data);
    setPage(1);
  }

  function onEnter (e) {
    if (e.key === 'Enter' || e.key === 'Intro') { onSearch(); }
  }

  function setFooterObserver (element) {
    if (element == null) return;
    if (observer.current !== null) { observer.current.disconnect(); }
    // eslint-disable-next-line no-undef
    observer.current = new IntersectionObserver(loadData);
    observer.current.observe(element);
  }

  function loadData (entries) {
    const footer = entries[0];
    if (!footer.isIntersecting) return;
    if (response.Search.length === 0) return;
    if (loading) return;

    const maxPages = Math.ceil(response.totalResults / 10);
    console.log(page);
    if (page < maxPages) {
      setLoading(true);
    }
  }

  async function appendNewData () {
    const query = textInput.current.value;
    const url = `http://www.omdbapi.com/?apikey=31f1f93e&s=${query}&page=${page}`;

    const dataFetch = await fetch(url);
    const data = await dataFetch.json();

    setResponce(currentData => {
      return {
        ...currentData,
        Search: [...currentData.Search, ...data.Search]
      };
    });
  }

  return (
    <>
      <nav>
        <h1>
          Buscador de películas
        </h1>
        <section>
          <input type='text' name='buscar' id='buscar' placeholder='batman' ref={textInput} onKeyDown={onEnter} />
          <button role='button' onClick={onSearch}>Buscar</button>
        </section>
      </nav>
      <main>
        {badResponse && <h2>No se encontraron películas</h2>}
        {!badResponse &&
          <ul>
            {response.Search.map(movie => {
              return (
                <li key={movie.imdbID}>
                  <div>
                    <p className='movie-title'>{movie.Title}</p>
                    <p className='movie-year'>{movie.Year}</p>
                  </div>
                  <img src={movie.Poster} alt={movie.Title} />
                </li>
              );
            })}
          </ul>}
      </main>
      <footer ref={setFooterObserver}>
        {loading &&
          <div className='loading'>
            <div className='spiner' />
            Cargando ...
          </div>}
      </footer>
    </>
  );
}

export default App;
