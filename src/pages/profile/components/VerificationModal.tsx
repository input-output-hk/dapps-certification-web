import React, { useState } from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Button } from "@mui/material";

import "../index.css";

interface Props {
  show: boolean;
  loading: boolean;
  fetched: boolean;
  verified: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const VerificationModal = (props: Props) => {
  const [connect, setConnect] = useState<boolean>(false);

  const handleClose = () => {
    props.onClose();
    setTimeout(() => setConnect(false), 1000);
  }

  const handleConnect = () => {
    props.onConnect();
    setTimeout(() => setConnect(false), 1000);
  }

  return (
    <Dialog open={props.show} onClose={handleClose}>
      <DialogTitle>
        {props.loading ? 'Verifying repository access...' : null}
        {props.verified ? 'Successfully verified repository access' : null}
        {!props.verified && props.fetched && !connect ? 'Error verifying repository access' : null}
        {!props.verified && props.fetched && connect ? 'Private Repository Access Disclaimer' : null}
      </DialogTitle>
      <DialogContent className="flex flex-col items-center">
        {!props.loading ? (
          <Typography>
            {!props.verified && props.fetched && !connect ? 'Unable to find the entered repository. Please go back and correct the Owner/Repository. Or, is this a Private one? If so, please hit Connect to authorize us to access it!' : null}
            {!props.verified && props.fetched && connect ? 'Auditors need to obtain consent from their customers and acquire the necessary permissions to fork their private Github repositories in order to test the decentralized application (dApp) using the Plutus Testing Tool, created by Input Output Global, Inc (IOG). The Plutus Testing Tool is available on an “AS IS” and “AS AVAILABLE” basis, without any representation or warranties of any kind. IOG is not responsible for the actions, omissions, or accuracy of any third party for any loss or damage of any sort resulting from the forking of repositories and testing of dApps using the Plutus Testing Tool.' : null}
          </Typography>
        ) : (
          <CircularProgress color="secondary" size={50} />
        )}
      </DialogContent>
      {!props.loading && (
        <DialogActions>
          <Button variant="contained" className="button-contained-main" onClick={handleClose}>
            Close
          </Button>
          {!props.verified && props.fetched && !connect && (
            <Button variant="contained" color="success" className="normal-case" onClick={() => setConnect(true)}>
              Connect
            </Button>
          )}
          {!props.verified && props.fetched && connect && (
            <Button variant="contained" color="success" className="normal-case" onClick={handleConnect}>
              Agree
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default VerificationModal;