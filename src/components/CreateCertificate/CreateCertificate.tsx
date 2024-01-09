import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BigNum } from "@emurgo/cardano-serialization-lib-browser";

import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import CertificationMetadataForm from "components/CertificationMetadataForm";

import { useAppSelector } from "store/store";
import { payFromWallet } from "store/slices/walletTransaction.slice";
import { fetchDetails, submitCertificate  } from "store/slices/certificate.slice";
import { showSnackbar, clearSnackbar } from "store/slices/snackbar.slice";
import PaymentDetailsVerification from "components/PaymentConfirmation/PaymentDetailsVerification";

export interface Run {
  certificationPrice: number;
  commitDate: string;
  commitHash: string;
  created: string;
  finishedAt: string;
  repoUrl: string;
  reportContentId: string;
  runId: string;
  runStatus:
  | "queued"
  | "failed"
  | "succeeded"
  | "certified"
  | "ready-for-certification"
  | "aborted";
  syncedAt: string;
}

export interface Certificate {
  createdAt: string;
  runId: string;
  transactionId: string;
}

const CreateCertificate: React.FC<{ uuid: string; }> = ({ uuid }) => {
  const dispatch = useDispatch();
  const { features } = useAppSelector((state) => state.auth);
  const { walletAddress } = useAppSelector((state) => state.session);
  const { wallet } = useAppSelector((state) => state.walletConnection);
  const { profile } = useAppSelector((state) => state.profile);
  const { certificationPrice, performTransaction, transactionId } = useAppSelector((state) => state.certificate);

  const [ certifying, setCertifying ] = useState(false);
  const [ certified, setCertified ] = useState(false);
  const [ openModal, setOpenModal ] = useState(false);
  const [ openMetadataModal, setOpenMetadataModal ] = useState(false);
  const [ disableCertify, setDisableCertify ] = useState(false);
  const [ showVerificationModal, setShowVerificationModal ] = useState(false);

  useEffect(() => { dispatch(fetchDetails({ uuid })) }, []);

  useEffect(() => {
    if (transactionId !== null) {
      setOpenModal(true);
      setCertifying(false);
      setCertified(true);
    }
  }, [transactionId]);

  const onCloseModal = () => { setOpenModal(false) }

  const setMetadataModalStatus = (status: boolean) => {
    setOpenMetadataModal(status);
  }

  const onCloseMetadataForm = () => {
    setMetadataModalStatus(false);
  }

  const triggerSubmitCertificate = (txnId?: string) => {
    setCertifying(true);
    dispatch(submitCertificate({ uuid, transactionId: txnId }));
  }

  const handleError = (errorObj: any) => {
    let errorMsg = '';
    if (typeof errorObj === 'string') {
      errorMsg = errorObj + ' Please try again.';
    } else if (errorObj?.info) {
      errorMsg = errorObj.info + ' Please try again.';
    } else if (errorObj?.response?.message) {
      errorMsg = errorObj?.response.message + ' Please try again.';
    } else if (errorObj?.response?.data) {
      errorMsg = errorObj.response.statusText + ' - ' + errorObj.response.data;
    }
    dispatch(showSnackbar({
      message: errorMsg.length > 50 ? 'Something wrong occurred. Please try again later.' : errorMsg,
      severity: 'error'
    }));
    setCertifying(false);
    if (errorObj?.response?.status === 403) {
      setDisableCertify(true);
    }
  }

  const triggerGetCertificate = async () => {
    setCertifying(true);
    dispatch(clearSnackbar());
    if (performTransaction) {
      setShowVerificationModal(true)
    } else {
      triggerSubmitCertificate();
    }
  }
  
  const onPaymentDetailsVerified = async () => {
    setShowVerificationModal(false)
    const fee: BigNum = BigNum.from_str(certificationPrice!.toString())
    const response = await dispatch(
      payFromWallet({ fee: fee, wallet, walletAddress, payer: profile?.address })
    );
    if (response.payload) {
      triggerSubmitCertificate(response.payload);
    } else if (response?.error?.message) {
      handleError(response.error.message);
    }
  }

  const CertificateButton = () => {
    if (certified || disableCertify) return null;
    return (
      <LoadingButton
        variant="contained" size="large"
        className="button min-w-[200px]"
        onClick={() => triggerGetCertificate()}
        loading={certifying}
      >
        <span>{"Purchase a Certificate"+ (certificationPrice ? " (₳" + (certificationPrice/1000000).toString() + ")" : "")}</span>
      </LoadingButton>
    );
  }
  
  const TransactionModal = () => {
    if (!transactionId) return null;
    return (
      <Dialog open={openModal} onClose={onCloseModal}>
        <DialogTitle>Certification Successful</DialogTitle>
        <DialogContent>
          <span>
            View your certification broadcasted on-chain&nbsp;
            <a target="_blank" rel="noreferrer" href={`https://preprod.cardanoscan.io/transaction/${transactionId}`}>here</a>!
          </span>
        </DialogContent>
      </Dialog>
    );
  }
  
  const MetadataModal = () => {
    return (
      <Dialog open={openMetadataModal} onClose={onCloseMetadataForm} fullWidth maxWidth="md">
        <DialogTitle>Certification Metadata</DialogTitle>
        <DialogContent dividers>
          <CertificationMetadataForm
            uuid={uuid}
            isReviewCertification={true}
            onClose={onCloseMetadataForm}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <>
      {features?.indexOf("l2-upload-report") === -1 ? 
        <>
          <CertificateButton />
          <TransactionModal />
        </> : 
        <>
          <LoadingButton
            variant="contained" size="large"
            className="button min-w-[200px]"
            onClick={() => setMetadataModalStatus(true)}
            loading={certifying}
          >
            <span>Review Certification Metadata</span>
          </LoadingButton>
          <MetadataModal />
        </>
      }

      {showVerificationModal ? 
        <PaymentDetailsVerification onAccept={onPaymentDetailsVerified} data={null} />
      : null}
    </>

  );
}

export default CreateCertificate;