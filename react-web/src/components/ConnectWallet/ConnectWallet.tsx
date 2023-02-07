import React, { useEffect, useState, useCallback } from "react";
import './ConnectWallet.scss';
import Modal from "components/Modal/Modal";
import Button from "components/Button/Button";
import Agreement from "components/Agreement/Agreement";

import { useAppDispatch, useAppSelector } from "store/store";
import { getProfileDetails } from "store/slices/auth.slice";

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
    const [address, setAddress] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [agreementModal, setAgreementModal] = useState(false);

    const openConnectWalletModal = useCallback(() => setIsOpen(true),[])

    const onCloseModal = useCallback(() => setIsOpen(false),[]) 

    const loadWallet = async (walletName: string) => {
        try {
            const enabledWallet = await CardanoNS[walletName].enable();
            setWallet(enabledWallet)
            if (enabledWallet) {
                setAddress(await enabledWallet.getChangeAddress())
            }
        } catch (err) {
            // do nothing
            console.log(err);
        }
    }

    useEffect(() => {
        if (address !== null && userDetails.dapp === null) {
          setIsOpen(false);
          setAgreementModal(true);
        }
    }, [userDetails, address]);

    useEffect(() => {
        if (address) {
            dispatch(getProfileDetails({"address": address, "wallet": wallet}))            
        }
    }, [dispatch, address, wallet])

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
                </div>
            </Modal>
            <Modal
                open={agreementModal}
                title="Agreement"
                onCloseModal={() => {
                setAgreementModal(false);
                }}
            >
                <Agreement />
            </Modal>
        </>
    )
}

export default ConnectWallet;