import React from "react";

import { Typography } from "@mui/material";

import Input from "./components/Input";
import Container from "./components/Container";

import type { InputGroupProps } from './interface';

import "./index.css";

const InputGroup = (props: InputGroupProps) => {
  return (
    <Container standalone={props.standalone}>
      {props.title && (
        <Typography variant="subtitle1" className="text-main pt-4">
          {props.title}
        </Typography>
      )}
      {props.fields.map((field, index) => (
        <Input
          key={index}
          field={field}
          formState={props.formState}
          register={props.register}
          getFieldState={props.getFieldState}
          getValues={props.getValues}
          disabled={props.disabled}
        />
      ))}
    </Container>
  );
};

export default InputGroup;