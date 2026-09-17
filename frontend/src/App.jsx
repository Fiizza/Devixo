import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Profile from "./pages/Profile.jsx";
import Chat from "./pages/Chat.jsx";
import CodeReview from "./pages/CodeReview.jsx";
import CodeGenerator from "./pages/CodeGenerator.jsx";
import BugFixer from "./pages/BugFixer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/code-review" element={<ProtectedRoute><CodeReview /></ProtectedRoute>} />
      <Route path="/generate" element={<ProtectedRoute><CodeGenerator /></ProtectedRoute>} />
      <Route path="/bugfix" element={<ProtectedRoute><BugFixer /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}
