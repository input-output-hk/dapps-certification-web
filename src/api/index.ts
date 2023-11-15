import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import { RootState } from "store/rootReducer";

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
  const { authToken, accessToken } = state.session;
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