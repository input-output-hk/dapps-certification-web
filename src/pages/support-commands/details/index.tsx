import { useEffect, useState } from "react";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "store/store";
import { formatToTitleCase, getStatusLabel } from "utils/utils";
import { Box, CircularProgress, Grid, Snackbar, Alert, Container } from "@mui/material";
import { Card } from "../components/Card";
import dayjs from "dayjs";

import { PROFILE_DETAILS_KEYS } from "../config";

import UserDetailsModal from "../components/UserDetailsModal";
import {
  clearSuccess,
  fetchProfileDetails,
  fetchProfileSubscriptionDetails,
} from "store/slices/profile.slice";

import "./index.css";
import { fetchProfileRunHistory } from "store/slices/profile.slice";
import HistoryContainer from "pages/testingHistory/components/HistoryContainer";


const UserDetails = () => {
  // const [data] = useState<any>(UserDetails);
  const {
    selectedUser: profile,
    userSubscription,
    loadingDetails,
    loadingSubDetails,
    detailsError,
    updateSuccess,
    loadingHistory,
    runHistory
  } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Fetch user profile details if not already available
  useEffect(() => {
    const currentProfileId = window.location.href.split("/").pop()
    dispatch(fetchProfileDetails(currentProfileId));
    dispatch(fetchProfileSubscriptionDetails(currentProfileId));
    dispatch(fetchProfileRunHistory(currentProfileId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(detailsError, updateSuccess);
    if (detailsError || updateSuccess) {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        dispatch(clearSuccess());
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsError, updateSuccess]);

  const onRefreshHistory = () => {
    dispatch(fetchProfileRunHistory(window.location.href.split("/").pop()));
  }

  return (
    <div>
      <h2 className="px-9 my-0">{profile?.companyName}</h2>
      <Grid container className="py-5 px-9" justifyContent="space-between">
        <Card
          key={'profile-card'}
          index={0}
          showEdit
          onEdit={() => {
            setOpen(true);
            setTitle("profile");
          }}
          class="p-5 form-card"
        >
          <div className="img">
            <img
              src="https://avatars.githubusercontent.com/u/22358125?v=4"
              alt="profile"
              className="w-full"
            />
          </div>

          <div className="details pl-7 inline-flex flex-col w-full">
            <h3 className="m-0 mb-3">{profile?.companyName}</h3>
            {!loadingDetails ? (
              PROFILE_DETAILS_KEYS.map((key, index) => (
                <span key={`profile-key-${index}`} className="text-gray-label mb-1">
                  {profile?.[key] ? profile?.[key] : (<i className="text-[14px]">{formatToTitleCase(key)}</i>)}
                </span>
              ))
            ) : (
              <Box className="flex items-center justify-center p-8">
                <CircularProgress color="secondary" />
              </Box>
            )}
          </div>
        </Card>

        <Card key={'subscription-card'} index={1} class="p-5 form-card">
          <div className="details inline-flex flex-col w-full">
            <h3 className="m-0 mb-3">Current Subscription</h3>
            {!loadingSubDetails ? (
              userSubscription?.length ? (
                <>
                  <span className={classNames("text-gray-label mb-1 tierType")}>
                    {userSubscription[0]?.type}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    Tier {userSubscription[0]?.tierId}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    {dayjs(userSubscription[0]?.startDate).format("MM/DD/YYYY")}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    {dayjs(userSubscription[0]?.endDate).format("MM/DD/YYYY")}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    Subscribed at ${userSubscription[0]?.price}/year (
                    {userSubscription[0]?.price}Ada)
                  </span>
                  <span
                    className={classNames(
                      "text-gray-label mb-1",
                      `uppercase font-semibold ${getStatusLabel(
                        userSubscription[0]?.status?.toLowerCase()
                      )}`
                    )}
                  >
                    {userSubscription[0]?.status}
                  </span>
                </>
              ) : (
                "No subscription"
              )
            ) : (
              <Box className="flex items-center justify-center p-8">
                <CircularProgress color="secondary" />
              </Box>
            )}
          </div>
        </Card>
      </Grid>
      
      <Grid container className="py-5 px-9">
        <HistoryContainer loading={loadingHistory} history={runHistory} showAbort={true} refreshData={onRefreshHistory}/>
      </Grid>

      {profile && (
        <UserDetailsModal
          onClose={() => setOpen(false)}
          data={profile}
          title={title}
          show={open}
        />
      )}

      <Snackbar
        open={!!showToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={detailsError ? "error" : "success"} variant="filled">
          {detailsError || "Profile details updated"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserDetails;
