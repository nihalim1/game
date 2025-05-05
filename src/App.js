import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './Components/Home';
import StudentAuthForm from './Components/StudentAuthForm';
import StudentDashboard from './Components/StudentDashboard';
import TeacherDashboard from './Components/TeacherDashboard';
import MatchingGame from './Components/MatchingGame';
import CodingGame from './Components/CodingGame';
import Progress from './Components/Progress';
import BridgeGame from './Components/BridgeGame';
import MathPuzzle from './Components/MathPuzzle';
import GameHistory from './Components/GameHistory';
import Login from './Components/Login';
import Signup from './Components/Signup';
import ForgotPassword from './Components/ForgotPassword';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './Components/Notification';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import MazeGame from './Components/MazeGame';
import './App.css';

const NotificationManager = () => {
  const location = useLocation();

  const hideNotificationPaths = [
    '/game',
    '/coding-game',
    '/bridge-game',
    '/math-puzzle',
    '/mazeGmae'
  ];  

  const shouldHideNotification = hideNotificationPaths.some(path =>
    location.pathname.startsWith(path)
  );

  return !shouldHideNotification ? <Notification /> : null;
};

function PrivateRoute({ children }) {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  const [isInCodingGame, setIsInCodingGame] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* หน้าแรก */}
              <Route path="/" element={<Home />} />

              {/* สำหรับนักเรียน */}
              <Route path="/student-auth" element={<StudentAuthForm />} />
              <Route
                path="/student-dashboard"
                element={
                  <PrivateRoute>
                    <StudentDashboard />
                  </PrivateRoute>
                }
              />

              {/* สำหรับครู */}
              <Route
                path="/teacher-dashboard"
                element={
                  <PrivateRoute>
                    <TeacherDashboard />
                  </PrivateRoute>
                }
              />

              {/* ระบบเกมและกิจกรรม */}
              <Route path="/game" element={<MatchingGame />} />
              <Route
                path="/coding-game"
                element={
                  <React.Fragment>
                    <CodingGame
                      onMount={() => setIsInCodingGame(true)}
                      onUnmount={() => setIsInCodingGame(false)}
                    />
                  </React.Fragment>
                }
              />
              <Route path="/progress" element={<Progress />} />
              <Route path="/bridge-game" element={<BridgeGame />} />
              <Route path="/math-puzzle" element={<MathPuzzle />} />
              <Route path="/game-history" element={<GameHistory />} />
              <Route path="/MazeGame" element={<MazeGame />} />
              {/* Auth Pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ถ้าไม่พบหน้าใดๆ ให้ Redirect ไปหน้าแรก */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* แสดง Notification ถ้าไม่อยู่ในหน้าที่ซ่อนไว้ */}
            <NotificationManager />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
