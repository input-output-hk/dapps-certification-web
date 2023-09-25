import { createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface CertificationState {
  uuid: string;
  repoUrl: string;
}

// Define the initial state using that type
const initialState: CertificationState = {
  uuid: "",
  repoUrl: ""
};

export const certificationSlice = createSlice({
  name: "certification",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUuid: (state, action) => {
      state.uuid = action.payload;
    },
    clearUuid: (state) => {
      state.uuid = "";
      return state;
    },
    setRepoUrl: (state, action) => {
      state.repoUrl = action.payload;
    },
    clearRepoUrl: (state) => {
      state.repoUrl = "";
      return state;
    },
  },
});

export const { setUuid, clearUuid, setRepoUrl, clearRepoUrl } = certificationSlice.actions;

export default certificationSlice.reducer;