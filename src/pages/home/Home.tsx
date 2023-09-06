import useLocalStorage from "hooks/useLocalStorage";
import Certification from "pages/certification/Certification";
import { LocalStorageKeys } from 'constants/constants';

const Home = () => {
  const [isLoggedIn] = useLocalStorage(LocalStorageKeys.isLoggedIn, false);

  return isLoggedIn ? <Certification /> : <></>;
};

export default Home;