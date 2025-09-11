"use client";

import React, { useState } from "react";
import { NeoButton } from "@/components/ui/neo-button";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/contexts/auth-context";

export interface NeoHeaderProps {
  title?: string;
}

const NeoHeader: React.FC<NeoHeaderProps> = ({ title = "Bea." }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="w-full border-b-2 border-black bg-main shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left part - Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold ">
              <a href="/" className="text-white">
                {title}
              </a>
            </h1>
          </div>

          {/* Center part - Feedback text */}
          <div className="hidden md:flex items-center text-main-foreground font-medium">
            Feedback is welcome 😊
          </div>

          {/* Right part - Button */}
          <div className="flex items-center">
            {user ? (
              <NeoButton
                className="bg-white rounded-lg border-2"
                onClick={handleSignOut}
              >
                Logout
              </NeoButton>
            ) : (
              <NeoButton
                className="bg-white rounded-lg border-2"
                onClick={handleAuthClick}
              >
                Login / Signup
              </NeoButton>
            )}
          </div>
        </div>
      </header>

      {!user && (
        <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseModal} />
      )}
    </>
  );
};

export { NeoHeader };
