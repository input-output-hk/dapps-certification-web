import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import { Container, Grid, Paper, Typography, Button, Alert, AlertTitle, Snackbar } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

import { useAppDispatch, useAppSelector } from "store/store";
import { updateProfile, updateProfileLocally } from "store/slices/profile.slice";
import { verify, verifyWithAccessToken, fetchClientId } from "store/slices/repositoryAccess.slice";
import { removeEmptyStringsDeep, removeNullsDeep } from "utils/utils";
import { profileFields, dAppFields, resolver } from "./utils";

import InputGroup from "compositions/InputGroup";
import VerificationModal from "./components/VerificationModal";

import type { UserProfile } from "store/slices/profile.slice";

import "./index.css";

const Profile = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paramReaded, setParamReaded] = useState<boolean>(false);
  const githubAccessCode = searchParams.get('code');

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { profile, needsToValidateRepository, isProfileUpdatedLocally, loading: profileLoading, success, errorMessage } = useAppSelector(state => state.profile);
  
  const defaultValues = removeNullsDeep(JSON.parse(JSON.stringify(profile)));
  const { verified, fetched, loading: verifying, clientId, githubToken } = useAppSelector(state => state.repositoryAccess);
  const { register, handleSubmit, reset, clearErrors, formState, getFieldState } = useForm<UserProfile>({ defaultValues, resolver });

  useEffect(() => {
    dispatch(fetchClientId({}));
  }, []);

  useEffect(() => {
    if (isProfileUpdatedLocally && submitted) {
      if (!needsToValidateRepository) {
        dispatch(updateProfile(profile!));
      } else {
        runVerification();
      }
    }
  }, [isProfileUpdatedLocally, needsToValidateRepository, submitted]);

  useEffect(() => {
    if (verified) {
      dispatch(updateProfile({
        ...profile!,
        dapp: {
          ...profile!.dapp!,
          githubToken: githubToken!
        }
      }));
    }
  }, [verified]);

  useEffect(() => {
    if (submitted) {
      if (success || errorMessage !== null) {
        setIsEditing(false);
        setShowSnackbar(true);
        setSubmitted(false);
      }
    }
  }, [success, errorMessage, submitted]);

  useEffect(() => { if (fetched && submitted) setShowModal(true) }, [fetched, submitted]);

  useEffect(() => {
    if (githubAccessCode !== null && !paramReaded) {
      setParamReaded(true);
      searchParams.delete('code');
      setSearchParams(searchParams);
      if (profile && profile.dapp && profile.dapp.owner && profile.dapp.repo) {
        dispatch(verifyWithAccessToken({ owner: profile.dapp.owner, repo: profile.dapp.repo, code: githubAccessCode }));
      }
    }
  }, [githubAccessCode]);

  const onSubmit = (form: UserProfile) => {
    const shouldReRun = isProfileUpdatedLocally && needsToValidateRepository && submitted;
    setSubmitted(true);
    dispatch(updateProfileLocally(removeEmptyStringsDeep(JSON.parse(JSON.stringify(form)))));
    if (shouldReRun) runVerification();
  }

  const startEditing = () => {
    setIsEditing(true);
  }

  const cancelEditing = () => {
    setIsEditing(false);
    reset(); clearErrors();
  }

  const runVerification = () => {
    if (profile && profile.dapp && profile.dapp.owner && profile.dapp.repo) {
      dispatch(verify({ owner: profile.dapp.owner, repo: profile.dapp.repo }));
    }
  }

  const connectGitHub = () => {
    setShowModal(false);
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`);
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container className="py-4" maxWidth="xl">
          <Typography variant="h5" className="font-medium text-main mb-6">
            User Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item md={12} lg={6}>
              <InputGroup
                title="User Information"
                fields={profileFields}
                formState={formState}
                register={register}
                getFieldState={getFieldState}
                standalone={true}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item md={12} lg={6}>
              {needsToValidateRepository && (
                <Alert
                  variant="outlined" severity="warning" className="mb-4"
                  action={
                    <Button
                      variant="outlined" color="warning" className="normal-case w-[120px]"
                      disabled={verifying} onClick={runVerification}>Verify now</Button>
                  }
                >
                  <AlertTitle>Repository verification pending</AlertTitle>
                  The repository verification is needed to save the DAPP changes
                </Alert>
              )}
              <InputGroup
                title="DAPP Information"
                fields={dAppFields}
                formState={formState}
                register={register}
                getFieldState={getFieldState}
                standalone={true}
                disabled={!isEditing}
              />
              <Paper elevation={0} className="shadow rounded-none p-4 flex flex-row-reverse justify-between items-end mt-4">
                {!isEditing && (
                  <Button
                    variant="outlined" size="large" className="button-outlined-highlighted"
                    startIcon={<EditIcon />} onClick={startEditing}>Edit profile</Button>
                )}
                {isEditing && (
                  <>
                    <Button
                      variant="outlined" size="large" color="success" className="normal-case"
                      startIcon={<SaveIcon />} disabled={profileLoading} type="submit">Save changes</Button>
                    <Button
                      variant="outlined" size="large" color="error" className="normal-case"
                      startIcon={<CancelIcon />} disabled={profileLoading} onClick={cancelEditing}>Cancel</Button>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </form>

      <VerificationModal
        show={verifying||showModal}
        fetched={fetched}
        verified={verified}
        loading={verifying}
        onClose={() => setShowModal(false)}
        onConnect={connectGitHub}
      />

      <Snackbar
        open={showSnackbar}
        autoHideDuration={5000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={success ? 'success' : 'error'} variant="filled"
          onClose={() => setShowSnackbar(false)}
        >
          {success ? 'Profile updated successfully' : errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Profile;