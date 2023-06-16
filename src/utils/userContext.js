// UserContext.js
import { createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const user = useContext(UserContext);
  return user;
};

export default UserContext;
