import {ReactNode, createContext, useState} from 'react';

const UserContext = createContext({});

function Provider({children}: {children: ReactNode}) {
  //Handle login and password validation
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});

  const valueToShare = {
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
  };

  return (
    <UserContext.Provider value={valueToShare}>{children}</UserContext.Provider>
  );
}

export {Provider};
export default UserContext;
