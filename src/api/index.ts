import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import { RootState } from "store/rootReducer";

import { sessionMock } from "../utils/wallet-constant";

interface FetchOptions {
  useSession?: boolean;
  useAccessToken?: boolean;
  useTextPlainClient?: boolean;
}

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

const jsonHeaders = {
  'Content-type': 'application/json',
  'Accept': 'application/json',
};

const textPlainHeaders = {
  'Content-type': 'text/plain;charset=utf-8',
  'Accept': 'text/plain;charset=utf-8',
};

const getContentTypeHeader = (options: FetchOptions) => {
  if (options.useTextPlainClient) return textPlainHeaders;
  return jsonHeaders;
}

const getAuthorizationHeader = (state: RootState, options: FetchOptions) => {
  let { authToken, accessToken } = state.session;

  if (document.cookie.indexOf('loadMockWallet=') !== -1) {
    authToken = sessionMock.authToken
    accessToken = sessionMock.accessToken
  }
  if (options.useSession && authToken !== null) return { 'Authorization': `Bearer ${authToken}` };
  if (options.useAccessToken && accessToken !== null) return { 'Authorization': accessToken };
  return {};
}

export async function fetch<R>(thunkApi: any, request: AxiosRequestConfig, options: FetchOptions = { useSession: true }): Promise<AxiosResponse<R>> {
  return await httpClient({
    ...request,
    headers: {
      ...getContentTypeHeader(options),
      ...getAuthorizationHeader(thunkApi.getState(), options)
    } as AxiosRequestHeaders
  });
}