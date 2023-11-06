import {
  ReactNode,
  createContext,
  useState,
  useContext,
  Dispatch,
  SetStateAction,
} from 'react';
import {logger} from '../util/logger';

interface UserContextType {
  userData: any;
  isLoggedIn: boolean;
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserData: Dispatch<SetStateAction<any>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function Provider({children}: {children: ReactNode}) {
  //Handle login and password validation
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  logger.log('isLoggedIn:', isLoggedIn, 'userData: ', userData);
  const valuesToShare = {
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
  };

  return (
    <UserContext.Provider value={valuesToShare}>
      {children}
    </UserContext.Provider>
  );
}

export {Provider};

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}

export default UserContext;
