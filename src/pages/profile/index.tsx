import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Container, Grid, Typography, Paper, Button } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

import { useAppDispatch, useAppSelector } from "store/store";
import { updateProfile } from "store/slices/profile.slice";
import { showSnackbar } from "store/slices/snackbar.slice";
import { removeEmptyStringsDeep, removeNullsDeep } from "utils/utils";
import { fields, resolver } from "./utils";

import InputGroup from "compositions/InputGroup";

import type { UserProfile } from "store/slices/profile.slice";

import "./index.css";

const Profile = () => {
  const dispatch = useAppDispatch();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const { profile, loading, success, errorMessage } = useAppSelector(state => state.profile);
  
  const defaultValues = removeNullsDeep(JSON.parse(JSON.stringify(profile)));
  const { register, handleSubmit, reset, clearErrors, formState, getFieldState, getValues } = useForm<UserProfile>({ defaultValues, resolver, mode: 'onBlur' });

  useEffect(() => {
    if (submitted) {
      if (success || errorMessage !== null) {
        setIsEditing(false);
        setSubmitted(false);
        dispatch(showSnackbar({
          message: success ? 'Profile updated successfully' : errorMessage,
          severity: success ? 'success' : 'error',
          position: 'bottom'
        }));
      }
    }
  }, [success, errorMessage, submitted]);

  const onSubmit = (form: UserProfile) => {
    setSubmitted(true);
    dispatch(updateProfile(removeEmptyStringsDeep(JSON.parse(JSON.stringify(form)))));
  }

  const startEditing = () => {
    setIsEditing(true);
  }

  const cancelEditing = () => {
    setIsEditing(false);
    reset(); clearErrors();
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
                fields={fields}
                formState={formState}
                register={register}
                getFieldState={getFieldState}
                getValues={getValues}
                standalone={true}
                disabled={!isEditing||loading}
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
                      startIcon={<SaveIcon />} disabled={loading} type="submit">Save changes</Button>
                    <Button
                      variant="outlined" size="large" color="error" className="normal-case"
                      startIcon={<CancelIcon />} disabled={loading} onClick={cancelEditing}>Cancel</Button>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </form>
    </>
  );
};

export default Profile;