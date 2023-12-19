import { Field, FieldType } from "compositions/InputGroup/interface";
import { buildFormResolver } from "compositions/InputGroup/utils";

import type { IUpdateProfile } from "store/slices/profile.slice";
import { Resolver } from "react-hook-form";

export const PROFILE_DETAILS_KEYS = [
  "contactEmail",
  "fullName",
  "role",
  "twitter",
  "linkedin",
  "website",
];

export const userDetailsFields: Field[] = [
  {
    label: 'Company name',
    name: 'companyName',
    type: FieldType.Text,
    required: true,
  },
  {
    label: "Contact email",
    name: "contactEmail",
    type: FieldType.Email,
    required: true,
  },
  {
    label: "Full name",
    name: "fullName",
    type: FieldType.Text,
    required: true,
  },
  {
    label: "Role",
    name: "role",
    type: FieldType.Dropdown,
    options: [
      {
        label: "No Role",
        value: "no-role",
      },
      {
        label: "Support",
        value: "support",
      },
      {
        label: "Admin",
        value: "admin",
      },
    ],
    required: true
  },
  {
    label: "Twitter",
    name: "twitter",
    type: FieldType.TwitterHandle,
  },
  {
    label: "LinkedIn",
    name: "linkedin",
    type: FieldType.LinkedInUrl,
  },
  {
    label: "Website",
    name: "website",
    type: FieldType.WebsiteUrl,
  },
];

export const resolver: Resolver<IUpdateProfile> =
  buildFormResolver<IUpdateProfile>(userDetailsFields);