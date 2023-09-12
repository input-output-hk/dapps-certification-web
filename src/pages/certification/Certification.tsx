import React, { useEffect, useState } from "react";

import { fetchData, postData } from "api/api";
import Button from "components/Button/Button";
import { Input } from "compositions/Form/components/Input";
import { Form } from "compositions/Form/Form";
import { ISearchForm } from "./certification.interface";
import { certificationSchema } from "./certification.schema";
import { useForm } from "hooks/useForm";
import { useLogs } from "hooks/useLogs";
import "./Certification.scss";
import Timeline from "compositions/Timeline/Timeline";
import { TIMELINE_CONFIG } from "compositions/Timeline/timeline.config";
import { processTimeLineConfig } from "components/TimelineItem/timeline.helper";
import { isAnyTaskFailure } from "./Certification.helper";
import { useDelayedApi } from "hooks/useDelayedApi";
import Toast from "components/Toast/Toast";
import InformationTable from "components/InformationTable/InformationTable";

import { useAppDispatch, useAppSelector } from "store/store";
import { clearUuid, setUuid } from "./slices/certification.slice";
import { clearStates, setBuildInfo, setStates, } from "./slices/logRunTime.slice";
import { deleteTestHistoryData } from "pages/testHistory/slices/deleteTestHistory.slice";
import { useConfirm } from "material-ui-confirm";
import { Link, useNavigate } from "react-router-dom";
import Loader from "components/Loader/Loader";
import { LocalStorageKeys } from "constants/constants";
import useLocalStorage from "hooks/useLocalStorage";

const TIMEOFFSET = 1000;

const Certification = () => {
  const form: any = useForm({
    schema: certificationSchema,
    mode: "onChange",
  });
  const navigate = useNavigate();

  const { uuid } = useAppSelector((state) => state.certification);
  const { features: subscribedFeatures } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [timelineConfig, setTimelineConfig] = useState(TIMELINE_CONFIG);
  const [githubLink, setGithubLink] = useState("");
  const [resultData, setResultData] = useState<any>({});
  const [unitTestSuccess, setUnitTestSuccess] = useState(true); // assuming unit tests will pass
  const [errorToast, setErrorToast] = useState(false);
  const [runStatus, setRunStatus] = useState("");
  const [runState, setRunState] = useState("");
  const [refetchMin, setRefetchMin] = useState(5);
  const [fetchRunStatus, setFetchRunStatus] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiFetching, setApiFetching] = useState(false); // to be used for 'Abort'
  const [username, setUsername] = useState('');
  const [repoName, setRepository] = useState('');
  
  const [certificationRunTime, , removeCertificationRunTime] = useLocalStorage(
      LocalStorageKeys.certificationRunTime,
      localStorage.getItem(LocalStorageKeys.certificationRunTime)
    ? JSON.parse(localStorage.getItem(LocalStorageKeys.certificationRunTime)!)
    : null
  )
  const [certificationUuid, setCertificationUuid, removeCertificationUuid] = useLocalStorage(
      LocalStorageKeys.certificationUuid,
      localStorage.getItem(LocalStorageKeys.certificationUuid) ? localStorage.getItem(LocalStorageKeys.certificationUuid) : ""
  )

  const [commitHash, setCommitHash, removeCommitHash] = useLocalStorage(
    LocalStorageKeys.commit, 
    localStorage.getItem(LocalStorageKeys.commit) || "")

  const resetStates = () => {
    setRunState("")
    setRunStatus("")
    setResultData({})
    setUnitTestSuccess(true)
    setSubmitting(false)
    setFormSubmitted(false)
    setApiFetching(false) // Clear apiFetching state
    setGithubLink("")
    setTimelineConfig(TIMELINE_CONFIG)
    // Clear uuid states
    dispatch(clearUuid())
    form.reset();
    dispatch(clearStates())
  };

  const clearPersistentStates = () => {
    dispatch(clearUuid());
    dispatch(clearStates());
    setApiFetching(false) // Clear apiFetching state
    removeCertificationUuid()
    removeCertificationRunTime()
    removeCommitHash()
  }

  const formHandler = (formData: ISearchForm) => {
    const { branch, commit } = formData;
      
    setSubmitting(true);

    // Reset to default process states
    if (formSubmitted) {
      setTimelineConfig(TIMELINE_CONFIG);
    }

    let githubBranchOrCommitHash = branch || commit;
    setGithubLink(
      "https://github.com/" + username + "/" + repoName + "/tree/" + githubBranchOrCommitHash
    );

    const triggerAPI = async () => {
      try {
        const data = githubBranchOrCommitHash
        const response = await postData.post(
          "/run",
          data
        );
        /** For mock */
        // const response = await postData.get('static/data/run')
        const runId = response.data.toString();
        dispatch(setUuid(runId));
        setCertificationUuid(runId);
        setCommitHash(commit);
      } catch (e) {
        handleErrorScenario();
        console.error('Failed:', e);
      }
    };
    triggerAPI();
  };

  const triggerFetchRunStatus = async () => {
    let config = timelineConfig;
    try {
      const res = await fetchData.get("/run/" + uuid);
      /** For mock */
      // const res = await fetchData.get("static/data/certifying.json")
      const status = res.data.status;
      const state = res.data.hasOwnProperty("state") ? res.data.state : "";
      setRunStatus(status);
      setRunState(state);
      setFetchRunStatus(state === "running" || state === "passed");
      config = processTimeLineConfig(config, state, status, res);
      if (status === "finished") {
        // navigate to result page
        clearPersistentStates();
        navigate("/report/" + uuid, {state: { repoUrl: githubLink, certifiable: true }});
      }
      if (state === "failed" || status === "finished") {
        setSubmitting(false);
        clearPersistentStates();
      }
      setTimelineConfig(config);
    } catch (e) {
      handleErrorScenario();
      console.error('Failed:', e);
    }
  };

  const handleErrorScenario = React.useCallback(() => {
    // show an api error toast
    setErrorToast(true);
    form.reset();
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      setErrorToast(false);
      // TBD - blur out of input fields
    }, 5000); // hide after 5 seconds
    setSubmitting(false);
    setFormSubmitted(false);
    setTimelineConfig(TIMELINE_CONFIG);
    clearPersistentStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[form])

  const abortRun = () => {
    confirm({ title: "", description: "Are sure you want to abort this run!" })
      .then(async () => {
        await dispatch(deleteTestHistoryData({ url: "/run/" + uuid + "?delete=true" }));
        resetStates()
        clearPersistentStates();
      }).catch(() => { });
  }

  // Populate certification states to resume certification
  useEffect(() => {
    const uuidLS = certificationUuid,
      runTimeLS = certificationRunTime,
      commitLS = commitHash;

    if (uuidLS && commitLS) {
      // Run time calc is not always done for the initial states
      if (runTimeLS) {
        const { startTime, endTime, runState } = runTimeLS;
        dispatch(setStates({ startTime, endTime, runState }));

        // Set form as submitted on component load if certification is running
        setFormSubmitted(true);
        setSubmitting(true);
        form.setValue("commit", commitLS);
      }
      dispatch(setUuid(String(uuidLS)));
      dispatch(setBuildInfo());
    }

    (async() => {
      const features: any = await fetchData.get(
        "/profile/current/subscriptions/active-features"
      );
      if (features.error) {
        console.error('Failed to fetch active features:', features.error);
        return;
      }
      // TODO: FIX THIS
      //await dispatch(setSubscribedFeatures(features.data));
    })()

    // Run on unmount
    return () => {
      resetStates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (uuid.length) {
      triggerFetchRunStatus();
    }
    // eslint-disable-next-line
  }, [uuid]);

  // TODO: FIX THIS
  // useEffect(() => {
  //   if (userDetails?.dapp?.owner) {
  //     setUsername(userDetails.dapp.owner);
  //   }
  //   if (userDetails?.dapp?.repo) {
  //     setRepository(userDetails.dapp.repo);
  //   }
  // }, [userDetails]);

  useEffect(() => {
    runStatus === "certifying" ? setRefetchMin(2) : setRefetchMin(5);
    if (
      runStatus === "certifying" ||
      runStatus === "building" ||
      runStatus === "preparing" ||
      runStatus === "queued" ||
      (runStatus === "finished" && runState === "running")
    ) {
      setApiFetching(true);
    } else {
      setApiFetching(false);
    }
  }, [runStatus, runState]);

  useDelayedApi(
    async () => {
      setFetchRunStatus(false); // to clear timeout until api response
      triggerFetchRunStatus();
    },
    refetchMin * TIMEOFFSET, // delay in milliseconds
    fetchRunStatus // set to false to stop polling
  );
  const {logInfo} = useLogs(
      uuid,
      runStatus === "finished" || runState === "failed",
      true,
      handleErrorScenario
  )

  return (
    <>
      {subscribedFeatures?.indexOf("l1-run") === -1 ? 
      <div id="searchContainerEmpty">
        <p>You do not have a valid subscription to perform the test run. <br/> <Link to="/subscription">Click here</Link> to review our packages and pick one to proceed.</p>
      </div>
      : <div
        id="searchContainer"
        className={runStatus === "finished" ? "hidden" : ""}
      >
        <h2>
          Enter Github repository details of your Dapp to start the
          certification process.
        </h2>
        <div className="search-form common-top">
          <Form form={form} onSubmit={formHandler}>
            <Input
              label="Commit Hash"
              type="text"
              id="commit"
              disabled={submitting}
              {...form.register("commit")}
            />
            <div className="footer">
              <Button
                type="submit"
                buttonLabel={"Start Testing"}
                showLoader={
                  submitting &&
                  (runStatus !== "finished" && runState !== "failed")
                }
                disabled={!form.formState.isValid || submitting}
                onClick={(_) => setFormSubmitted(true)}
              />
              {(apiFetching && submitting) && (
                <Button
                  type="button"
                  displayStyle="primary-outline"
                  buttonLabel="Abort Run"
                  onClick={(_) => abortRun()}
                />
              )}
            </div>
          </Form>
        </div>
      </div>
      }
      {formSubmitted && (
        <>
          <div id="resultContainer" data-testid="resultContainer">
            <Timeline
              statusConfig={timelineConfig}
              unitTestSuccess={unitTestSuccess}
              hasFailedTasks={isAnyTaskFailure(resultData)}
            />
          </div>
          
          {/* To show 'View Logs' always  */}
          <InformationTable logs={logInfo} />
          
        </>
      )}

      {errorToast ? <Toast /> : null}
    </>
  )
};

export default Certification;
