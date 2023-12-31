import { Field, FieldType } from "compositions/InputGroup/interface";
import { buildFormResolver } from "compositions/InputGroup/utils";

import type { ReportForm } from "./interface";
import type { UserProfile } from "store/slices/profile.slice";

const internalInformationFields: Field[] = [
  {
    label: 'Certification Level',
    name: 'certificationLevel',
    type: FieldType.Dropdown,
    required: true,
    options: [
      { value: '0', label: 'L0 Audit' },
      { value: '2', label: 'L2 Certification' },
    ],
  },
  {
    label: 'Summary',
    name: 'summary',
    type: FieldType.Text,
    required: true,
    textArea: true,
  },
  {
    label: 'Disclaimer',
    name: 'disclaimer',
    type: FieldType.Text,
    required: true,
    textArea: true,
  },
  {
    label: 'Subject',
    name: 'subject',
    type: FieldType.Subject,
    required: true,
    textArea: true,
  },
];

const internalAuditorFields: Field[] = [
  {
    label: 'Name',
    name: 'name',
    type: FieldType.Text,
    required: true,
  },
  {
    label: 'Logo',
    name: 'logo',
    type: FieldType.LogoUrl,
  },
];

const internalAuditorSocialFields: Field[] = [
  {
    label: 'Email',
    name: 'contact',
    type: FieldType.Email,
    required: true,
  },
  {
    label: 'Website',
    name: 'website',
    type: FieldType.WebsiteUrl,
    required: true,
  },
  {
    label: 'GitHub',
    name: 'github',
    type: FieldType.GitHubUserName,
  },
  {
    label: 'Discord',
    name: 'discord',
    type: FieldType.DiscordUrl,
  },
  {
    label: 'Twitter',
    name: 'twitter',
    type: FieldType.TwitterHandle,
  },
];

const internalReportField: Field = {
  label: 'Report URL',
  name: 'value',
  type: FieldType.ReportUrl,
  required: true,
};

const internalScriptFields: Field[] = [
  {
    label: 'Script Hash',
    name: 'scriptHash',
    type: FieldType.Hash,
    required: true,
  },
  {
    label: 'Contract Address',
    name: 'contractAddress',
    type: FieldType.ContractAddress,
    required: true,
  },
];

const internalScriptContractFields: Field[] = [
  {
    label: 'Era',
    name: 'era',
    type: FieldType.Text,
  },
  {
    label: 'Compiler Version',
    name: 'compilerVersion',
    type: FieldType.Text,
  },
  {
    label: 'Optimizer Version',
    name: 'optimizerVersion',
    type: FieldType.Text,
  },
  {
    label: 'Repository URL',
    name: 'repository',
    type: FieldType.GitHubRepository,
  },
  {
    label: 'Compiler',
    name: 'compiler',
    type: FieldType.Text,
  },
  {
    label: 'Optimizer',
    name: 'optimizer',
    type: FieldType.Text,
  },
  {
    label: 'Programming Language',
    name: 'progLang',
    type: FieldType.Text,
  },
];

export const getResolver= (isReviewCertification?: boolean, hasSubject?: boolean) => buildFormResolver<ReportForm>([
  ...getInformationFields(isReviewCertification, hasSubject),
  {
    name: 'certificateIssuer',
    type: FieldType.Object,
    fields: [
      ...internalAuditorFields,
      {
        name: 'social',
        type: FieldType.Object,
        fields: internalAuditorSocialFields,
      },
    ],
  },
  !isReviewCertification ? {
    name: 'report',
    type: FieldType.Array,
    fields: [internalReportField],
  } : null,
  {
    name: 'scripts',
    type: FieldType.Array,
    fields: [
      ...internalScriptFields,
      {
        name: 'smartContractInfo',
        type: FieldType.Object,
        fields: internalScriptContractFields,
      },
    ],
  },
].filter(field => field !== null) as Field[]);

export const getDefaultValues = (profile: UserProfile | null): ReportForm => ({
  certificationLevel: '',
  summary: '',
  disclaimer: '',
  subject: '',
  certificateIssuer: {
    name: profile?.fullName || '',
    social: {
      contact: profile?.contactEmail || '',
      website: profile?.website || '',
      twitter: profile?.twitter || undefined
    }
  },
  report: [{ value: '' }],
  scripts: [{
    scriptHash: '',
    contractAddress: '',
    smartContractInfo: {}
  }]
});

export const getInformationFields = (isReviewCertification: boolean = false, profileHasSubject: boolean = false) =>
  !isReviewCertification ? internalInformationFields : internalInformationFields.filter(
    field => (profileHasSubject ? field.name !== 'subject' : true) && field.name !== 'certificationLevel'
  )

export const auditorFields = [
  ...internalAuditorFields.map(f => ({ ...f, name: `certificateIssuer.${f.name}` })),
  ...internalAuditorSocialFields.map(f => ({ ...f, name: `certificateIssuer.social.${f.name}` }))
];

export const getReportField = (index: number) => ({ ...internalReportField, name: `report.${index}.value` });

export const getScriptFields = (index: number) => internalScriptFields.map(f => ({ ...f, name: `scripts.${index}.${f.name}` }));

export const getScriptContractFields = (index: number) => internalScriptContractFields.map(f => ({ ...f, name: `scripts.${index}.smartContractInfo.${f.name}` }));