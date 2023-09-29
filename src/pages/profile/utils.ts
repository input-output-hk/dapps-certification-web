import { Field, FieldType } from "compositions/InputGroup/interface";
import { buildFormResolver } from "compositions/InputGroup/utils";

import type { UserProfile } from "store/slices/profile.slice";
import { Resolver } from "react-hook-form";

export const profileFields: Field[] = [
  {
    label: 'Company name',
    name: 'companyName',
    type: FieldType.Text,
    required: true,
  },
  {
    label: 'Contact email',
    name: 'contactEmail',
    type: FieldType.Email,
    required: true,
  },
  {
    label: 'Full name',
    name: 'fullName',
    type: FieldType.Text,
    required: true,
  },
  {
    label: 'Twitter',
    name: 'twitter',
    type: FieldType.TwitterHandle,
  },
  {
    label: 'LinkedIn',
    name: 'linkedin',
    type: FieldType.LinkedInUrl,
  },
  {
    label: 'Website',
    name: 'website',
    type: FieldType.WebsiteUrl,
  },
];

const internalDAppFields: Field[] = [
  {
    label: 'Name',
    name: 'name',
    type: FieldType.Text,
    required: true,
  },
  {
    label: 'Owner',
    name: 'owner',
    type: FieldType.Text,
    required: true,
  },
  {
    label: 'Repository',
    name: 'repo',
    type: FieldType.Text,
    required: true,
  },
  {
    label: 'Version',
    name: 'version',
    type: FieldType.Text,
    required: true,
  },
];

export const dAppFields = internalDAppFields.map(f => ({ ...f, name: `dapp.${f.name}` }));

export const resolver: Resolver<UserProfile> = buildFormResolver<UserProfile>([
  ...profileFields,
  {
    name: 'dapp',
    type: FieldType.Object,
    fields: internalDAppFields,
  },
]);
