import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "store/store";
import { useForm } from "hooks/useForm";
import { fetchData, postData } from "api/api";

import { LocalStorageKeys } from "constants/constants";
import Button from "components/Button/Button";
import TextArea from "components/TextArea/TextArea";
import Toast from "components/Toast/Toast";
import { Form } from "compositions/Form/Form";
import { Input } from "compositions/Form/components/Input";
import { getErrorMessage } from "utils/utils";

import { clearRepoUrl, setRepoUrl } from "../../slices/certification.slice";
import {
  REPO_URL_PATTERN,
  auditorRunTestFormSchema,
} from "./auditorRunTestForm.schema";
import { IAuditorRunTestFormFields } from "./auditorRunTestForm.interface";

interface IAuditorRunTestForm {
  isSubmitting: boolean;
  clearForm?: boolean;
  testAgain?: boolean;
  onSubmit: (data: { runId: string; commitHash: string }) => any;
  onError: () => void;
}

const AuditorRunTestForm: React.FC<IAuditorRunTestForm> = ({
  isSubmitting,
  clearForm = false,
  testAgain = false,
  onSubmit,
  onError,
}) => {
  const form: any = useForm({
    schema: auditorRunTestFormSchema,
    mode: "all",
  });
  const repoUrlChanges = form.watch("repoURL");

  const dispatch = useAppDispatch();
  const { repoUrl } = useAppSelector((state) => state.certification);
  const { userDetails } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState("");
  const [mandatory, setMandatory] = useState(false);

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
    const [, , , username, repoName, , commitHash] =
      formData.repoURL.split("/");
    dispatch(setRepoUrl(`https://github.com/${username}/${repoName}`));

    const { commit, name, version } = formData;

    setSubmitting(true);

    const triggerAPI = async () => {
      try {
        const checkout = commitHash || commit;
        const profileResponse = await fetchData.put("/profile/current", {
          ...userDetails,
          dapp: {
            owner: username,
            repo: repoName,
            name: name,
            version: version
          },
        });
        if (profileResponse.data.dapp.owner) {
          const response = await postData.post("/run", checkout);
          if (response.data) {
            // store data into LS
            localStorage.setItem(LocalStorageKeys.certificationUuid, response.data);
            localStorage.setItem(LocalStorageKeys.commit, checkout);
            // Emit uuid, checkout
            onSubmit({ runId: response.data, commitHash: checkout });
          }
        }
      } catch (e) {
        handleError(e);
      }
      setSubmitting(false);
    };
    triggerAPI();
  };

  // Validate commit field based on URL entered
  useEffect(() => {
    if (repoUrlChanges) {
      const matches = repoUrlChanges.match(REPO_URL_PATTERN);
      if (matches && repoUrlChanges.match(/commit/gi)) {
        const commitHash = repoUrlChanges.split("/").pop();
        // commit hash is available in url and is valid
        if (/^[a-f0-9]{7,40}$/.test(commitHash)) {
          setMandatory(false);
        }
      } else {
        // url invalid
        setMandatory(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repoUrlChanges]);

  return (
    <div>
      <Form form={form} onSubmit={formHandler}>
        <Button
          type="submit"
          buttonLabel="Test"
          showLoader={submitting || isSubmitting}
          disabled={!form.formState.isValid || submitting}
          className="my-10 block mx-auto bg-secondary hover:bg-blue max-w-[200px] w-[200px] rounded-3 font-mono text-lg font-normal"
        />

        <Input
          label="GitHub Repository"
          type="text"
          id="repoURL"
          required={true}
          disabled={submitting}
          tooltipText="Github Repository URL formats accepted here are - 'https://github.com/<username>/<repository>', 'https://github.com/<username>/<repository>/commit/<commit-hash>'."
          {...form.register("repoURL")}
        />

        <Input
          label="Commit Hash"
          type="text"
          id="commit"
          required={mandatory}
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
          required={false}
          disabled={submitting}
          {...form.register("subject")}
        />
      </Form>

      {showError ? <Toast message={showError} /> : null}
    </div>
  );
};
export default AuditorRunTestForm;
