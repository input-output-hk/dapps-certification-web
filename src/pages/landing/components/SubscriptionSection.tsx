import React, { useEffect, useState } from "react";

import { Box, Grid, Typography, Button } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchTiers } from "store/slices/tiers.slice";
import type { Tier } from "store/slices/tiers.slice";

import "../index.css";

interface Props {
  onSelectTier: (tier: Tier) => void
}

const SubscriptionSection = (props: Props) => {
  const dispatch = useAppDispatch();
  const { tiers } = useAppSelector((state) => state.tiers);
  const [tierId, setTierId] = useState<string|null>(null);

  useEffect(() => { 
    dispatch(fetchTiers({})); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (tier: Tier) => {
    setTierId(tier.id);
    props.onSelectTier(tier);
  }

  return (
    <Box className="white-box pt-24">
      <Box className="text-center">
        <Typography variant="h4" className="title-text mb-2">
          Testing Tool
        </Typography>
        <Typography variant="subtitle1" className="subtitle-text mb-16">
          Please choose a subscription
        </Typography>
        <Box className="w-[50vw] px-4">
          <Grid container spacing={2} justifyContent="center">
            {tiers.map(tier => (
              <Grid item xs={6} key={tier.id}>
                <Box className={tierId === tier.id ? 'subscription-active' : 'subscription'}>
                  <Typography variant="h5" className="subscription-title">
                    {tier.name}<br/>Premium Tier
                  </Typography>
                  <Typography variant="h2" className="subscription-price">
                    ${tier.usdPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" className="subscription-subtitle">
                    {tier.subtitle}
                  </Typography>
                  <Typography variant="body1" className="subscription-feature">
                    {tier.features.map(feature => (
                      <span key={feature.name}>{feature.name}<br/></span>
                    ))}
                  </Typography>
                  <Button
                    role="button"
                    variant="contained" size="large"
                    disabled={!tier.enabled}
                    className={`py-3 px-14 font-medium ${tierId !== tier.id ? 'button-contained-active' : 'button-contained-main'}`}
                    onClick={() => onSelect(tier)}
                  >
                    {tierId === tier.id ? 'SELECTED' : 'SELECT'}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default SubscriptionSection;