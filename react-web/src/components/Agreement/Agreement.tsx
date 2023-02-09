import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useAppDispatch } from "store/store";
import { setLoginStatus } from "store/slices/auth.slice";
import "./Agreement.scss";
import Button from "components/Button/Button";

function Agreement() {
  const dispatch = useAppDispatch();
  const [agree, setAgree] = useState(false);
  const acceptAgreement = () => {
    dispatch(setLoginStatus());
  };
  return (
    <div className="nda-container">
        <div className="container-content">
          <p>
            Welcome to the Early Access Program for our new Plutus Testing Tool.
            As a participant in this program, you will have the opportunity to
            test and provide feedback on our MVPs before it is released to the
            general public. Please be aware that by participating in this
            program, you are required to sign and acknowledge a non-disclosure
            agreement (NDA) before proceeding with the sign-up process. The NDA
            is necessary to protect the confidential information shared during
            the testing phase. Thank you for your understanding and
            participation.
          </p>
          
          <span>I hereby acknowledge and agree with this <Link to="/static/sample.pdf" target="_blank" download>NDA</Link></span>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agree}
                  onChange={(e) => {
                    setAgree(!agree);
                  }}
                />
              }
              label="I agree"
            />
          </FormGroup>
        </div>
        <div className="container-nav">
          <Button
            type="button"
            buttonLabel="Next"
            disabled={!agree}
            onClick={(_) => acceptAgreement()}
          />
        </div>
    </div>
  );
}

export default Agreement;