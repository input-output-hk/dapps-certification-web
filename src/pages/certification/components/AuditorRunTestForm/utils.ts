import { Resolver } from "react-hook-form";

import { FieldType } from "compositions/InputGroup/interface";
import { buildFormResolver } from "compositions/InputGroup/utils";

import type { TestingForm } from "store/slices/testing.slice";

export const RepoField = {
  label: 'GitHub Repository',
  name: 'repoUrl',
  type: FieldType.GitHubRepository,
  required: true,
};

export const CommitField = {
  label: 'Commit Hash',
  name: 'commitHash',
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
  required: false,
};

export const SubjectField = {
  label: 'DApp Subject',
  name: 'subject',
  type: FieldType.Subject,
  required: false,
  textArea: true,
};

export const resolver: Resolver<TestingForm> = buildFormResolver<TestingForm>([
  RepoField, CommitField, NameField, VersionField, SubjectField
]);
