import { useState } from "react";
// import { useAppSelector } from "store/store";
import CertificationForm from "./components/AuditorRunTestForm/AuditorRunTestForm";
import TimelineView from "./components/TimelineView/TimelineView";

const Certification = () => {
    // const { features: subscribedFeatures } = useAppSelector((state) => state.auth);

    const [submitting, setSubmitting] = useState(false);
    const [runId, setRunId] = useState("");
    const [commitHash, setRunCommitHash] = useState("");
    const [repo, setRepo] = useState("");

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

    const certificationFormError = () => setSubmitting(false);

    return (
        <div className="content-area">
            <div className="content-area-title-section pb-7">
                <span className="text-2xl text-neutral-500">
                    {runId && commitHash
                        ? "Run: " + commitHash.slice(0, 7)
                        : "Testing Tool"}
                </span>
            </div>
            <div
                id="certificationWrapper"
                className="content-area-box shadow-lg bg-white px-5 py-4 flex flex-col sm:flex-row"
            >
                <div className="w-full sm:w-1/2 px-22">
                    <CertificationForm
                        onSubmit={onCertificationFormSubmit}
                        isSubmitting={submitting}
                        onError={certificationFormError}
                    />
                </div>
                {runId ? (
                    <div className="w-full sm:w-1/2 px-22">
                        <TimelineView
                            uuid={runId}
                            repo={repo}
                            commitHash={commitHash}
                            onAbort={onTestRunAbort}
                            triggerFormReset={onTestRunAbort}
                        />
                    </div>
                ) : (
                    <div className="w-full sm:w-1/2 px-22">
                        <div className="w-full text-center text-xl text-neutral-300 font-medium pt-48">
                            Fill the testing form
                        </div>                               
                    </div>
                )}
            </div>
        </div>
    );
};

export default Certification;
