import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import InputGroup from "compositions/InputGroup";
import { useAppDispatch, useAppSelector } from "store/store";
import { useForm } from "react-hook-form";
import {
  IUpdateProfile,
  updateProfileDetails,
} from "store/slices/profile.slice";
import { resolver, userDetailsFields } from "../config";
import { removeEmptyStringsDeep, removeNullsDeep } from "utils/utils";

interface Props {
  title: string;
  show: boolean;
  onClose: (data?: any) => void;
}

const UserDetailsModal = (props: Props) => {
  const { loadingDetails: loading, selectedUser } = useAppSelector((state) => state.profile);
  const dispatch = useAppDispatch();
  const defaultValues = selectedUser
    ? removeNullsDeep(JSON.parse(JSON.stringify(selectedUser)))
    : null;

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState,
    getFieldState,
    getValues,
  } = useForm<IUpdateProfile>({ defaultValues, resolver, mode: "onBlur" });

  const onSubmit = (data: any) => {
    dispatch(
      updateProfileDetails({
        id: data.id,
        data: removeEmptyStringsDeep(JSON.parse(JSON.stringify(data))),
      })
    );
  };

  const cleanup = () => {
    reset(removeNullsDeep(JSON.parse(JSON.stringify(selectedUser))));
    clearErrors();
    props.onClose();
  };

  return (
    <Dialog open={props.show}>
      <DialogTitle className="inline-flex items-center">
        User Details
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="flex flex-col py-4 pb-8 items-center">
          {/* Show corresponding form fields based on selected card */}
          {/* {props.title === "profile" ? (
          <span>Profile details</span>
        ) : (
          <span>subscription</span>
        )} */}

          <InputGroup
            fields={userDetailsFields}
            formState={formState}
            register={register}
            getFieldState={getFieldState}
            getValues={getValues}
            standalone={true}
            disabled={loading}
          />
        </DialogContent>

        <DialogActions className="inline-flex justify-between px-6 pb-6 w-full">
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => cleanup()}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            variant="outlined"
            color="success"
            type="submit"
            disabled={!formState.isValid}
          >
            Confirm
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserDetailsModal;