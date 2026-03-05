//Router root, auth guard

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CoursePage from "./pages/CoursePage";
import AssignmentPage from "./pages/AssignmentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route
          path="/course/:courseId/assignment/:assignmentId"
          element={<AssignmentPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}