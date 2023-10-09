import React from "react";

import { TextField, MenuItem } from "@mui/material";

import { FieldType } from '../interface';

import type { InputProps } from '../interface';

import "../index.css";

const Input = (props: InputProps) => (
  <TextField
    fullWidth
    type="text"
    variant="outlined"
    className={props.noGutter ? undefined : 'mt-4'}
    disabled={props.disabled}
    label={`${props.field.label}${props.field.required ? ' *' : ''}`}
    placeholder={props.field.placeholder}
    select={props.field.type === FieldType.Dropdown}
    multiline={props.field.textArea}
    rows={props.field.textArea ? 4 : undefined}
    error={props.getFieldState(props.field.name, props.formState).error !== undefined}
    helperText={props.getFieldState(props.field.name, props.formState).error?.message}
    { ...props.register(props.field.name, { required: props.field.required }) }
    onBlur={props.onBlur ? props.onBlur : props.register(props.field.name, { required: props.field.required }).onBlur}
  >
    {(props.field.options || []).map(option =>
      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
    )}
  </TextField>
);

export default Input;