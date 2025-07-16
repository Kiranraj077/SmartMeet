import React from "react";
import { Routes, Route } from "react-router-dom";


import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import MeetDetails from "./pages/MeetDetails";
import MeetCards from "./pages/MeetCards";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      
      <Route
        path="/meeting-cards"
        element={
          <ProtectedRoute>
            <MeetCards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meet-details/:meetId"  
        element={
          <ProtectedRoute>
            <MeetDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;




