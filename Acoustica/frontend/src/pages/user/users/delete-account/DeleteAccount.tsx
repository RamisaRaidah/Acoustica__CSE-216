import { deleteMyAccount } from "@/services/user_service/users";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DeleteAccount(){
    const navigate=useNavigate();
    const [error, setError] = useState('');
    const [called, setCalled] = useState(false);
    useEffect(()=>{
        if(called) return;
        setCalled(true);

        const loadDelete=async()=>{
            try {
                await deleteMyAccount();
                navigate('/sign-out');
            } catch (e) {
                console.error(e);
                setError('Failed to delete account. Please try again');
            }
        }
        loadDelete();
    },[navigate]);
    
    if (error) return <div className="error">{error}</div>;

    return <div className="loading">Deleting Account...</div>;
}
export default DeleteAccount;