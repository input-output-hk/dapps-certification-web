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
    <div className="wrap">
      <section className="container">
        <div className="container__content">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
            quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
            mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
            Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad
            litora torquent per conubia nostra, per inceptos himenaeos.
            Curabitur sodales ligula in libero. Sed dignissim lacinia nunc.{" "}
          </p>
          <Link to="/static/sample.pdf" target="_blank" download>
            Download the Agreement
          </Link>
        </div>
        <div className="container__nav">
          <small>
            By clicking 'Accept' you are agreeing to our terms and conditions.
          </small>
          <button
            className="button"
            onClick={(e) => {
              acceptAgreement();
            }}
          >
            Accept
          </button>
        </div>
      </section>
    </div>
  );
}

export default Agreement;