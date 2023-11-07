import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { ellipsizeString } from "utils/utils";
import { useAppDispatch, useAppSelector } from "store/store";
import { resetForm } from "store/slices/testing.slice";

import AuditorRunTestForm from "./components/AuditorRunTestForm/AuditorRunTestForm";
import TimelineView from "./components/TimelineView/TimelineView";

import './Certification.css';

const Certification = () => {
	const dispatch = useAppDispatch();
	const { uuid, loadingUuid, form } = useAppSelector((state) => state.testing);
	const [runEnded, setRunEnded] = useState(false);

	useEffect(() => { dispatch(resetForm()) }, []);

	const resetStates = (ended: boolean = false) => {
		setRunEnded(ended);
	}

	const onTestRunAbort = () => {
		
	}

	const onRunEnd = () => {
		setRunEnded(true);
	}

	const triggerRetest = () => {
		
	}

	const triggerNewTest = () => {
		
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
			<div className="content-area-box shadow-lg bg-white px-5 xs:px-7 xs:py-4 flex flex-col tab:flex-row tab:px-5">
				<div className="sm:w-full tab:w-1/2 px-0 mb-6 tab:px-22 tab:mb-0">
					<AuditorRunTestForm disable={uuid !== null} />
				</div>
				<div className="sm:w-full tab:w-1/2 px-22 min-h-[150px] tab:px-22 tab:mb-0">
					{uuid ? (
						<TimelineView
							uuid={uuid}
							repo={form?.repoUrl || ''}
							commitHash={form?.commitHash || ''}
							runEnded={onRunEnd}
							onAbort={onTestRunAbort}
							triggerFormReset={onTestRunAbort}
						/>
					) : (
						<div className="w-full text-center text-xl text-neutral-300 font-medium pt-48">
							{loadingUuid ? <CircularProgress color="secondary" size={50} /> : <span>Fill the testing form</span>}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Certification;
