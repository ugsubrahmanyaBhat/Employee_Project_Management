import {createContext,useEffect,useState,useContext} from 'react';
import { supabase } from '../supabase/SupabaseClient';
const AuthContext=createContext();

export const AuthContextProvider=({children})=>{
const [session,setSession]=useState(undefined);
//signup
const SignupNewuser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.log(error);
        return { success: false, error: error.message }; // Return error as a string
    }
    return { success: true, data };
};

useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

//signin

const signin = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.log(error);
            return { success: false, error: error.message || "Login failed" }; // 
        }

        setSession(data.session || data);
        return { success: true, data };
    } catch (error) {
        console.log(error);
        return { success: false, error: error.message || "An unexpected error occurred" }; 
    }
};

//signout
const signout=async()=>{
    const {error}= await supabase.auth.signOut();
    if(error){
        console.log(error);
    }
};
return(
    <AuthContext.Provider value={{session,SignupNewuser,signin,signout}}>
        {children}
    </AuthContext.Provider> 
)
}

export const useAuth = () => useContext(AuthContext);