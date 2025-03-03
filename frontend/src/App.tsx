import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LoginPage from "./pages/Auth/LoginPage";
import Dashboard from "./pages/Auth/Dashboard";
import CoursesPage from "./pages/courses/CoursesPage";
import CourseDetailsPage from "./pages/courses/CourseDetailsPage ";
import UserProfilePage from "./pages/Auth/UserProfilePage";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
         <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>  
          <Route path="/allcourses" element={<PrivateRoute><CoursesPage/></PrivateRoute>}/> 
          
          <Route path="/courses/:courseId" element={<PrivateRoute><CourseDetailsPage/></PrivateRoute>}/> 
          <Route path="/users/:userId" element={<PrivateRoute><UserProfilePage/></PrivateRoute>}/> 
         
        </Route>
        </Routes>
      
      </AuthProvider>
    </Router>
  );
}
