import logo from './logo.svg';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from "./components/HomePage";
import LoadMoviePage from "./components/MoviePage";
import LoadCartPage from "./components/CartPage";
import Movie from "./components/Movie";
import LoadReviewPage from "./components/ReviewPage";
import AppBar from "./components/AppBar";
import LoginPage from "./LoginPage";


function App() {
  return (
      <div className="App">
        <header className="App-header">
          <BrowserRouter>
              <AppBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cart" element={<LoadCartPage />} />
                <Route path="/movie/:id" element={<LoadMoviePage />} />
                <Route path="/movie/:id/reviews" element={<LoadReviewPage />} />
            </Routes>
          </BrowserRouter>
        </header>
      </div>
  );
}

/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
          <HomePage></HomePage>
      </header>
    </div>
  );
}
*/

export default App;
