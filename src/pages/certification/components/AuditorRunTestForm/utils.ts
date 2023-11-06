import { Resolver } from "react-hook-form";

import { FieldType } from "compositions/InputGroup/interface";
import { buildFormResolver } from "compositions/InputGroup/utils";

import type { IAuditorRunTestFormFields } from "./auditorRunTestForm.interface";

export const RepoField = {
  label: 'GitHub Repository',
  name: 'repoURL',
  type: FieldType.GitHubRepository,
  required: true,
};

export const CommitField = {
  label: 'Commit Hash',
  name: 'commit',
  type: FieldType.CommitHash,
  required: true,
};

export const NameField = {
  label: 'DApp Name',
  name: 'name',
  type: FieldType.Text,
  required: true,
};

export const VersionField = {
  label: 'DApp Version',
  name: 'version',
  type: FieldType.Text,
  required: true,
};

export const SubjectField = {
  label: 'DApp Subject',
  name: 'subject',
  type: FieldType.Subject,
  required: true,
  textArea: true,
};

export const resolver: Resolver<IAuditorRunTestFormFields> = buildFormResolver<IAuditorRunTestFormFields>([
  RepoField, CommitField, NameField, VersionField, SubjectField
]);
