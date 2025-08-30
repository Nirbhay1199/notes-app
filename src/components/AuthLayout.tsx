import { ReactNode } from 'react';
import fluidBg from '@/assets/fluid-bg.png';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex relative">
      {/* HD Header - Absolute positioned in top-left corner */}
      <div className="absolute top-3 left-3 z-20 flex items-center">
        <img src="/hd_icon.png" alt="HD Icon" className="w-8 h-8 mr-3" />
        <span className="text-xl font-semibold text-gray-900">HD</span>
      </div>

      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white ml-20">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right side - Fluid background  */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative mt-1 mb-1 mr-5"
        style={{
          backgroundImage: `url(${fluidBg})`,
          backgroundSize: 'contain',
          backgroundPosition: 'right',
          backgroundRepeat: 'no-repeat',
        }}
      >
      </div>
    </div>
  );
};