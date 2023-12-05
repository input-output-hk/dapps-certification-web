import { CircularProgress, Box } from "@mui/material";
import { useAppSelector } from "store/store";

import type { Run } from 'components/CreateCertificate/CreateCertificate';
import AppTable from "./AppTable";
import { useEffect } from "react";

interface AppHistory {
    appName: string;
    history: Run[];
}

interface Props {
    history: Run[],
    loading: boolean,
    certificates?: any,
    showAbort?: boolean
    refreshData: () => void
}

const HistoryContainer = (props: Props) => {

    const formatRepoUrl = (repoUrl: string) => {
        let pieces = repoUrl.split('github:')[1].split('/')
        return (pieces[0] + "/" + pieces[1]);
    }

    const getAppsHistory = () => {
        const appsHistory: AppHistory[] = [];
        for (const row of props.history) {
            const repoUrl = formatRepoUrl(row.repoUrl);
            const index = appsHistory.findIndex(app => app.appName === repoUrl);
            if (index >= 0) {
            appsHistory[index].history.push(row);
            } else {
            appsHistory.push({
                appName: repoUrl,
                history: [row]
            });
            }
        }
        return appsHistory;
    }

    return (<>
        {(props.loading || !props.history) ? (
            <Box className="pt-16 text-center">
              <CircularProgress color="secondary" size={100} />
            </Box>
        ): (
            getAppsHistory().map(app =>
                <AppTable
                    key={app.appName}
                    appName={app.appName}
                    history={app.history}
                    certificates={props.certificates}
                    showAbort={props.showAbort}
                    refreshData={props.refreshData}
                />
            )
        )}
    </>)
}

export default HistoryContainer;