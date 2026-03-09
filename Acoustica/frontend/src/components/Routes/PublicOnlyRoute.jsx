import React from "react";
import {Navigate} from 'react-router-dom';

function PublicOnlyRoute({children}){
    const token=localStorage.getItem('token');

    if(token){
        //replace is to clear the history stack
        return <Navigate to="/dashboard" replace/>;
    }

    return children;
}

export default PublicOnlyRoute;