import React from "react";
import {Navigate} from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";

interface PublicOnlyProps{
    children:React.ReactNode;
}

function PublicOnlyRoute({children}:PublicOnlyProps){
    const {user}=useAuth();

    if(user && user.token && user.onboarding_done){
        //replace is to clear the history stack
        return <Navigate to="/dashboard" replace/>;
    }else if (user && user.token && !user.onboarding_done){
        return <Navigate to="/onboarding" replace/>;
    }

    return children;
}

export default PublicOnlyRoute;