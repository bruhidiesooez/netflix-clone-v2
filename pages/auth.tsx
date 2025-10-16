import Input from "@/components/Input";  
import axios from "axios";
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';


const Auth = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState(''); 

    const [variant, setVariant] = useState('login'); 

    const toggleVariant = useCallback(() => {
        setVariant((currentVariant) => currentVariant === 'login' ? 'register' : 'login');
    } , []);

       const login = useCallback(async () => {
      try {
        const callbackUrl = router.query.callbackUrl as string || '/profiles';
        console.log('🚀 Login attempt with callback URL:', callbackUrl);
        
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        
        console.log('🔍 SignIn result:', result);
        
        if (result?.ok) {
          console.log('✅ Login successful, redirecting to:', callbackUrl);
          // Wait a moment for session to be established
          setTimeout(() => {
            window.location.href = callbackUrl;
          }, 1000);
        } else {
          console.error('❌ Login failed:', result?.error);
        }
      } catch (error) {
        console.log('❌ Login error:', error);
      }
    }, [email, password, router.query.callbackUrl]);

    const register = useCallback(async () => {
      try {
        await axios.post('/api/register', {
          email,
          name,
          password
        });

        login();
      } catch (error) {
        console.log(error);
      }
    }, [email, name, password, login]);

    return (
      <div className="relative h-screen w-full bg-[url('/images/hero.jpg')] bg-no-repeat bg-center bg-fixed bg-cover">
        <div className="bg-black w-full h-full lg:bg-opacity-50">
            <nav className="px-12 py-5">
                <img src="/images/logo.png" alt="logo"  className="h-12"/>
            </nav>
            <div className="flex justify-center">
                <div className="bg-black bg-opacity-70 px-16 py-16 self-center mt-2 lg:w-2/5 lg:max-w-md rounded-md w-full">
                <h2 className="text-white text-4xl mb-8 font-semibold">
                    {variant === 'login' ? 'Sign In' : 'Register'}
                </h2>
                <div className="flex flex-col gap-4">
                    {variant === 'register' && (
                    <Input
                      label="Username"
                      onChange={(ev: any) => setName(ev.target.value)}
                      id="name"
                      value={name}
                    />
                    )}
                    <Input
                      label="Email"
                      onChange={(ev: any) => setEmail(ev.target.value)}
                      id="email"
                      type="email"
                      value={email}
                    />
                    <Input
                      label="Password"
                      onChange={(ev: any) => setPassword(ev.target.value)}
                      id="password"
                      type="password"
                      value={password}
                    />
                </div>
                <button onClick={variant === 'login' ? login : register} className="bg-red-600 py-3 text-white rounded-md w-full mt-10 hover:bg-red-700 transition">
                    {variant === 'login' ? 'Login' : 'Sign up'}
                </button>
                <div className="flex flex-row items-center gap-4 mt-8 justify-center">
                  <div
                  onClick={() => {
                    const callbackUrl = router.query.callbackUrl as string || '/profiles';
                    signIn('google', { callbackUrl });
                  }}
                  className="
                    w-10
                    h-10
                    bg-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                    hover:opacity-80
                    transition
                  "
                  >
                    <FcGoogle size={30}/>
                  </div>
                  <div
                  onClick={() => {
                    const callbackUrl = router.query.callbackUrl as string || '/profiles';
                    signIn('github', { callbackUrl });
                  }}
                  className="
                    w-10
                    h-10
                    bg-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                    hover:opacity-80
                    transition
                  "
                  >
                    <FaGithub size={30}/>
                  </div>
                </div>
                <p className="text-neutral-500 mt-12">
                    {variant === 'login' ? 'First time using Netflix?' : 'Already have an account?'}
                    <span onClick={toggleVariant} className="text-white ml-1 hover:underline cursor-pointer">
                       {variant === 'login' ? 'Create an account' : 'Login'}
                    </span>
                </p>
                </div>
            </div>
        </div>
      </div>  
    );
}

export default Auth;