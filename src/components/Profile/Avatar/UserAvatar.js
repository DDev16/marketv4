import React, { useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import UserContext from '../../../utils/userContext.js';

const UserAvatar = () => {
  const user = useContext(UserContext);

  if (!user) {
    // Handle the case where user is null or undefined
    return null; // or return a fallback UI if needed
  }

  return (
    <Tooltip title={user.displayName}>
      <Avatar alt={user.displayName} src={user.photoURL} />
    </Tooltip>
  );
};

export default UserAvatar;
