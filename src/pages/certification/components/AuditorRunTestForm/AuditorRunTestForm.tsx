import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { useConfirm } from "material-ui-confirm";

import { Button, Box } from "@mui/material";

import InputGroup from "compositions/InputGroup";
import Input from "compositions/InputGroup/components/Input";
import RepoAccessStatus from "components/RepoAccessStatus/RepoAccessStatus";

import { useAppDispatch, useAppSelector } from "store/store";
import { updateForm, createTestRun } from "store/slices/testing.slice";
import { clearAccessStatus, verifyRepoAccess, verifyRepoAccessWithAccessToken, fetchClientId } from "store/slices/repositoryAccess.slice";
import { resolver, RepoField, CommitField, NameField, VersionField, SubjectField } from "./utils";
import { removeNullsDeep, removeEmptyStringsDeep } from "utils/utils";

import type { TestingForm } from "store/slices/testing.slice";

const AuditorRunTestForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();

  const [initialized, setInitialized] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const githubAccessCode = searchParams.get('code');

  const { hasAnActiveSubscription } = useAppSelector((state) => state.auth);
  const { showConfirmConnection, accessStatus, verifying, clientId } = useAppSelector((state) => state.repositoryAccess);
  
  const { profile } = useAppSelector((state) => state.profile);
  const { form: formValues, creating, uuid, resetForm } = useAppSelector((state) => state.testing);
  const { dapp } = removeNullsDeep(JSON.parse(JSON.stringify(profile)));
  const defaultValues = formValues ? removeNullsDeep(JSON.parse(JSON.stringify(formValues))) : (dapp ? {
    repoUrl: dapp.owner && dapp.repo ? `https://github.com/${dapp.owner}/${dapp.repo}` : undefined,
    name: dapp.name,
    version: dapp.version,
    subject: dapp.subject,
  } : undefined);
  const form = useForm<TestingForm>({ resolver, defaultValues, mode: 'all' });

  useEffect(() => {
    const subscription = form.watch(value => dispatch(updateForm(removeEmptyStringsDeep(value))));
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  useEffect(() => {
    if (githubAccessCode) {
      const [, , , owner, repo] = form.getValues().repoUrl!.split('/');
      dispatch(verifyRepoAccessWithAccessToken({ code: githubAccessCode, owner, repo }));
      searchParams.delete('code');
      setSearchParams(searchParams);
    }
  }, []);

  useEffect(() => {
    if (form.getValues().repoUrl && !initialized) {
      setInitialized(true);
      checkRepoAccess(form.getValues().repoUrl!);
    }
  }, [form.getValues().repoUrl]);

  useEffect(() => {
    if (showConfirmConnection) confirmConnectModal();
  }, [showConfirmConnection]);

  useEffect(() => {
    if (formValues === null) {
      if (!dapp) {
        form.setValue('name', undefined);
        form.setValue('version', undefined);
        form.setValue('subject', undefined);
        form.setValue('repoUrl', undefined);
      } else {
        form.setValue('name', dapp.name);
        form.setValue('version', dapp.version);
        form.setValue('subject', dapp.subject);
        form.setValue('repoUrl', dapp.owner && dapp.repo ? `https://github.com/${dapp.owner}/${dapp.repo}` : undefined);
      }
      form.setValue('commitHash', undefined);
    }
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
    }
  }, [resetForm]);

  const handleRepoFieldBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.target.value) {
      checkRepoAccess(event.target.value);
    } else {
      dispatch(clearAccessStatus());
    }
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
  }

  const connectToGithub = async () => {
    let updatedClientId = clientId;
    if (!updatedClientId) {
      updatedClientId = (await dispatch(fetchClientId({})) as any).payload;
    }
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${updatedClientId}&scope=repo`);
  };

  const confirmConnectModal = () => {
    if (hasAnActiveSubscription) {
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
    if (hasAnActiveSubscription) {
      confirm({
        title: "Private Repository Access Disclaimer",
        description:
          "Auditors need to obtain consent from their customers and acquire the necessary permissions to fork their private Github repositories in order to test the decentralized application (dApp) using the Plutus Testing Tool, created by Input Output Global, Inc (IOG). The Plutus Testing Tool is available on an “AS IS” and “AS AVAILABLE” basis, without any representation or warranties of any kind. IOG is not responsible for the actions, omissions, or accuracy of any third party for any loss or damage of any sort resulting from the forking of repositories and testing of dApps using the Plutus Testing Tool.",
        confirmationText: "Agree",
      }).then(connectToGithub).catch(err => {});
    }
  };

  const formHandler = (formData: TestingForm) => {
    dispatch(createTestRun({}));
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(formHandler)}>
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
        </div>
      </form>
    </div>
  );
};

export default AuditorRunTestForm;