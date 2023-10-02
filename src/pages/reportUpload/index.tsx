import React from "react";

import { Container, Typography } from "@mui/material";
import CertificationMetadataForm from "components/CertificationMetadataForm";

import "./index.css";

const ReportUpload = () => {
  return (
    <Container className="py-4" maxWidth="xl">
      <Typography variant="h5" className="font-medium text-main mb-6">
        Upload an Audit Report
      </Typography>
      <CertificationMetadataForm standalone={true} />
    </Container>
  );
};

export default ReportUpload;