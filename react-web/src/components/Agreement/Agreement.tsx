import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "store/store";
import { setLoginStatus } from "store/slices/auth.slice";
import "./Agreement.scss";

function Agreement() {
  const dispatch = useAppDispatch();
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
          
          <span>I hereby acknowledge and agree with this <Link to="/static/sample.pdf" target="_blank" download>
            NDA
          </Link></span>
        </div>
        <div className="container-nav">
          <button
            className="button"
            onClick={(e) => {
              acceptAgreement();
            }}
          >
            Accept
          </button>
        </div>
    </div>
  );
}

export default Agreement;