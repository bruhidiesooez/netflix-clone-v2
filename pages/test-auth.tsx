import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';

export default function TestAuth() {
    const [result, setResult] = useState<any>(null);
    const [session, setSession] = useState<any>(null);

    const testLogin = async () => {
        const testEmail = 'test68@gmail.com';
        const testPassword = 'sdfaafd';
        
        console.log('🧪 Testing direct login with:', { email: testEmail, password: testPassword });
        
        try {
            const result = await signIn('credentials', {
                email: testEmail,
                password: testPassword,
                redirect: false,
            });
            
            console.log('🧪 Test result:', result);
            setResult(result);
            
            // Check session after login
            const session = await getSession();
            console.log('🧪 Session after login:', session);
            setSession(session);
            
        } catch (error) {
            console.error('🧪 Test error:', error);
            setResult({ error: String(error) });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-2xl mb-4">Authentication Test</h1>
            
            <button 
                onClick={testLogin}
                className="bg-red-600 px-4 py-2 rounded mb-4"
            >
                Test Login
            </button>
            
            <div className="mb-4">
                <h2 className="text-lg mb-2">SignIn Result:</h2>
                <pre className="bg-gray-800 p-2 rounded">
                    {JSON.stringify(result, null, 2)}
                </pre>
            </div>
            
            <div>
                <h2 className="text-lg mb-2">Session:</h2>
                <pre className="bg-gray-800 p-2 rounded">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>
        </div>
    );
}