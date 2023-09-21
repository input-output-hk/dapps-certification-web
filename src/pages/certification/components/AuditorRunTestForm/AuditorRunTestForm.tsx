import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "store/store";
import { useForm } from "hooks/useForm";
import { fetchData, postData } from "api/api";

import { Button } from "@mui/material";

import { LocalStorageKeys } from "constants/constants";
import TextArea from "components/TextArea/TextArea";
import Toast from "components/Toast/Toast";
import { Form } from "compositions/Form/Form";
import { Input } from "compositions/Form/components/Input";
import RepoAccessStatus from "components/RepoAccessStatus/RepoAccessStatus";
import { getErrorMessage } from "utils/utils";

import { clearRepoUrl, setRepoUrl } from "../../slices/certification.slice";
import { auditorRunTestFormSchema } from "./auditorRunTestForm.schema";
import { IAuditorRunTestFormFields } from "./auditorRunTestForm.interface";
import {
  clearAccessStatus,
  getUserAccessToken,
  verifyRepoAccess,
} from "store/slices/repositoryAccess.slice";
import { useConfirm } from "material-ui-confirm";
import { useSearchParams } from "react-router-dom";
import useLocalStorage from "hooks/useLocalStorage";

interface IAuditorRunTestForm {
  disable: boolean;
  initialData?: IAuditorRunTestFormFields | null;
  clearForm?: boolean;
  testAgain?: boolean;
  forceValidate?: boolean;
  onSubmit: (data: { runId: string; commitHash: string; repo: string }) => any;
  onError: () => void;
  loadingRunId?: (flag: boolean) => void
}

const AuditorRunTestForm: React.FC<IAuditorRunTestForm> = ({
  disable,
  initialData = null,
  clearForm = false,
  testAgain = false,
  forceValidate = false,
  onSubmit,
  onError,
  loadingRunId
}) => {

  const dispatch = useAppDispatch();
  const form: any = useForm({
    schema: auditorRunTestFormSchema,
    mode: "all",
  });

  const checkRepoAccess = (urlValue: string) => {
    if (urlValue) {
      const [, , , username, repoName] = urlValue.split("/");
      if (username && repoName) {
        dispatch(verifyRepoAccess({ owner: username, repo: repoName }));
      } else {
        dispatch(clearAccessStatus())
      }
    }
  }

  useEffect(() => { 
    if (forceValidate) {
      const formData = form.getValues()
      checkRepoAccess(formData.repoURL)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceValidate])

  const { repoUrl } = useAppSelector((state) => state.certification);
  const { profile } = useAppSelector((state) => state.auth);
  const { showConfirmConnection, accessStatus } = useAppSelector((state) => state.repoAccess);
  const confirm = useConfirm();
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState("");

  const [, setLsFormData] = useLocalStorage(LocalStorageKeys.certificationFormData, "");
  const [, setLsUuid] = useLocalStorage(LocalStorageKeys.certificationUuid, "");
    

  const [searchParams, setSearchParams] = useSearchParams();
  const githubAccessCode = searchParams.get("code");

  const connectToGithub = async () => {
    try {
      // fetch CLIENT_ID from api
      const clientId = (await fetchData.get("/github/client-id").catch(error => { throw new Error(error) }))
        .data as string;
      clientId && window.location.assign(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`
      );
    } catch (errorObj: any) {
      let errorMsg = "Unable to connect to the repository. ";
      if (errorObj?.response?.data) {
        errorMsg +=
          errorObj.response.statusText + " - " + errorObj.response.data + ". ";
      }
      errorMsg += "Please recheck and try again.";
      setShowError(errorMsg);
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        setShowError("");
      }, 5000);
    }
  };

  const confirmConnectModal = () => {
    setTimeout(() => {
      confirm({
        title: "Verify the Repository details",
        description:
          "Unable to find the entered repository. Please go back and correct the Owner/Repository. Or, is this a Private one? If so, please hit Connect to authorize us to access it!",
        confirmationText: "Connect",
        cancellationText: "Go back",
      }).then(privateRepoDisclaimer).catch(err => {});
    }, 0);
  };

  const privateRepoDisclaimer = () => {
    confirm({
      title: "Private Repository Access Disclaimer",
      description:
        "Auditors need to obtain consent from their customers and acquire the necessary permissions to fork their private Github repositories in order to test the decentralized application (dApp) using the Plutus Testing Tool, created by Input Output Global, Inc (IOG). The Plutus Testing Tool is available on an “AS IS” and “AS AVAILABLE” basis, without any representation or warranties of any kind. IOG is not responsible for the actions, omissions, or accuracy of any third party for any loss or damage of any sort resulting from the forking of repositories and testing of dApps using the Plutus Testing Tool.",
      confirmationText: "Agree",
    }).then(connectToGithub).catch(err => {});
  };

  const handleError = (errorObj: any) => {
    setShowError(getErrorMessage(errorObj));
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      setShowError("");
      // TBD - blur out of input fields
    }, 5000); // hide after 5 seconds
    onError(); // Error callback
  };

  const formHandler = (formData: IAuditorRunTestFormFields) => {
    if (!formData || !formData.repoURL) {
      // do nothing
      return;
    }

    const [, , , username, repoName, , commitHash] =
      formData.repoURL.split("/");
    dispatch(setRepoUrl(`https://github.com/${username}/${repoName}`));

    const { commit, name, version, subject } = formData;

    setSubmitting(true);
    loadingRunId && loadingRunId(true)
    const triggerAPI = async () => {
      try {
        const checkout = commitHash || commit;
        const profileResponse = await fetchData.put("/profile/current", {
          ...profile,
          dapp: {
            owner: username,
            repo: repoName,
            name: name,
            version: version,
            subject: subject
          },
        });
        if (profileResponse.data.dapp.owner) {
          const response = await postData.post("/run", checkout);
          if (response.data) {
            // store data into LS
            setLsUuid(response.data)
            setLsFormData({
              ...formData,
              commit: checkout,
              repoURL: `https://github.com/${username}/${repoName}`,
            })
            // Emit uuid, checkout
            onSubmit({
              runId: response.data,
              commitHash: checkout,
              repo: username + "/" + repoName
            });
          }
        }
      } catch (e) {
        handleError(e);
      }
      setSubmitting(false);
    };
    triggerAPI();
  };

  // Lists all repo and have to manually click 'Grant' for the repo we need.
  // If that is not chosen, it doesn't ask again for permission
  useEffect(() => {
    // to extract ?code= from the app base url redirected after Github connect
    if (githubAccessCode) {
      (async () => {
        await dispatch(getUserAccessToken({ code: githubAccessCode }));
        searchParams.delete("code");
        setSearchParams(searchParams);

        const formData = form.getValues();
        const [, , , username, repoName] = formData.repoURL.split("/");

        const timeout = setTimeout(async () => {
          clearTimeout(timeout);
          await dispatch(verifyRepoAccess({ owner: username, repo: repoName }));
          localStorage.removeItem(LocalStorageKeys.accessToken);
        }, 0);
      })();
    }
    // the enclosed snippet is to be triggered only once right when the component is rendered to check if the url contains code (to validate if it is a redirect from github)
    
    // Run on unmount
    return () => {
      dispatch(clearAccessStatus())
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fill initial form values
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);

      auditorRunTestFormSchema
        .isValid(initialData)
        .then(() => {
          // do nothing
        }).catch((err) => onError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // New Test: Clear certification form
  useEffect(() => {
    if (clearForm) {
      form.reset();
      dispatch(clearRepoUrl());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearForm]);

  // Test again: Retain repo url in certification form
  useEffect(() => {
    if (testAgain)
      form.reset({
        repoURL: repoUrl,
        commit: "",
        name: "",
        subject: "",
        version: "",
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testAgain]);

  useEffect(() => {
    showConfirmConnection && confirmConnectModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConfirmConnection]);

  return (
    <div>
      <Form form={form} onSubmit={formHandler}>
        <Button
          type="submit" 
          variant="contained" size="large"
          className="button block py-3 px-14 mt-10 mb-20 mx-auto w-[200px]"
          disabled={!form.formState.isValid || submitting || disable || accessStatus !== "accessible"}
        >
          Test
        </Button>

        <div className={disable ? "disabled" : ""}>
          <div className="relative input-wrapper">
            <Input
              label="GitHub Repository"
              type="text"
              id="repoURL"
              required={true}
              disabled={submitting}
              tooltipText="Github Repository URL entered should be in the format - https://github.com/<username>/<repository> (with an optional trailing backslash)."
              triggerOnBlur={checkRepoAccess}
              {...form.register("repoURL")}
            />

            {(accessStatus && !disable) ? (
              <div className="absolute right-[-25px] top-6">
                <RepoAccessStatus status={accessStatus} />
              </div>
            ) : null}
          </div>

          <Input
            label="Commit Hash"
            type="text"
            id="commit"
            required={true}
            disabled={submitting}
            {...form.register("commit")}
          />

          <Input
            label="DApp Name"
            type="text"
            id="name"
            required={true}
            disabled={submitting}
            {...form.register("name")}
          />

          <Input
            label="DApp Version"
            type="text"
            id="version"
            required={true}
            disabled={submitting}
            {...form.register("version")}
          />

          <TextArea
            placeholder="DApp Subject"
            maxRows={2}
            required={true}
            disabled={submitting}
            {...form.register("subject")}
          />
        </div>
      </Form>

      {showError ? <Toast message={showError} /> : null}
    </div>
  );
};
export default AuditorRunTestForm;
