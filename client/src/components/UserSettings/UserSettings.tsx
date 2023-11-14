import {useState} from 'react';
import {useAtom} from 'jotai';
import './UserSettings.scss';
import {userDataAtom} from '../../context/userAtoms';
import {logger} from '../../util/logger';

function UserSettings() {
  const [userData, setUserData] = useAtom(userDataAtom);

  const [profileImgURL, setProfileImgUrl] = useState(
    `https://picsum.photos/seed/${userName}/200`,
  );

  logger.log('Userdata in usersettings is:', userData);

  return (
    <div>
      <img src={profileImgURL} className="user-profile__img" />
      <input type="file" />
    </div>
  );
}

export default UserSettings;
