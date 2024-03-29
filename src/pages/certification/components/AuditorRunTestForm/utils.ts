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
  required: false,
}

export const ADVANCED_TEST_MODE_FIELDS = [
  {
    label: "Crash Tolerance",
    name: "numCrashTolerance",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "DL Tests",
    name: "numDLTests",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "No Locked Funds",
    name: "numNoLockedFunds",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "No Locked Funds Light",
    name: "numNoLockedFundsLight",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "Standard Property",
    name: "numStandardProperty",
    type: FieldType.NumberOfTests,
    required: false,
  },
  {
    label: "Whitelist",
    name: "numWhiteList",
    type: FieldType.NumberOfTests,
    required: false,
  }
];

export const resolver: Resolver<TestingForm> = buildFormResolver<TestingForm>([
  RepoField, CommitField, NameField, VersionField, SubjectField, NumberOfTestsField, ...ADVANCED_TEST_MODE_FIELDS
]);
