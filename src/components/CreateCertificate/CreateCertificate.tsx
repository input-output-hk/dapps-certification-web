import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/store";

import LoadingButton from '@mui/lab/LoadingButton';

import Modal from "components/Modal/Modal";

import { BigNum } from '@emurgo/cardano-serialization-lib-browser';

import Toast from "components/Toast/Toast";
import { fetchData } from "api/api";
import { payFromWallet } from "store/slices/walletTransaction.slice";
import { Alert, Snackbar } from "@mui/material";

export interface Run {
    "certificationPrice": number,
    "commitDate": string;
    "commitHash": string;
    "created": string;
    "finishedAt": string;
    "repoUrl": string;
    "reportContentId": string;
    "runId": string;
    "runStatus": "queued" | "failed" | "succeeded" | "certified" | "ready-for-certification" | "aborted";
    "syncedAt": string;
}

interface Certificate {
    "createdAt": string;
    "runId": string;
    "transactionId": string;
}

const CreateCertificate: React.FC<{ uuid: string; }> = ({ uuid }) => {
    const dispatch = useDispatch();
    const { walletAddress: address, wallet, profile } = useAppSelector((state) => state.auth);
    const [ certifying, setCertifying ] = useState(false);
    const [ certified, setCertified ] = useState(false);
    const [ transactionId, setTransactionId ] = useState("")
    const [ showError, setShowError ] = useState("");
    const [ openModal, setOpenModal ] = useState(false);
    const [ disableCertify, setDisableCertify ] = useState(false);
    const [certificationPrice, setCertificationPrice] = useState(0);
    const [performTransaction, setPerformTransaction] = useState(true);

    // to run only once initially
    useEffect(() => {
        fetchData.get('/profile/current/balance').then(response => {
            const availableProfileBalance: number = response.data
            fetchData.get('/run/' + uuid + '/details').then(res => {
                const runDetails: Run = res.data
                setCertificationPrice(runDetails.certificationPrice);
                setPerformTransaction((availableProfileBalance >= 0 && (availableProfileBalance - runDetails.certificationPrice) < 0) ? true : false)
            })
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    const onCloseModal = () => { setOpenModal(false) }

    const handleError = (errorObj: any) => {
        let errorMsg = ''
        if (typeof errorObj === 'string') {
            errorMsg = errorObj + ' Please try again.'
        } else if (errorObj?.info) {
            errorMsg = errorObj.info + ' Please try again.'
        } else if (errorObj?.response?.message) {
            errorMsg = errorObj?.response.message + ' Please try again.'
        } else if (errorObj?.response?.data) {
            errorMsg = errorObj.response.statusText + ' - ' + errorObj.response.data 
        }
        setShowError(errorMsg.length > 50 ? 'Something wrong occurred. Please try again later.' : errorMsg);
        const timeout = setTimeout(() => { clearTimeout(timeout); setShowError("") }, 5000)
        setCertifying(false);
        if (errorObj?.response?.status === 403) {
            setDisableCertify(true)
        }
    }

    const certificationBroadcasted = (data: Certificate) => {
        console.log('broadcasted tnx data ', data);
        setTransactionId(data.transactionId)
        setOpenModal(true)
        setCertifying(false)
        setCertified(true)
    }

    const fetchRunDetails = async (txnId?: string) => {
        fetchData.get('/run/' + uuid + '/details').then(response => {
            const details: Run = response.data
            if (details?.runStatus === 'ready-for-certification') {
                const timeout = setTimeout(async ()=> {
                    clearTimeout(timeout)
                    fetchRunDetails()
                }, 1000)
            } else if (details?.runStatus === 'certified') {
                fetchData.get('/run/' + uuid + '/certificate' + (txnId ? '?transactionid=' + txnId : ''))
                    .catch(handleError)
                    .then((response: any) => {
                        certificationBroadcasted(response.data)
                    })
            }
        })
    }

    const triggerSubmitCertificate = async (txnId?: string) => {
        fetchData.post('/run/' + uuid + '/certificate' + (txnId ? '?transactionid=' + txnId : ''))
            .catch(handleError)
            .then(() => {
                fetchRunDetails(txnId)
            })
    }

    const triggerGetCertificate = async () => {
        setCertifying(true);
        setShowError("")
        if (performTransaction) {
            const response = await dispatch(
                payFromWallet({ fee: BigNum.from_str(certificationPrice.toString()), wallet, address, payer: profile?.address , })
            );
            if (response.payload) {
                triggerSubmitCertificate(response.payload)
            } else if (response?.error?.message) {
                handleError(response.error.message);
            }
        } else {
            triggerSubmitCertificate()
        }
    }

    return (<>
        {certified || disableCertify ? null : (
        <LoadingButton
            variant="contained" size="large"
            className="button min-w-[200px]"
            onClick={() => triggerGetCertificate()}
            loading={certifying}
        >
            <span>{"Purchase a Certificate"+ (certificationPrice ? " (₳" + (certificationPrice/1000000).toString() + ")" : "")}</span>
        </LoadingButton>)}
        {transactionId ? (
            <Modal open={openModal} title="Certification Successful" onCloseModal={onCloseModal}>
                <span>
                    View your certification broadcasted on-chain&nbsp;
                    <a target="_blank" rel="noreferrer" href={`https://preprod.cardanoscan.io/transaction/${transactionId}`}>here</a>!
                </span>
            </Modal>
        ): null}
        {/* {showError ? <Toast message={showError} /> : null} */}
        
        <Snackbar
            open={showError ? true : false}
            autoHideDuration={5000}
            onClose={() => setShowError("")}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert
            severity="error" variant="filled"
            onClose={() => setShowError("")}
            >
                {showError}
            </Alert>
        </Snackbar>
    </>);
}

export default CreateCertificate;
