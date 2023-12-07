import { Resolver } from "react-hook-form";

import { FieldType } from "compositions/InputGroup/interface";
import { buildFormResolver } from "compositions/InputGroup/utils";

import type { TestingForm } from "store/slices/testing.slice";

export const RepoField = {
  label: 'GitHub Repository',
  tooltip: 'URL entered should be in the format - https://github.com/<username>/<repository> (with an optional trailing backslash).',
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

export const NumberOfTestsField = {
  label: 'Number of Tests',
  name: 'numberOfTests',
  type: FieldType.NumberOfTests,
  required: false
}

export const DEFAULT_TESTS_COUNT = 100;

export const ADVANCED_TEST_MODE_FIELDS = [
  {
    label: "No Locked Funds",
    name: "numberOfLockedFunds",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "No Locked Funds Light",
    name: "numberOfLockedFundsLight",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "Crash Tolerance",
    name: "crashTolerance",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "Whitelist",
    name: "whitelist",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "DL Tests",
    name: "dlTests",
    type: FieldType.NumberOfTests,
    required: false,
  },
];

export const resolver: Resolver<TestingForm> = buildFormResolver<TestingForm>([
  RepoField, CommitField, NameField, VersionField, SubjectField, NumberOfTestsField, ...ADVANCED_TEST_MODE_FIELDS
]);
