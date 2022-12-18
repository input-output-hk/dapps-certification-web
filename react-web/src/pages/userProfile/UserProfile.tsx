import React, { useState, useEffect } from "react";
import Button from "components/Button/Button";
import { Input } from "compositions/Form/components/Input";
import { Form } from "compositions/Form/Form";
import { postData } from "api/api";
import { getProfileDetails } from "store/slices/auth.slice";
import { useAppDispatch, useAppSelector } from "store/store";
import { useForm } from "hooks/useForm";
import "./UserProfile.scss";
import { userProfileSchema } from "./userProfile.schema";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userDetails } = useAppSelector((state: any) => state.auth);
  const [isEdit, setIsEdit] = useState(false);
  
  const form: any = useForm({
    schema: userProfileSchema,
    mode: "onChange",
  });

  useEffect(() => {
    const { dappOwner, dappRepository, company, vendor, linkedIn } =
      userDetails;
    form.reset({ dappOwner, dappRepository, company, vendor, linkedIn });

    if (!userDetails.dappOwner || !userDetails.dappRepository) {
      setIsEdit(true);
    }
  }, [userDetails, form]);

  const formHandler = (formData: any) => {
    const submitProfile = async () => {
      // FOR MOCK - await postData.get("static/data/current-profile.json", formData);
      await postData.put("/profile/current", formData);
      await dispatch(
        // FOR MOCK - getProfileDetails({url: "static/data/new-profile.json"})
        getProfileDetails()
      );
      navigate('/')
    };
    submitProfile();
  };

  return (
    <div id="profileContainer">
      <div>
        <Form form={form} onSubmit={formHandler}>
          <Input
            label="dApp Owner"
            disabled={!isEdit}
            type="text"
            disablefocus="true"
            {...form.register("dappOwner")}
          />
          <Input
            label="dApp Repository"
            disabled={!isEdit}
            type="text"
            disablefocus="true"
            {...form.register("dappRepository")}
          />
          <Input
            label="Company"
            type="text"
            id="company"
            disabled={!isEdit}
            disablefocus="true"
            {...form.register("company")}
          />
          <Input
            label="Vendor"
            type="text"
            id="vendor"
            disablefocus="true"
            disabled={!isEdit}
            {...form.register("vendor")}
          />
          <Input
            label="LinkedIn Url"
            type="text"
            id="linkedIn"
            disablefocus="true"
            disabled={!isEdit}
            {...form.register("linkedIn")}
          />
          <div className="button-wrapper">
            {!isEdit ? (
              <Button
                type="button"
                buttonLabel={"Edit"}
                onClick={(e) => {
                  setIsEdit(!isEdit);
                }}
              />
            ) : (
              <>
                <Button
                  type="button"
                  displayStyle="secondary"
                  buttonLabel={"Cancel"}
                  onClick={() => {
                    setIsEdit(false);
                  }}
                />
                <Button
                  disabled={!form.formState.isValid}
                  type="submit"
                  buttonLabel={"Save"}
                  onClick={() => {}}
                />
              </>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UserProfile;
