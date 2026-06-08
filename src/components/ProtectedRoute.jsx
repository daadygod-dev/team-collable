import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import React from "react";
import { Navigate } from "react-router-dom";

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
    return<Navigate to="/signin" replace />;
  }
  return children;

}


