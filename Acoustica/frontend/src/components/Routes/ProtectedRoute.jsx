import React from "react";
import {Navigate} from 'react-router-dom';

function ProtectedRoute({
    children,
    requireOnboarding=true,
    allowedRoles=null
}){
    
    const token=localStorage.getItem('token');
    const user=JSON.parse(localStorage.getItem('user')||{})

    if(!token){
        localStorage.clear();
        return <Navigate to="/sign-in" replace/>;
    }

    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
        return <Navigate to="/unauthorized" replace />;
    }

    if (requireOnboarding && !user.onboarding_done) {
        return <Navigate to="/onboarding" replace />;
    }

    if (!requireOnboarding && user.onboarding_done && window.location.pathname === '/onboarding') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
