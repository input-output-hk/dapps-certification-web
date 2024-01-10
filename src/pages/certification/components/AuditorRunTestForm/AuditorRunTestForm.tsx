import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useConfirm } from "material-ui-confirm";

import {
  Button,
  Box,
  Divider,
  AccordionSummary,
  Accordion,
  Typography,
  AccordionDetails,
} from "@mui/material";

import InputGroup from "compositions/InputGroup";
import Input from "compositions/InputGroup/components/Input";
import RepoAccessStatus from "components/RepoAccessStatus/RepoAccessStatus";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useAppDispatch, useAppSelector } from "store/store";
import { updateForm, createTestRun, setIsCustomized } from "store/slices/testing.slice";
import { clearAccessStatus, verifyRepoAccess, verifyRepoAccessWithAccessToken, fetchClientId } from "store/slices/repositoryAccess.slice";
import { resolver, RepoField, CommitField, NameField, VersionField, SubjectField, NumberOfTestsField, ADVANCED_TEST_MODE_FIELDS } from "./utils";
import { removeNullsDeep, removeEmptyStringsDeep } from "utils/utils";
import { CUSTOMIZED_TESTS_COUNT, DEFAULT_TESTS_COUNT } from "pages/certification/Certification.helper";

import type { TestingForm } from "store/slices/testing.slice";
import type { UserProfile } from "store/slices/profile.slice";

import CustomSwitch from "components/CustomSwitch/CustomSwitch";

const getFormDefaultValues = (form: TestingForm|null, profile: UserProfile|null, githubAccessCode: string|null, uuid: string|null): TestingForm|undefined => {
  const defaultValues = {
    numberOfTests: DEFAULT_TESTS_COUNT,
    numCrashTolerance: CUSTOMIZED_TESTS_COUNT,
    numWhiteList: CUSTOMIZED_TESTS_COUNT,
    numDLTests: CUSTOMIZED_TESTS_COUNT,
    numStandardProperty: CUSTOMIZED_TESTS_COUNT,
    numNoLockedFunds: CUSTOMIZED_TESTS_COUNT,
    numNoLockedFundsLight: CUSTOMIZED_TESTS_COUNT,
  };
  if (form !== null && (githubAccessCode !== null || uuid !== null)) {
    return removeNullsDeep(JSON.parse(JSON.stringify(form)));
  } else if (profile !== null && profile.dapp !== null) {
    const { dapp } = removeNullsDeep(JSON.parse(JSON.stringify(profile)));
    return {
      repoUrl: dapp.owner && dapp.repo ? `https://github.com/${dapp.owner}/${dapp.repo}` : undefined,
      name: dapp.name,
      version: dapp.version !== null ? dapp.version : undefined,
      subject: dapp.subject !== null ? dapp.subject : undefined,
      ...defaultValues
    };
  } else {
    return defaultValues;
  }
};

const AuditorRunTestForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const [isCustomizedTestingMode, setIsCustomizedTestingMode] = useState<boolean>(false)
  const [initialized, setInitialized] = useState<boolean>(false);
  const [showAdvancedCountFields, setShowAdvancedCountFields] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [repoUrl, setRepoUrl] = useState<string|null>(null);
  const githubAccessCode = searchParams.get('code');

  const { hasAnActiveSubscription } = useAppSelector((state) => state.auth);
  const { showConfirmConnection, accessStatus, verifying, clientId } = useAppSelector((state) => state.repositoryAccess);
  
  const { profile } = useAppSelector((state) => state.profile);
  const { form: formValues, creating, uuid, resetForm } = useAppSelector((state) => state.testing);
  
  const form = useForm<TestingForm>({
    resolver, mode: 'all',
    defaultValues: getFormDefaultValues(formValues, profile, githubAccessCode, uuid)
  });

  useEffect(() => {
    const subscription = form.watch(value => dispatch(updateForm(removeEmptyStringsDeep(value))));
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);
  
  useEffect(() => {
    if (githubAccessCode) {
      const [, , , owner, repo] = form.getValues().repoUrl!.split('/');
      dispatch(verifyRepoAccessWithAccessToken({ code: githubAccessCode, owner, repo }));
      searchParams.delete('code');
      setSearchParams(searchParams);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (form.getValues().repoUrl && !initialized) {
      setInitialized(true);
      if (!githubAccessCode) checkRepoAccess(form.getValues().repoUrl!);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, form.getValues().repoUrl]);

  useEffect(() => {
    if (showConfirmConnection) confirmConnectModal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmConnection]);

  useEffect(() => {
    if (formValues === null) {
      if (!profile || !profile.dapp) {
        form.setValue('name', undefined);
        form.setValue('version', undefined);
        form.setValue('subject', undefined);
        form.setValue('repoUrl', undefined);
      } else {
        const { dapp } = profile;
        form.setValue('name', dapp.name);
        form.setValue('version', dapp.version);
        form.setValue('subject', dapp.subject);
        form.setValue('repoUrl', dapp.owner && dapp.repo ? `https://github.com/${dapp.owner}/${dapp.repo}` : undefined);
      }
      form.setValue('commitHash', undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues]);

  useEffect(() => {
    if (resetForm === 'dapp') {
      form.setValue('name', undefined);
      form.setValue('version', undefined);
      form.setValue('subject', undefined);
      form.setValue('repoUrl', undefined);
      form.setValue('commitHash', undefined);
    }
    if (resetForm === 'commit') {
      form.setValue('commitHash', undefined);
      if (form.getValues('subject') === null) form.setValue('subject', undefined);
      if (form.getValues('version') === null) form.setValue('version', undefined);
    }
    if (resetForm !== null) {
      setIsCustomizedTestingMode(false);
      form.setValue('numberOfTests', DEFAULT_TESTS_COUNT);
      form.setValue('numCrashTolerance', CUSTOMIZED_TESTS_COUNT);
      form.setValue('numWhiteList', CUSTOMIZED_TESTS_COUNT);
      form.setValue('numDLTests', CUSTOMIZED_TESTS_COUNT);
      form.setValue('numStandardProperty', CUSTOMIZED_TESTS_COUNT);
      form.setValue('numNoLockedFunds', CUSTOMIZED_TESTS_COUNT);
      form.setValue('numNoLockedFundsLight', CUSTOMIZED_TESTS_COUNT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetForm]);

  const handleRepoFieldBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.target.value && event.target.value.length > 0) {
      if (event.target.value !== repoUrl) {
        checkRepoAccess(event.target.value);
      }
    } else {
      dispatch(clearAccessStatus());
    }
    setRepoUrl(event.target.value);
  }

  const checkRepoAccess = (urlValue: string) => {
    if (urlValue) {
      const [, , , owner, repo] = urlValue.split('/');
      if (owner && repo) {
        dispatch(verifyRepoAccess({ owner, repo }));
      } else {
        dispatch(clearAccessStatus());
      }
    }
  };

  const connectToGithub = async () => {
    let updatedClientId = clientId;
    if (!updatedClientId) {
      updatedClientId = (await dispatch(fetchClientId({})) as any).payload;
    }
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${updatedClientId}&scope=repo`);
  };

  const confirmConnectModal = () => {
    if (hasAnActiveSubscription && !uuid) {
      confirm({
        title: "Verify the Repository details",
        description:
          "Unable to find the entered repository. Please go back and correct the Owner/Repository. Or, is this a Private one? If so, please hit Connect to authorize us to access it!",
        confirmationText: "Connect",
        cancellationText: "Go back",
      }).then(privateRepoDisclaimer).catch(err => {});
    }
  };

  const privateRepoDisclaimer = () => {
    confirm({
      title: "Private Repository Access Disclaimer",
      description:
        "Auditors need to obtain consent from their customers and acquire the necessary permissions to fork their private Github repositories in order to test the decentralized application (dApp) using the Plutus Testing Tool, created by Input Output Global, Inc (IOG). The Plutus Testing Tool is available on an “AS IS” and “AS AVAILABLE” basis, without any representation or warranties of any kind. IOG is not responsible for the actions, omissions, or accuracy of any third party for any loss or damage of any sort resulting from the forking of repositories and testing of dApps using the Plutus Testing Tool.",
      confirmationText: "Agree",
    }).then(connectToGithub).catch(err => {});
  };

  const formHandler = async (formData: TestingForm) => {
    await dispatch(setIsCustomized(isCustomizedTestingMode));
    dispatch(createTestRun({isCustomizedTestingMode: isCustomizedTestingMode, isAdvancedCount: !showAdvancedCountFields}));
  };

  const onTestingModeToggle = (isChecked: boolean) => {
    setIsCustomizedTestingMode(isChecked);
    setShowAdvancedCountFields(true);
  };

  const onExpandAdvancedFields = (hide: boolean) => {
    setShowAdvancedCountFields(hide);
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(formHandler)} style={{"marginBottom": "20px"}}>
        <Button
          type="submit" 
          variant="contained" size="large"
          className="button block py-3 px-14 mt-10 mb-20 mx-auto w-[200px]"
          disabled={!form.formState.isValid || creating || uuid !== null || accessStatus !== "accessible" || verifying}
        >
          Test
        </Button>

        <div className={uuid !== null || verifying ? "disabled" : ""}>
          <div className="relative input-wrapper">
            <Input
              noGutter={true}
              field={RepoField}
              formState={form.formState}
              register={form.register}
              getFieldState={form.getFieldState}
              getValues={form.getValues}
              disabled={creating || verifying}
              onBlur={handleRepoFieldBlur}
            />
            {(accessStatus && uuid === null) ? (
              <div className="absolute right-[-32px] top-[22px]">
                <RepoAccessStatus status={accessStatus} classes={showConfirmConnection ? "cursor-pointer" : ""} onClick={() => {showConfirmConnection && confirmConnectModal()}} />
              </div>
            ) : null}
          </div>
          <Box className="mx-[-1rem]">
            <InputGroup
              fields={[CommitField, NameField, VersionField, SubjectField]}
              formState={form.formState}
              register={form.register}
              getFieldState={form.getFieldState}
              getValues={form.getValues}
              disabled={creating}
            />
          </Box>
          <CustomSwitch onToggle={onTestingModeToggle} />
          <div className="relative input-wrapper" hidden={!showAdvancedCountFields}>
            <Input
              noGutter={true}
              field={NumberOfTestsField}
              formState={form.formState}
              register={form.register}
              getFieldState={form.getFieldState}
              getValues={form.getValues}
              disabled={!isCustomizedTestingMode}
            />
          </div>

          {isCustomizedTestingMode ? (
            <Accordion className="shadow-none mt-0" onChange={(_, expanded) => onExpandAdvancedFields(!expanded)}>
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon className="text-slate-highlighted" />
                }
                aria-controls="accordion-content"
                id="accordion-header"
                className="pr-0"
              >
                <Typography className="w-full text-right text-slate-highlighted hover:underline">
                  Advanced
                </Typography>
              </AccordionSummary>

              <AccordionDetails className="p-0">
                <Divider textAlign="left" className="mb-2">
                  Number of Tests
                </Divider>

                <div className="-mx-4">
                  <InputGroup
                    fields={ADVANCED_TEST_MODE_FIELDS}
                    formState={form.formState}
                    register={form.register}
                    getFieldState={form.getFieldState}
                    getValues={form.getValues}
                    disabled={creating}
                  />
                </div>
              </AccordionDetails>
            </Accordion>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default AuditorRunTestForm;
