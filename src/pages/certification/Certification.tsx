import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { ellipsizeString } from "utils/utils";

import CertificationForm from "./components/AuditorRunTestForm/AuditorRunTestForm";
import TimelineView from "./components/TimelineView/TimelineView";
import { clearPersistentStates } from "./components/AuditorRunTestForm/utils";
import { LocalStorageKeys } from "constants/constants";
import useLocalStorage from "hooks/useLocalStorage";
import { IAuditorRunTestFormFields } from "./components/AuditorRunTestForm/auditorRunTestForm.interface";
import Loader from "components/Loader/Loader";

const Certification = () => {
    const [lsFormData] = useLocalStorage(LocalStorageKeys.certificationFormData, "");
    const [lsUuid] = useLocalStorage(LocalStorageKeys.certificationUuid, "");
    const [disableForm, setDisableForm] = useState(false);
    const [runId, setRunId] = useState("");
    const [commitHash, setRunCommitHash] = useState("");
    const [repo, setRepo] = useState("");
    const [runEnded, setRunEnded] = useState(false);
    const [testAgain, setTestAgain] = useState(false);
    const [clearForm, setClearForm] = useState(false);
    const [clickedFormSubmit, setClickedFormSubmit] = useState(false);
    const [formData, setFormData] = useState<IAuditorRunTestFormFields | null>(null);
    const [forceFormValidation, setForceFormValidation] = useState(false);

    const onCertificationFormSubmit = (data: {
        runId: string;
        commitHash: string;
        repo: string;
    }) => {
        setRunId(data.runId);
        setRunCommitHash(data.commitHash);
        setRepo(data.repo)
        setDisableForm(true);
    };

    const resetStates = (ended: boolean = false) => {
        setRunEnded(ended)
        setRunId("")
        setDisableForm(false)
        setClickedFormSubmit(false)
    }

    const onTestRunAbort = () => {
        clearPersistentStates()
        resetStates()
        setForceFormValidation(true)
    }

    const onRunEnd = () => {
        setRunEnded(true)
    }

    const triggerRetest = () => {
        setTestAgain(true)
        resetStates()
        setForceFormValidation(true)
    }

    const triggerNewTest = () => {
        setClearForm(true)
        resetStates()
    }

    const certificationFormError = () => {
        setDisableForm(false)
        if (runId) {
            onTestRunAbort();
        }
    };

    // Prefill form values
    useEffect(() => {
        if (lsFormData && lsUuid && !runId) {
            const data: IAuditorRunTestFormFields = JSON.parse(
                JSON.stringify(lsFormData)
            );
            const { repoURL, commit: commitHash, version, name, subject } = data;
            if (repoURL && commitHash && version && name && version && subject) {
                const [, , , username, repoName] = data.repoURL.split("/");
                setFormData(data);
                onCertificationFormSubmit({
                    runId: lsUuid as string,
                    commitHash: commitHash,
                    repo: username + "/" + repoName,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lsFormData]);

    return (
        <div className="content-area">
            <div className="content-area-title-section py-7 flex justify-between">
                <h2 className="m-0">
                    {runId
                        ? "Run: " + ellipsizeString(runId)
                        : "Testing Tool"}
                </h2>
                {runEnded && (
                    <div className="flex gap-x-4">
                        <Button
                            type="button"
                            variant="contained" size="small"
                            onClick={triggerRetest}
                            className="button text-sm min-w-[150px]"
                            startIcon={<RestartAltIcon />}
                        >Test again</Button>
                        <Button
                            type="button"
                            variant="contained" size="small"
                            onClick={triggerNewTest}
                            className="button text-sm min-w-[150px]"
                            startIcon={<LeaderboardIcon />}
                        >New test</Button>
                    </div>
                )}
            </div>
            <div
                id="certificationWrapper"
                className="content-area-box shadow-lg bg-white px-5 xs:px-7 xs:py-4 flex flex-col tab:flex-row tab:px-5"
            >
                <div className="sm:w-full tab:w-1/2 px-0 mb-6 tab:px-22 tab:mb-0">
                    <CertificationForm
                        loadingRunId={()=> { setClickedFormSubmit(true) }}
                        onSubmit={onCertificationFormSubmit}
                        disable={disableForm}
                        testAgain={testAgain}
                        clearForm={clearForm}
                        initialData={formData}
                        onError={certificationFormError}
                        forceValidate={forceFormValidation}
                    />
                </div>
                <div className="sm:w-full tab:w-1/2 px-22 min-h-[150px] tab:px-22 tab:mb-0">
                    {runId ? (
                        <TimelineView
                            uuid={runId}
                            repo={repo}
                            commitHash={commitHash}
                            runEnded={onRunEnd}
                            onAbort={onTestRunAbort}
                            triggerFormReset={onTestRunAbort}
                        />
                    ) : (
                        <div className="w-full text-center text-xl text-neutral-300 font-medium pt-48">
                            {clickedFormSubmit ? <Loader /> : <span>Fill the testing form</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Certification;
