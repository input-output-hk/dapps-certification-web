import React, { useEffect, useState, useCallback } from "react";
import { Address } from "@emurgo/cardano-serialization-lib-browser";

import Modal from "components/Modal/Modal";
import Button from "components/Button/Button";
import Agreement from "components/Agreement/Agreement";
import Loader from "components/Loader/Loader";

import { useAppDispatch, useAppSelector } from "store/store";
import { getProfileDetails, logout } from "store/slices/auth.slice";

import './ConnectWallet.scss';

const wallets: Array<string> = ['lace', 'nami', 'yoroi']

declare global {
    interface Window {
        cardano:any;
    }
}
let CardanoNS = window.cardano;

const ConnectWallet = () => {
    const dispatch = useAppDispatch();
    const { userDetails } = useAppSelector((state) => state.auth);
    const [wallet, setWallet] = useState(null)
    const [walletName, setWalletName] = useState("")
    const [address, setAddress] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [agreementModal, setAgreementModal] = useState(false);

    const resetStates = () => {
        setWallet(null)
        setAddress("")
        setAgreementModal(false);
    }
    const [walletLoading, setWalletLoading] = useState(false)

    const openConnectWalletModal = useCallback(() => setIsOpen(true),[])

    const onCloseModal = useCallback(() => setIsOpen(false),[]) 

    const loadWallet = async (walletName: string) => {
        try {
            setWalletLoading(true)
            const enabledWallet = await CardanoNS[walletName].enable();
            setWallet(enabledWallet)
            setWalletName(walletName)
            if (enabledWallet) {
                const response = await enabledWallet.getChangeAddress()
                setAddress(Address.from_bytes(Buffer.from(response, "hex")).to_bech32())
            }
        } catch (e) { handleError(e); }
    }

    const handleError = (err: any) => {
        console.log(err)
    }

    const onCloseAgreementModal = () => {
        resetStates()
        dispatch(logout())
    }

    useEffect(() => {
        if (address !== null && userDetails.dapp === null) {
          setIsOpen(false);
          setAgreementModal(true);
        }
    }, [userDetails, address]);

    useEffect(() => {
        if (address) {
            (async () => {
                try {
                    const response: any = await dispatch(getProfileDetails({"address": address, "wallet": wallet, "walletName": walletName})).catch(handleError)
                    setWalletLoading(false)
                } catch(error) {
                    setWalletLoading(false)
                    handleError(error)
                    // dispatch(clearCache()) 
                }
            })()
        }
    }, [dispatch, address, wallet, walletName])

    return (
        <>
            <Button
                type="button"
                displayStyle="gradient"
                buttonLabel={"Connect Wallet"}
                onClick={openConnectWalletModal}
            />
            <Modal open={isOpen} title="Connect a wallet" onCloseModal={onCloseModal}>
                <div id="walletsContainer">
                    {wallet ? 
                        null : !CardanoNS ? (<span>No wallet extensions installed yet!</span>) :
                        wallets.map((wallet: string, index: number) => {
                            if (CardanoNS && CardanoNS[wallet]) {
                                return (
                                    <div className="card" key={index} onClick={(_) => loadWallet(wallet)}>
                                        <img src={CardanoNS[wallet].icon} alt={CardanoNS[wallet].name} />
                                        <span>{CardanoNS[wallet].name}</span>
                                    </div>
                                )
                            } else {
                                return null
                            }
                        })
                    }
                    { walletLoading ? <Loader /> : null}
                </div>
            </Modal>
            <Modal
                open={agreementModal}
                title="Agreement"
                onCloseModal={() => { onCloseAgreementModal() }}
            >
                <Agreement />
            </Modal>
        </>
    )
}

export default ConnectWallet;