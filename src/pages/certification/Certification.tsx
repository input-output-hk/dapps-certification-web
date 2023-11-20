import React from "react";
import { Button, CircularProgress } from "@mui/material";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import CommitIcon from '@mui/icons-material/Commit';

import { ellipsizeString } from "utils/utils";
import { useAppDispatch, useAppSelector } from "store/store";
import { resetForm, resetForRetest, createTestRun } from "store/slices/testing.slice";

import AuditorRunTestForm from "./components/AuditorRunTestForm/AuditorRunTestForm";
import TimelineView from "./components/TimelineView/TimelineView";

import './Certification.css';
import { useAppSelector } from "store/store";

const Certification = () => {
	const dispatch = useAppDispatch();
    const {features} = useAppSelector((state) => state.auth)
	const { uuid, creating, runEnded } = useAppSelector((state) => state.testing);

	const handleRetest = async () => {
		await dispatch(resetForRetest());
		await dispatch(createTestRun({}));
	}

	const handleReset = () => {
		dispatch(resetForm());
	}

	const handleAbort = () => {
		dispatch(resetForm());
	}

	return (
		<div className="content-area">
			<div className="content-area-title-section py-7 flex justify-between">
				<h2 className="m-0">
					{uuid
						? "Run: " + ellipsizeString(uuid)
						: "Testing Tool"}
				</h2>
				{runEnded && (
					<div className="flex gap-x-4">
						{features.includes('l2-upload-report') && features.includes('l1-run') ? (
                            <Button
                                type="button"
                                variant="contained" size="small"
                                onClick={handleRetest}
                                className="button text-sm min-w-[150px]"
                                startIcon={<CommitIcon />}
                            >Test another commit</Button>
                        ) : null}
                         {features.includes('l2-upload-report') ? (
                            <Button
                                type="button"
                                variant="contained" size="small"
                                onClick={handleReset}
                                className="button text-sm min-w-[150px]"
                                startIcon={<LeaderboardIcon />}
                            >Test another DApp</Button>
                        ): null}
					</div>
				)}
			</div>
			<div className="content-area-box shadow-lg bg-white px-5 xs:px-7 xs:py-4 flex flex-col tab:flex-row tab:px-5">
				<div className="sm:w-full tab:w-1/2 px-0 mb-6 tab:px-22 tab:mb-0">
					<AuditorRunTestForm />
				</div>
				<div className="sm:w-full tab:w-1/2 px-22 min-h-[150px] tab:px-22 tab:mb-0">
					{uuid ? (
						<TimelineView onAbort={handleAbort} />
					) : (
						<div className="w-full text-center text-xl text-neutral-300 font-medium pt-48">
							{creating ? <CircularProgress color="secondary" size={50} /> : <span>Fill the testing form</span>}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Certification;
