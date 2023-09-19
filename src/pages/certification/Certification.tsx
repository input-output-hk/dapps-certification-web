import Button from "components/Button/Button";
import { useState } from "react";
import { ellipsizeString } from "utils/utils";

// import { useAppSelector } from "store/store";
import CertificationForm from "./components/AuditorRunTestForm/AuditorRunTestForm";
import TimelineView from "./components/TimelineView/TimelineView";

const Certification = () => {
    // const { features: subscribedFeatures } = useAppSelector((state) => state.auth);

    const [submitting, setSubmitting] = useState(false);
    const [runId, setRunId] = useState("");
    const [commitHash, setRunCommitHash] = useState("");
    const [repo, setRepo] = useState("");
    const [runEnded, setRunEnded] = useState(false);
    const [testAgain, setTestAgain] = useState(false);
    const [clearForm, setClearForm] = useState(false);

    const onCertificationFormSubmit = (data: {
        runId: string;
        commitHash: string;
        repo: string;
    }) => {
        setRunId(data.runId);
        setRunCommitHash(data.commitHash);
        setRepo(data.repo)
        setSubmitting(true);
    };

    const onTestRunAbort = () => {
        // resetStates()
        // clearPersistentStates();
    };

    const onRunEnd = () => {
        // setSubmitting(false)
        setRunEnded(true)
    }

    const triggerReset = () => {
        setTestAgain(true)
    }

    const triggerNewTest = () => {
        setClearForm(true)
    }

    const certificationFormError = () => setSubmitting(false);

    return (
        <div className="content-area">
            <div className="content-area-title-section pb-7 flex justify-between">
                <span className="text-2xl text-neutral-700 font-medium">
                    {runId
                        ? "Run: " + ellipsizeString(runId)
                        : "Testing Tool"}
                </span>
                {runEnded && (
                    <div className="flex gap-x-4">
                        <Button
                            type="button"
                            size="small"
                            buttonLabel="Test again"
                            onClick={triggerReset}
                            className="hover:bg-blue rounded-3 font-mono text-lg font-normal"
                        />
                        <Button
                            type="button"
                            size="small"
                            buttonLabel="New test"
                            onClick={triggerNewTest}
                            className="hover:bg-blue rounded-3 font-mono text-lg font-normal"
                        />
                    </div>
                )}
            </div>
            <div
                id="certificationWrapper"
                className="content-area-box shadow-lg bg-white px-5 xs:px-7 xs:py-4 flex flex-col tab:flex-row tab:px-5"
            >
                <div className="sm:w-full tab:w-1/2 px-0 mb-6 tab:px-22 tab:mb-0">
                    <CertificationForm
                        onSubmit={onCertificationFormSubmit}
                        isSubmitting={submitting}
                        testAgain={testAgain}
                        clearForm={clearForm}
                        onError={certificationFormError}
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
                        <div className="w-full text-center text-xl text-neutral-300 font-medium pt-48 top-1/2 -translate-y-1/2">
                            Fill the testing form
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Certification;
