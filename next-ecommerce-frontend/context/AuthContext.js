import { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Magic } from 'magic-sdk';
import { MAGIC_PUBLIC_KEY } from '../utils/urls';

export const AuthContext = createContext();
let magic;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  /**
   * Adds email to user
   * login with magic
   * @param {string} email
   */
  const loginUser = async (email) => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      setUser({ email });
      router.push('/');
    } catch (error) {
      if (error instanceof RPCError) {
        switch (err.code) {
          case RPCErrorCode.MagicLinkFailedVerification:
          case RPCErrorCode.MagicLinkExpired:
          case RPCErrorCode.MagicLinkRateLimited:
          case RPCErrorCode.UserAlreadyLoggedIn:
            console.log('logged in dude');
            // Handle errors accordingly :)
            break;
        }
      }
    }
  };

  /**
   * sets the user to null
   * logout with magic
   */
  const logoutUser = async () => {
    try {
      await magic.user.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * persist the user after reload
   */
  const checkUserLoggedIn = async () => {
    try {
      const isLoggedIn = await magic.user.isLoggedIn();

      if (isLoggedIn) {
        const { email } = await magic.user.getMetadata();
        setUser({ email });
      }
    } catch (error) {
      console.error('error', error.message);
    }
  };

  const getToken = async () => {
    try {
      const token = await magic.user.getIdToken();
      return token;
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    magic = new Magic(MAGIC_PUBLIC_KEY);
    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
