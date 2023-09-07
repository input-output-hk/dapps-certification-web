import React, { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";
import { useForm } from "react-hook-form";

import { Container, Box, Typography, Button, TextField } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchPrice } from "../slices/price.slice";
import type { Tier } from "../slices/tiers.slice";

import "../index.css";

const REFRESH_TIME = 30;

interface Props {
  tier: Tier,
  onSubmit: (form: RegistrationForm) => void
}

export interface RegistrationForm {
  company: string;
  email: string;
  address: string;
  city: string;
  country: string;
  twitter: string;
  linkedin: string;
}

export default (props: Props) => {
  const dispatch = useAppDispatch();
  const { price } = useAppSelector((state) => state.price);
  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationForm>();
  const [count, setCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (props.tier !== null) {
      setCount(REFRESH_TIME);
      dispatch(fetchPrice({}));
    }
  }, [props.tier]);

  useEffect(() => {
    if (props.tier !== null && price > 0) {
      setTotal(props.tier.usdPrice * price);
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
    props.tier !== null ? 1000 : null
  );

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
          <form onSubmit={handleSubmit(props.onSubmit)}>
            <TextField
              className="mb-6"
              required fullWidth variant="standard"
              label="Company name" type="text"
              error={errors.company !== undefined}
              helperText={errors.company !== undefined ? 'The field value is invalid' : undefined}
              {...register("company", { required: true })}
            />
            <TextField
              className="mb-6"
              required fullWidth variant="standard"
              label="Email" type="email"
              error={errors.email !== undefined}
              helperText={errors.email !== undefined ? 'The field value is invalid' : undefined}
              {...register("email", { required: true, pattern: /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-_]+\.[A-Za-z]{2,64}$/i })}
            />
            <TextField
              className="mb-6"
              required fullWidth variant="standard"
              label="Address" type="text"
              error={errors.address !== undefined}
              helperText={errors.address !== undefined ? 'The field value is invalid' : undefined}
              {...register("address", { required: true })}
            />
            <TextField
              className="mb-6"
              required fullWidth variant="standard"
              label="City, zip code" type="text"
              error={errors.city !== undefined}
              helperText={errors.city !== undefined ? 'The field value is invalid' : undefined}
              {...register("city", { required: true })}
            />
            <TextField
              className="mb-6"
              required fullWidth variant="standard"
              label="Country" type="text"
              error={errors.country !== undefined}
              helperText={errors.country !== undefined ? 'The field value is invalid' : undefined}
              {...register("country", { required: true })}
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
            <Button
              type="submit" variant="contained" size="large"
              className="mt-8 py-3 px-14 normal-case bg-main"
              disabled={total <= 0}
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