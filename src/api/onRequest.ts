import { AxiosError, AxiosRequestConfig } from "axios";
import { LocalStorageKeys } from "constants/constants";

// Add a request interceptor
export function onRequest(config: AxiosRequestConfig) {
  const address: any = localStorage.getItem(LocalStorageKeys.authToken);
  const TokenAuth = 'Bearer ' + address;

  if (address) {
    config.headers = {
      ...config.headers,
      Authorization: TokenAuth,
    };
  }

  return config;
}

export function onRequestError(error: AxiosError) {
  if (localStorage.getItem(LocalStorageKeys.isLoggedIn) !== "true") {
    localStorage.clear();
    window.location.reload();
  }
  return Promise.reject(error);
}


export function onRepoAccessRequest(config: AxiosRequestConfig) {
  const accessToken: any = localStorage.getItem(LocalStorageKeys.accessToken)
  const TokenAuth = accessToken;

  if (accessToken && accessToken !== 'undefined') {
    config.headers = {
      ...config.headers,
      Authorization: TokenAuth,
    };
  }

  return config;
}