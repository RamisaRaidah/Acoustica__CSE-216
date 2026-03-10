import React from "react";
import {Navigate} from 'react-router-dom';

interface PublicOnlyProps{
    children:React.ReactNode;
}

function PublicOnlyRoute({children}:PublicOnlyProps){
    const token=localStorage.getItem('token');

    if(token){
        //replace is to clear the history stack
        return <Navigate to="/dashboard" replace/>;
    }

    return children;
}

export default PublicOnlyRoute;