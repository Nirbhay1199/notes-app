import { useState } from 'react';
import { AuthLayout } from '@/components/AuthLayout';
import { SignUp } from '@/components/SignUp';
import { SignIn } from '@/components/SignIn';
import { Dashboard } from '@/components/Dashboard';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'signin' | 'signup';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} />;
  }
  return (
    <AuthLayout>
      {authMode === 'signin' ? (
        <SignIn 
          onSwitchToSignUp={() => setAuthMode('signup')}
        />
      ) : (
        <SignUp 
          onSwitchToSignIn={() => setAuthMode('signin')}
        />
      )}
    </AuthLayout>
  );
};

export default Index;
