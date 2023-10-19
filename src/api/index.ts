import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'Content-type': 'application/json',
    'Accept': 'application/json',
  },
});

export async function fetch<R>(thunkApi: any, request: AxiosRequestConfig, useSession: boolean = true): Promise<AxiosResponse<R>> {
  const { authToken } = thunkApi.getState().session;
  const headers = useSession && authToken !== null ? { ...request.headers, 'Authorization': `Bearer ${authToken}` } : request.headers;
  return await httpClient({ ...request, headers });
}