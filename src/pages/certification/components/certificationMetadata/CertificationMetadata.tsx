import { useState } from "react";
import { useForm } from "hooks/useForm";

import Toast from "components/Toast/Toast";
import { certificationMetadataSchema } from "./certificationMetadata.schema";
import "./CertificationMetadata.scss";
import { useAppSelector } from "store/store";
import {
  IScriptObject,
  OffChainMetadataSchema,
} from "./certificationMetadata.interface";
import { fetchData } from "api/api";
import Modal from "components/Modal/Modal";
import { exportObjectToJsonFile } from "utils/utils";
import { CERTIFICATION_METADATA_FIELDS } from "./config";
import CertificationForm from "components/CertificationForm/CertificationForm";

export const fieldArrayName: string = "dAppScripts";

const CertificationMetadata: React.FC<{
    uuid: string,
    onCloseForm: () => void
}> = ({uuid = "", onCloseForm}) => {
  const { userDetails } = useAppSelector((state: any) => state.auth);
  const [openModal, setOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line
  const [showError, setShowError] = useState("");

  const form = useForm({
    schema: certificationMetadataSchema,
    mode: "all", // trigger validation for onBlur and onChange events
  });

  const onCloseModal = () => {
    setOpenModal(false);
    onCloseForm()
  };

  const transformDappScripts = (scripts: IScriptObject[]) => {
    return scripts.map((script: any) => {
      const { scriptHash, contractAddress, ...rest } = script;
      return({
        scriptHash: scriptHash,
        contractAddress: contractAddress,
        smartContractInfo: {
          ...rest,
        },
      });
    });
  };

  const formHandler = async (formData: any) => {
    const {
      subject,
      name,
      logo,
      email,
      website,
      twitter,
      summary,
      disclaimer,
      dAppScripts,
      discord,
      github,
    } = formData;

    const formattedDappScripts: IScriptObject[] =
      transformDappScripts(dAppScripts);

    const payload: OffChainMetadataSchema = {
      certificateIssuer: {
        name: name,
        logo: logo || "",
        social: {
          contact: email,
          discord: discord || "",
          twitter: twitter || "",
          github: github || "",
          website: website,
        },
      },
      disclaimer: disclaimer,
      scripts: formattedDappScripts,
      subject: subject,
      summary: summary,
    };

    setSubmitting(true);

    const response: any = await fetchData
      .post("/run/" + uuid + "/certificate", payload)
      .catch((errorObj) => {
        let errorMsg = "Something went wrong. Please try again.";
        if (errorObj?.response?.data) {
          errorMsg =
            errorObj.response.statusText + " - " + errorObj.response.data;
        }
        setShowError(errorMsg);
        const timeout = setTimeout(() => {
          clearTimeout(timeout);
          setShowError("");
        }, 5000);
        setSubmitting(false);
      });
    setShowError("");
    setOpenModal(true);
    exportObjectToJsonFile(response.data.offchain, "Off-Chain_" + uuid + ".json");
    exportObjectToJsonFile(response.data.onchain, "On-Chain_" + uuid + ".json");
    setSubmitting(false);
  };

  return (
    <>
      <div id="certificationMetadataFormContainer" className="certificate-metadata-form">
        <CertificationForm
          config={CERTIFICATION_METADATA_FIELDS as any}
          submitting={submitting}
          initData={{
            twitter: userDetails?.twitter,
            website: userDetails?.website,
          }}
          form={form}
          onSubmit={formHandler}
          onFormReset={() => {
            form.reset();
            onCloseModal();
          }}
        />
      </div>

      {showError ? <Toast message={showError} /> : null}

      <Modal
        open={openModal}
        title="Certification Metadata Uploaded"
        onCloseModal={onCloseModal}
        modalId="verificationSuccessModal"
      >
        <p style={{ marginBottom: "2rem" }}>
          Successfully submitted Certification Metadata. <br />
          <br />
          Both off-chain and on-chain certificates will be downloaded at once
          now.
        </p>
      </Modal>
    </>
  );
};

export default CertificationMetadata;