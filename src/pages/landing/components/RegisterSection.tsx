import React, { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import { useForm } from "react-hook-form";

import { Container, Box, Typography, Button, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchPrice } from "store/slices/price.slice";
import { showSnackbar } from "store/slices/snackbar.slice";
import type { Tier } from "store/slices/tiers.slice";
import type { RegisterForm } from "store/slices/register.slice";

import "../index.css";

const REFRESH_TIME = 30;

interface Props {
  tier: Tier,
  onSubmit: (form: RegisterForm) => void
}

const RegisterSection = (props: Props) => {
  const dispatch = useAppDispatch();
  const { price } = useAppSelector((state) => state.price);
  const { processing, errorMessage } = useAppSelector((state) => state.register);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();
  const [count, setCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (errorMessage !== null) {
      dispatch(showSnackbar({
        message: errorMessage,
        severity: 'error'
      }));
    }
  }, [errorMessage]);

  useEffect(() => {
    if (props.tier !== null) {
      setCount(REFRESH_TIME);
      dispatch(fetchPrice({}));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.tier]);

  useEffect(() => {
    if (props.tier !== null && price > 0) {
      setTotal(props.tier.usdPrice / price);
    } else {
      setTotal(0);
    }
  }, [props.tier, price]);

  useInterval(
    () => {
      if (count <= 0) {
        setCount(REFRESH_TIME);
        dispatch(fetchPrice({}));
      } else {
        setCount(count - 1);
      }
    },
    props.tier !== null && !processing ? 1000 : null
  );

  const onSubmit = (form: RegisterForm) => {
    props.onSubmit({
      ...form,
      linkedin: form.linkedin!.length > 0 ? form.linkedin : undefined,
      twitter: form.twitter!.length > 0 ? form.twitter : undefined,
      website: form.website!.length > 0 ? form.website : undefined,
    })
  }

  return (
    <>
      <Box className="white-box pt-24 text-center">
        <Typography variant="h4" className="title-text mb-2">
          Auditor profile
        </Typography>
        <Typography variant="subtitle1" className="subtitle-text mb-16">
          Please complete your user profile information
        </Typography>
        <Container maxWidth="sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="Company name *" type="text"
              error={errors.companyName !== undefined}
              helperText={errors.companyName !== undefined ? 'The field value is invalid' : undefined}
              {...register("companyName", { required: true })}
            />
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="Contact email *" type="email"
              error={errors.contactEmail !== undefined}
              helperText={errors.contactEmail !== undefined ? 'The field value is invalid' : undefined}
              {...register("contactEmail", { required: true, pattern: /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-_]+\.[A-Za-z]{2,64}$/i })}
            />
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="Company Email *" type="email"
              error={errors.email !== undefined}
              helperText={errors.email !== undefined ? 'The field value is invalid' : undefined}
              {...register("email", { required: true, pattern: /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-_]+\.[A-Za-z]{2,64}$/i })}
            />
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="Full name *" type="text"
              error={errors.fullName !== undefined}
              helperText={errors.fullName !== undefined ? 'The field value is invalid' : undefined}
              {...register("fullName", { required: true })}
            />
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="Twitter" type="text"
              error={errors.twitter !== undefined}
              helperText={errors.twitter !== undefined ? 'The field value is invalid' : undefined}
              {...register("twitter", { pattern: /^[A-Za-z0-9_]{1,15}$/i })}
            />
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="LinkedIn" type="text"
              error={errors.linkedin !== undefined}
              helperText={errors.linkedin !== undefined ? 'The field value is invalid' : undefined}
              {...register("linkedin", { pattern: /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile|company)\/([a-zA-Z0-9_-]+)$/i })}
            />
            <TextField
              className="mb-6"
              fullWidth variant="standard"
              label="Website" type="text"
              error={errors.website !== undefined}
              helperText={errors.website !== undefined ? 'The field value is invalid' : undefined}
              {...register("website", { pattern: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,255}\.[a-z]{2,6}(\b([-a-zA-Z0-9@:%_\+.~#()?&\/\/=]*))?$/i })}
            />
            <Button
              type="submit" variant="contained" size="large"
              className="mt-8 py-3 px-14 font-medium button-contained-main"
              disabled={total <= 0 || processing}
            >
              Pay (₳{total.toFixed(2)})
            </Button>
            <Typography variant="body1" className="price-text">
              Price will refresh in {count} second{count === 1 ? '' : 's'}
            </Typography>
          </form>
        </Container>
      </Box>
    </>
  );
}

export default RegisterSection;