import { LocalStorageKeys } from "constants/constants";

export const clearPersistentStates = () => {
  localStorage.removeItem(LocalStorageKeys.certificationFormData);
  localStorage.removeItem(LocalStorageKeys.certificationUuid);
};