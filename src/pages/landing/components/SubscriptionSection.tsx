import React, { useEffect, useState } from "react";

import { Box, Typography, Button } from "@mui/material";

import { useAppDispatch, useAppSelector } from "store/store";
import { fetchTiers } from "../slices/tiers.slice";
import type { Tier } from "../slices/tiers.slice";

import "../index.css";

interface Props {
  onSelectTier: (tier: Tier) => void
}

export default (props: Props) => {
  const dispatch = useAppDispatch();
  const { tiers } = useAppSelector((state) => state.tiers);
  const [tierId, setTierId] = useState<string|null>(null);

  useEffect(() => { dispatch(fetchTiers({})); }, []);

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
        <Box className="flex flex-row px-2">
          {tiers.map(tier => (
            <div key={tier.id} className={tierId === tier.id ? 'subscription-active' : 'subscription'}>
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
                variant="contained" size="large"
                disabled={!tier.enabled}
                className={!tierId || tierId === tier.id ? 'subscription-button-active' : 'subscription-button'}
                onClick={() => onSelect(tier)}
              >
                {tierId === tier.id ? 'Selected' : 'Select'}
              </Button>
            </div>
          ))}
        </Box>
      </Box>
    </Box>
  );
}