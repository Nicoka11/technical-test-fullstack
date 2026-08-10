import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/logout";

export const SignOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await logout();
      } catch {
        // Logout is best-effort; always return the user to the sign-in page.
      }
      void navigate("/signin", { replace: true });
    };

    void handleSignOut();
  }, [navigate]);

  return <div>Signing out...</div>;
};
