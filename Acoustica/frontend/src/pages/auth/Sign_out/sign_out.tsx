import { signOut } from "@/services/auth";
import { useNavigate } from "react-router-dom";

export async function renderSignOut() {
    const navigate=useNavigate();
    try {
        await signOut();
    } catch (e) {
        
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('theme');
        sessionStorage.removeItem('pfp_url');
        sessionStorage.removeItem('pfp_time'); 
        navigate('/sign-in');
        document.cookie = 'jwt=; path=/; SameSite=Strict; Max-Age=0';
    }
}

