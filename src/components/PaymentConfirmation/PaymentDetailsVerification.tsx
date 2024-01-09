import { BigNum } from "@emurgo/cardano-serialization-lib-browser";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormGroup, FormControlLabel, Checkbox, List, ListItem, ListItemText } from "@mui/material";
import { ISubscription } from "pages/landing";
import { useState } from "react";
  
import { useAppSelector } from "store/store";
import { formatToTitleCase } from "utils/utils";

import './PaymentDetailsVerification.css'

interface Props {
  content?: any;
  data: {
    fee: BigNum,
    subscription: ISubscription,
    profile: any
  } | undefined | null;
  onAccept: () => void;
}

const PaymentDetailsVerification = ( props: Props ) => {
  const [ disableAccept, setDisableAccept ] = useState<boolean>(true);

  const onCloseModal = () => {
    props.onAccept()
  }

  const handleConfirm = (event: any) => {
    setDisableAccept(!event.target.checked)
  }

  return (
    <Dialog open={true}>
      <DialogTitle>
        Verify Payment Details
      </DialogTitle>
      <DialogContent>
        <>
          <List className="px-[20px]">
            {props?.data?.profile && (<>
              <ListItem><ListItemText primary="Company Name" secondary={props?.data?.profile.companyName} /></ListItem>
              <ListItem><ListItemText primary="Full Name" secondary={props?.data?.profile.fullName} /></ListItem>
              <ListItem><ListItemText primary="Company Email" secondary={props?.data?.profile.email} /></ListItem>
              <ListItem><ListItemText primary="Contact Email" secondary={props?.data?.profile.contactEmail} /></ListItem>
            </>)}
            {props?.data?.subscription && (<>
              <ListItem><ListItemText primary="Subscription Type" secondary={formatToTitleCase(props?.data?.subscription.type)} /></ListItem>
              <ListItem><ListItemText primary="Tier" secondary={"Tier " + props?.data?.subscription.tierId}/></ListItem>
              <ListItem><ListItemText primary="Amount in USD" secondary={`$${Math.round(props?.data?.subscription.price/1000000*props?.data?.subscription.adaUsdPrice*100)/100}/year`} /></ListItem>              
              <ListItem><ListItemText primary="Amount in ADA" secondary={`₳ ${Math.round(props?.data?.subscription.price*100/1000000)/100}`} /></ListItem>
            </>)}  
          </List>
        </>
        {props.content}
        <p>
          IOG is not responsible for the actions, omissions, or accuracy of any third party for any loss or damage of any sort resulting from unauthorized use of your personal wallets at any point while using the Plutus Testing Tool.
        </p>
        <FormGroup>
          <FormControlLabel control={<Checkbox onChange={handleConfirm}/>} label="I confirm" />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" disabled={disableAccept} className="button-contained-main" onClick={onCloseModal}>
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PaymentDetailsVerification;