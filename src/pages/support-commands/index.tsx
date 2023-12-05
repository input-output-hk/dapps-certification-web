import { SetStateAction, useEffect, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import {
  Box,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";

import { fetchAllProfileDetails } from "store/slices/profile.slice";
import { useAppDispatch, useAppSelector } from "store/store";
import { formatToTitleCase } from "utils/utils";

import DeleteUserModal from "./components/DeleteUserModal";
import { Card } from "./components/Card";

import "./index.css";

const SupportCommands = () => {
  const [items, setItems] = useState<any>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchField, setSearchField] = useState("");
  const [selectedId, setId] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { allUsers, loadingDetails, detailsSuccess } = useAppSelector(
    (state) => state.profile
  );

  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 10;

  const filteredPersons = (details: any[]) =>
    details.filter((person: { fullName: string; companyName: string }) => {
      return (
        person?.fullName?.toLowerCase().includes(searchField.toLowerCase()) ||
        person?.companyName?.toLowerCase().includes(searchField.toLowerCase())
      );
    });

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setSearchField(e.target.value);
    e.target.value ? setHasNextPage(false) : setHasNextPage(true); // no need to call api when searching
  };

  const fetchMoreData = () => {
    if (!allUsers?.length) {
      return; // do nothing
    }
    setLoading(true);
    setTimeout(() => {
      // Determine whether to show load more
      startIndex + itemsPerPage > allUsers.length
        ? setHasNextPage(false)
        : setHasNextPage(true);

      const endIndex = Math.min(startIndex + itemsPerPage, allUsers.length);
      const newItems = allUsers.slice(startIndex, endIndex);
      setItems((prevItems: any) => [...prevItems, ...newItems]);
      setStartIndex(endIndex);
      setLoading(false);
    }, 1500);
  };

  const [infiniteRef] = useInfiniteScroll({
    loading: loading,
    hasNextPage: true,
    onLoadMore: fetchMoreData,
    // When there is an error, we stop infinite loading.
    // It can be reactivated by setting "error" state as undefined.
    // disabled: !!error,

    // `rootMargin` is passed to `IntersectionObserver`.
    // We can use it to trigger 'onLoadMore' when the sentry comes near to become
    // visible, instead of becoming fully visible on the screen.
    rootMargin: "0px 0px 400px 0px",
  });

  const buildCards = (items: any, showText = "") =>
    items.length ? (
      items.map((item: any, index: number) => (
        <Card
          key={`card-${index}`}
          index={index}
          showEdit
          showDelete={false}
          onEdit={() => {
            navigate(`/support-commands/${item.id}`);
          }}
          onDelete={() => {
            setOpen(true);
            setId(item.id);
          }}
          id={item.id}
          class="pt-12 pb-10 px-6"
        >
          <div className="img">
            <img
              src={
                item?.profile ||
                "https://avatars.githubusercontent.com/u/22358125?v=4" // placeholder img
              }
              alt={`${item.fullName} profile`}
              height={100}
            />
          </div>

          <div className="details pl-7 inline-flex flex-col w-full">
            <h4 className="m-0">{item.fullName}</h4>
            {/* <span className="text-gray-label">{`${item.id.slice(
              0,
              7
            )}...${item.id.slice(-6)}`}</span> */}
            <span className="text-gray-label">{item.companyName}</span>
            <span className="text-gray-label">{formatToTitleCase(item.subscription?.tierType)}</span>
          </div>
        </Card>
      ))
    ) : (
      <p>{showText}</p>
    );
  
  useEffect(() => {
    dispatch(fetchAllProfileDetails());
  }, [dispatch]);
  
  return (
    <div>
      <Grid container className="my-6">
        <Grid item xs={6}>
          <h2 className="px-9 my-0">Customers</h2>
        </Grid>
        <Grid item xs={6} className="relative">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 z-10" />
          <TextField
            variant="outlined"
            className="pl-3 w-full pr-9 hover:border-gray-600 search-input"
            onChange={handleChange}
            placeholder="Name/Stake key..."
          />
        </Grid>
      </Grid>

      <Grid container className="py-5 px-9" justifyContent="space-between">
        {!loadingDetails && allUsers?.length === 0 && (
          <Typography className="text-center p-4">No data found</Typography>
        )}

        {loadingDetails && (
          <Box className="flex items-center justify-center p-8">
            <CircularProgress color="secondary" />
          </Box>
        )}

        {detailsSuccess
        ? searchField
          ? buildCards(filteredPersons(items), "No matching persons found!")
          : buildCards(items, "")
        : null}

        {/* Show loader while loading more results */}
        {hasNextPage && <div ref={infiniteRef}>Loading more...</div>}
      </Grid>

      <DeleteUserModal
        onClose={(id) => {
          setOpen(false);
          // TBD
        }}
        show={open}
        id={selectedId}
      />
    </div>
  );
};

export default SupportCommands;