import { Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage'
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import Verify from "./pages/Verify";
import Movie from "./pages/Movie";
import Food from "./pages/Food"
import MovieList from "./pages/MovieList";
import MovieDetail from "./pages/MovieDetail";
import FoodList from "./pages/FoodList";
import FoodDetail from "./pages/FoodDetail";
import SurpriseMe from "./pages/SurpriseMe";
import WatchList from "./pages/WatchList";
import Recipes from "./pages/Recipes";
import Profile from "./pages/Profile";
import ProtectedRoute from './components/ProtectedRoute';
import './App.css'

function App() {
  return (
    <div className="all">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify" element={<Verify />} />

        {/* Publicly accessible pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/movie" element={<Movie />} />
        <Route path="/movielist" element={<MovieList />} />
        <Route path="/moviedetail/:id" element={<MovieDetail />} />
        <Route path="/food" element={<Food />} />
        <Route path="/foodlist" element={<FoodList />} />
        <Route path="/fooddetail/:id" element={<FoodDetail />} />
        <Route path="/surprise" element={<SurpriseMe />} />

        {/* Protected Routes */}
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <Recipes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
