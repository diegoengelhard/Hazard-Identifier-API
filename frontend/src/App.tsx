import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';

import './App.css'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default App
