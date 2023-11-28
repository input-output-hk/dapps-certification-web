import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
  
import { useAppDispatch, useAppSelector } from "store/store";
import { logout } from "store/slices/auth.slice";

const ReconnectWallet = () => {
    const dispatch = useAppDispatch();
    const { resetWalletChanges } = useAppSelector((state) => state.walletConnection);

    const onCloseModal = () => {
        dispatch(logout({}))
    }

    return (
        <Dialog open={resetWalletChanges} onClose={onCloseModal}>
            <DialogTitle>
                Reconnect to your Wallet
            </DialogTitle>
            <DialogContent>
                The wallet or wallet network has changed in your browser extension. Please reconnect to the proper wallet.
            </DialogContent>
            <DialogActions>
                <Button variant="contained" className="button-contained-main" onClick={onCloseModal}>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReconnectWallet