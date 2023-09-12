import { useState } from "react";
import { useForm } from "hooks/useForm";
import { useNavigate } from "react-router-dom";

import Toast from "components/Toast/Toast";
import { reportUploadSchema } from "./reportUpload.schema";
import { useAppSelector } from "store/store";
import {
  IScriptObject,
  OffChainMetadataSchema,
} from "./reportUpload.interface";
import { fetchData } from "api/api";
import Modal from "components/Modal/Modal";
import { exportObjectToJsonFile } from "utils/utils";
import { REPORT_UPLOAD_FIELDS } from "./config";
import CertificationForm from "components/CertificationForm/CertificationForm";

import "./ReportUpload.scss";

export const fieldArrayName: string = "dAppScripts";

const ReportUpload = () => {
  const navigate = useNavigate();
  const { userDetails } = useAppSelector((state: any) => state.auth);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line
  const [showError, setShowError] = useState("");

  const form = useForm({
    schema: reportUploadSchema,
    mode: "all", // trigger validation for onBlur and onChange events
  });

  const onCloseModal = () => {
    setOpenModal(false);
    navigate(-1);
  };

  const transformDappScripts = (scripts: []) => {
    const formattedScripts: IScriptObject[] = [];
    scripts.forEach((script: any) => {
      const { scriptHash, contractAddress, ...rest } = script;
      formattedScripts.push({
        scriptHash: scriptHash,
        contractAddress: contractAddress,
        smartContractInfo: {
          ...rest,
        },
      });
    });
    return formattedScripts;
  };

  const formHandler = async (formData: any) => {
    const {
      subject,
      certificationLevel,
      name,
      logo,
      email,
      website,
      twitter,
      reportURL,
      summary,
      disclaimer,
      dAppScripts,
    } = formData;

    const formattedDappScripts: IScriptObject[] =
      transformDappScripts(dAppScripts);

    const payload: OffChainMetadataSchema = {
      subject: subject,
      schemaVersion: 1,
      certificationLevel: parseInt(certificationLevel),
      certificateIssuer: {
        name: name,
        logo: logo,
        social: {
          contact: email,
          link: website,
          twitter: twitter || "",
          github: website,
          website: website,
        },
      },
      report: reportURL.replace(/\s+/g, "").split(","),
      summary: summary,
      disclaimer: disclaimer,
      scripts: formattedDappScripts,
    };

    setSubmitting(true);

    await fetchData
      .post("/auditor/reports", payload)
      .then(response => {
        if (response.status === 204) {
          throw Error()
        }
        if (response?.data) {
          setShowError("");
          setOpenModal(true);
          exportObjectToJsonFile(response.data.offchain, "Off-Chain_" + subject + ".json");
          exportObjectToJsonFile(response.data.onchain, "On-Chain_" + subject + ".json");
        }
        setSubmitting(false);
      })
      .catch((errorObj) => {
        let errorMsg = "Something went wrong. Please try again.";
        if (errorObj?.response?.data) {
          errorMsg =
            (errorObj.response.statusText || 'Error') + " - " + errorObj.response.data;
        }
        setShowError(errorMsg);
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          setShowError("");
        }, 5000);
        setSubmitting(false);
      });
  };

  return (
    <>
      <h2>Upload an Audit Report</h2>
      <div id="auditReportUploadContainer" className="certificate-metadata-form">
        <CertificationForm
          config={REPORT_UPLOAD_FIELDS as any}
          submitting={submitting}
          initData={{
            twitter: userDetails?.twitter,
            website: userDetails?.website,
          }}
          form={form}
          onSubmit={formHandler}
          onFormReset={() => {
            form.reset();
          }}
        />
      </div>

      {showError ? <Toast message={showError} /> : null}

      <Modal
        open={openModal}
        title="Auditor Report Uploaded"
        onCloseModal={onCloseModal}
        modalId="subscriptionSuccessModal"
      >
        <p style={{ marginBottom: "2rem" }}>
          Successfully submitted Auditor Report. <br />
          <br />
          Both off-chain and on-chain certificates will be downloaded at once
          now.
        </p>
      </Modal>
    </>
  );
};

export default ReportUpload;