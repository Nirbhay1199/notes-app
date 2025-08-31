import { ReactNode } from 'react';
import fluidBg from '@/assets/fluid-bg.png';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      {/* HD Header - Centered on mobile, positioned on desktop */}
      <div className="flex justify-center lg:absolute lg:top-3 lg:left-3 z-20 flex items-center pt-6 lg:pt-0">
        <img src="/hd_icon.png" alt="HD Icon" className="w-8 h-8 mr-3" />
        <span className="text-xl font-semibold text-gray-900">HD</span>
      </div>

      {/* Main content - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white lg:ml-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {children}
        </div>
      </div>

      {/* Right side - Fluid background - Hidden on mobile, shown on larger screens */}
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