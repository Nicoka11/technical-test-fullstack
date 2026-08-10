import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Apply } from "./pages/Apply";
import { CreateJob } from "./pages/CreateJob";
import { JobDetail } from "./pages/JobDetail";
import { JobList } from "./pages/JobList";
import { SignIn } from "./pages/SignIn";
import { SignOut } from "./pages/SignOut";
import { SignUp } from "./pages/SignUp";

import "./index.css";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signout" element={<SignOut />} />

        <Route path="/" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/jobs/:jobId/apply" element={<Apply />} />
        <Route path="/jobs/new" element={<CreateJob />} />
      </Routes>
    </BrowserRouter>
  );
};
