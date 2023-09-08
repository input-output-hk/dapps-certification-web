import { useState } from "react";
import CertificationForm from "./components/AuditorRunTestForm/AuditorRunTestForm";
import TimelineView from "./components/TimelineView/TimelineView";

const Certification = () => {
    const [submitting, setSubmitting] = useState(false);
    const [runId, setRunId] = useState("");
    const [commitHash, setRunCommitHash] = useState("");

    const onCertificationFormSubmit = (data: {
        runId: string;
        commitHash: string;
    }) => {
        setRunId(data.runId);
        setRunCommitHash(data.commitHash);
        setSubmitting(true);
    };

    const onTestRunAbort = () => {
        // resetStates()
        // clearPersistentStates();
    };

    const certificationFormError = () => setSubmitting(false);

    return (
        <div className="content-area bg-slate-contentBackground">
            <div className="px-20 py-14">
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
                    <div className="w-full sm:w-1/2 px-22">
                        {runId ? (
                            <TimelineView
                                uuid={runId}
                                onAbort={onTestRunAbort}
                                triggerFormReset={onTestRunAbort}
                            />
                        ) : (
                            <>
                                <div className="w-full text-center text-xl text-neutral-300 font-medium pt-48">
                                    Fill the testing form
                                </div>                               
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certification;
