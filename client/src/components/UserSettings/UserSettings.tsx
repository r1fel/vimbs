import { useState } from 'react';
import { useAtom } from 'jotai';
import './UserSettings.scss';
import { userDataAtom } from '../../context/userAtoms';
import { logger } from '../../util/logger';
import Button from '../Button/Button';

function UserSettings() {
  const [userData, setUserData] = useAtom(userDataAtom);
  logger.log('userdata:', userData);

  const [updatedUserData, setUpdatedUserData] = useState({
    // username: userData[0].username,
    email: userData.email,
  });

  const [profileImgURL, setProfileImgUrl] = useState(
    `https://picsum.photos/seed/${userData.username}/200`,
  );

  logger.log('Userdata in usersettings is:', userData);

  const handleChange = (e: any) => {
    const changedField = e.target.name;
    const newValue = e.target.value;
    logger.log(newValue);
    setUpdatedUserData((currData) => {
      currData[changedField] = newValue;
      return { ...currData };
    });
  };

  const handleCancel = () => {
    setUpdatedUserData({
      username: userData[0].username,
      email: userData[0].email,
    });
  };

  return (
    <div>
      <section>
        <img src={profileImgURL} className="user-settings__img" />
        <input type="file" />
      </section>
      <section>
        <h2>Your Profile Details</h2>
        {/* <div>
          <label htmlFor="user-settings__name">username</label>
          <input
            onChange={handleChange}
            id="user-settings__name"
            className="user-settings__name"
            name="username"
            placeholder={userData[0].username}
            value={updatedUserData.username}
          ></input>
        </div> */}
        <div>
          <label htmlFor="user-settings__email">email</label>
          <input
            onChange={handleChange}
            id="user-settings__email"
            className="user-settings__email"
            name="email"
            placeholder={userData.email}
            value={updatedUserData.email}
          ></input>
        </div>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button>Save</Button>
      </section>
    </div>
  );
}

export default UserSettings;
