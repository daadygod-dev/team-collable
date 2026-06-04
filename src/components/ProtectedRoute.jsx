import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import React from "react";

export default function ProtectedRoute({children}) {

    const { user, loading} = useAuth();

    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-indigo-600" size={30} />
      </div>
    );
  }

  if(!user) {
    return<Navigation to="/signin" replace />;
  }
  return children;

}


