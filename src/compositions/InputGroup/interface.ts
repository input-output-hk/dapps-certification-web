import type { UseFormRegister, UseFormGetFieldState, FormState, FieldValues } from "react-hook-form";

export enum FieldType {
  Text,
  Email,
  Subject,
  Hash,
  CommitHash,
  ContractAddress,
  DiscordUrl,
  WebsiteUrl,
  ReportUrl,
  LogoUrl,
  TwitterHandle,
  GitHubUserName,
  GitHubRepository,
  Dropdown,
  Object,
  Array,
}

export interface Field {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  textArea?: boolean;
  options?: {
    label: string;
    value: string;
  }[];
  fields?: Field[];
}

export interface InputGroupProps<T extends FieldValues = any> {
  title?: string;
  fields: Field[];
  formState: FormState<T>;
  register: UseFormRegister<T>;
  getFieldState: UseFormGetFieldState<T>;
  standalone?: boolean;
}

export interface InputProps<T extends FieldValues = any> {
  field: Field;
  formState: FormState<T>;
  register: UseFormRegister<T>;
  getFieldState: UseFormGetFieldState<T>;
  noGutter?: boolean;
}