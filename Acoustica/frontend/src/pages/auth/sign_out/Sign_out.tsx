import { signOut } from "@/services/user_service/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

function SignOut() {
    const {signout}=useAuth()
    const navigate = useNavigate();
        console.log('I am not sure what is happening');
    useEffect(() => {
        async function logout() {
        try {
            await signOut();
        } catch (e) {
            console.error(e);
        } finally {
            
            signout();
            localStorage.removeItem('theme');
            sessionStorage.removeItem('pfp_url');
            sessionStorage.removeItem('pfp_time');

            document.cookie = 'jwt=; path=/; SameSite=Strict; Max-Age=0';

            navigate('/sign-in');
        }
        }

        logout();
    }, [navigate]);

    return <div>Signing out...</div>;
}

export default SignOut;