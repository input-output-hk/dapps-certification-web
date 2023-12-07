import type { UseFormRegister, UseFormGetFieldState, UseFormGetValues, FormState, FieldValues } from "react-hook-form";

export enum FieldType {
  Text,
  Email,
  Subject,
  Hash,
  CommitHash,
  ContractAddress,
  DiscordUrl,
  LinkedInUrl,
  WebsiteUrl,
  ReportUrl,
  LogoUrl,
  TwitterHandle,
  GitHubUserName,
  GitHubRepository,
  Dropdown,
  Object,
  Array,
  NumberOfTests
}

export interface Field {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  tooltip?: string;
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
  getValues: UseFormGetValues<T>;
  standalone?: boolean;
  disabled?: boolean;
}

export interface InputProps<T extends FieldValues = any> {
  field: Field;
  formState: FormState<T>;
  register: UseFormRegister<T>;
  getFieldState: UseFormGetFieldState<T>;
  getValues: UseFormGetValues<T>;
  noGutter?: boolean;
  disabled?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}