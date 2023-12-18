import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "store/store";
import { findCurrentSubscription, formatToTitleCase, getStatusLabel } from "utils/utils";
import { Box, Button, CircularProgress, Grid, Snackbar, Alert } from "@mui/material";
import { Card } from "../components/Card";
import dayjs from "dayjs";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";

import { PROFILE_DETAILS_KEYS } from "../config";

import UserDetailsModal from "../components/UserDetailsModal";
import {
  clearSuccess,
  fetchProfileDetails,
  fetchProfileSubscriptionDetails,
} from "store/slices/profile.slice";

import "./index.css";
import { fetchProfileRunHistory, setImpersonate } from "store/slices/profile.slice";
import HistoryContainer from "pages/testingHistory/components/HistoryContainer";
import { clearRun } from "store/slices/testing.slice";

interface ISubscription {
  adaUsdPrice: number;
  endDate: string;
  features: {id: string, name: string}[];
  id: string;
  name: string;
  price: number;
  profileId: number;
  status: "active" | "inactive" | "pending";
  startDate: string;
  tierId: number;
  type: "developer" | "auditor"
}

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
    runHistory,
    impersonate
  } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const param = useParams<{ id: string }>();
  const { state } = useLocation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<ISubscription | null>(null);

  // Fetch user profile details if not already available
  useEffect(() => {
    dispatch(fetchProfileDetails(param.id));
    dispatch(fetchProfileSubscriptionDetails(param.id));
    dispatch(fetchProfileRunHistory(param.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (detailsError || updateSuccess) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        dispatch(clearSuccess());
        clearTimeout(timer)
      }, 5000);
      // to clear timeout if component unmounts before timeout completes
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailsError, updateSuccess]);

  useEffect(() => {
    if (userSubscription?.length && !currentSubscription) {
      setCurrentSubscription(findCurrentSubscription(userSubscription))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSubscription])

  const onRefreshHistory = () => {
    dispatch(fetchProfileRunHistory(window.location.href.split("/").pop()));
  }

  return (
    <div>
      <h2 className="px-9 my-0 flex justify-between">
        {state?.companyName || profile?.companyName}
        {!impersonate ? (
          <Button
            title={`Impersonate as ${profile?.fullName}`}
            className="cursor-pointer	text-sm inline-flex items-center bg-white normal-case"
            onClick={async () => {
              await dispatch(setImpersonate({ status: true, id: profile.id }));
              await dispatch(clearRun());
              window.location.pathname = '/';
            }}
          >
            <TheaterComedyIcon className="mr-2" /> Impersonate
          </Button>
        ) : null}
      </h2>
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
              src="/images/avatar.png"
              alt="profile"
              className="w-full"
            />
          </div>

          <div className="details pl-7 inline-flex flex-col w-full">
            <h3 className="m-0 mb-3">{state?.companyName || profile?.companyName}</h3>
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
              userSubscription?.length && currentSubscription ? (
                <>
                  <span className={classNames("text-gray-label mb-1 tierType")}>
                    {currentSubscription.type}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    Tier {currentSubscription.tierId}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    {dayjs(currentSubscription.startDate).format("YYYY-MM-DD")}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    {dayjs(currentSubscription.endDate).format("YYYY-MM-DD")}
                  </span>
                  <span className={classNames("text-gray-label mb-1")}>
                    Subscribed at ${Math.round(currentSubscription.price/1000000*currentSubscription.adaUsdPrice*100)/100}/year (₳ 
                    {Math.round(currentSubscription.price*100/1000000)/100})
                  </span>
                  <span
                    className={classNames(
                      "text-gray-label mb-1",
                      `uppercase font-semibold ${getStatusLabel(
                        currentSubscription.status?.toLowerCase()
                      )}`
                    )}
                  >
                    {currentSubscription.status}
                  </span>
                </>
              ) : (
                "No subscription found"
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
