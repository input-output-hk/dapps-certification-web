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
import type { UserProfile } from "store/slices/profile.slice";

const getFormDefaultValues = (form: TestingForm|null, profile: UserProfile|null, githubAccessCode: string|null, uuid: string|null): TestingForm|undefined => {
  if (form !== null && (githubAccessCode !== null || uuid !== null)) {
    return removeNullsDeep(JSON.parse(JSON.stringify(form)));
  } else if (profile !== null && profile.dapp !== null) {
    const { dapp } = removeNullsDeep(JSON.parse(JSON.stringify(profile)));
    return {
      repoUrl: dapp.owner && dapp.repo ? `https://github.com/${dapp.owner}/${dapp.repo}` : undefined,
      name: dapp.name,
      version: dapp.version,
      subject: dapp.subject,
    };
  } else {
    return undefined;
  }
};

const AuditorRunTestForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const { impersonate, retainId } = useAppSelector((state) => state.profile);

  const [initialized, setInitialized] = useState<boolean>(false);
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
  }

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

  const formHandler = (formData: TestingForm) => {
    dispatch(createTestRun(impersonate ? retainId : null));
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