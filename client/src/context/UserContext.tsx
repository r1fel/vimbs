import {ReactNode, createContext, useState} from 'react';

const UserContext = createContext({});

function Provider({children}: {children: ReactNode}) {
  //Handle login and password validation
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const valueToShare = {
    isLoggedIn,
    setIsLoggedIn,
  };

  return (
    <UserContext.Provider value={valueToShare}>{children}</UserContext.Provider>
  );
}

export {Provider};
export default UserContext;
