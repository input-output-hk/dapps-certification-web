import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { Box, Grid, Paper, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

import { sendReport } from "store/slices/reportUpload.slice";
import { resolver, getDefaultValues, informationFields, auditorFields } from "./utils";
import { removeEmptyStringsDeep, exportObjectToJsonFile } from "utils/utils";
import { useAppDispatch, useAppSelector } from "store/store";

import InputGroup from "compositions/InputGroup";
import Container from "compositions/InputGroup/components/Container";
import AuditReportForm from "./components/AuditReportForm";
import ReportScriptForm from "./components/ReportScriptForm";
import FeedbackModal from "./components/FeedbackModal";

import type { ReportForm } from "./interface";

import "./index.css";

interface Props {
  uuid?: string;
  standalone?: boolean;
  onClose?: () => void;
}

const CertificationMetadataForm = (props: Props) => {
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { profile } = useAppSelector((state) => state.profile);
  const { loading, success, errorMessage, onchain, offchain, subject, uuid } = useAppSelector((state) => state.reportUpload);

  const { control, register, handleSubmit, getFieldState, formState } = useForm<ReportForm>({ defaultValues: getDefaultValues(profile), resolver, mode: 'onBlur' });
  const { fields: scriptFields, append: appendScript, remove: removeScript } = useFieldArray({ name: 'scripts', control });
  const { fields: reportFields, append: appendReport, remove: removeReport } = useFieldArray({ name: 'report', control });

  useEffect(() => { if (submitted && success) setShowModal(true) }, [success, submitted]);
  useEffect(() => { if (submitted && errorMessage !== null) setShowModal(true) }, [errorMessage, submitted]);

  useEffect(() => {
    if (onchain !== null && offchain !== null && subject !== null && submitted) {
      exportObjectToJsonFile(offchain, `Off-Chain_${uuid ? uuid : subject}.json`);
      exportObjectToJsonFile(onchain, `On-Chain_${uuid ? uuid : subject}.json`);
      setSubmitted(false);
    }
  }, [onchain, offchain, subject, uuid, submitted]);

  const onSubmit = (form: ReportForm) => {
    setSubmitted(true);
    const request = removeEmptyStringsDeep(form) as ReportForm;
    dispatch(sendReport({
      request: {
        ...request,
        certificationLevel: parseInt(request.certificationLevel),
        report: {
          reportURLs: request.report.map(report => report.value),
        },
      },
      uuid: props.uuid
    }));
  }

  const onCloseModal = () => {
    if (!loading) {
      setShowModal(false);
      if (props.onClose) props.onClose();
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item md={12} lg={props.standalone ? 6 : 12}>
            <Box className="mb-4">
              <InputGroup
                title="Certification Information"
                fields={informationFields}
                formState={formState}
                register={register}
                getFieldState={getFieldState}
                standalone={props.standalone}
              />
            </Box>
            <Box className="mb-4">
              <InputGroup
                title="Auditor Information"
                fields={auditorFields}
                formState={formState}
                register={register}
                getFieldState={getFieldState}
                standalone={props.standalone}
              />
            </Box>
            <AuditReportForm
              formState={formState}
              register={register}
              getFieldState={getFieldState}
              reportFields={reportFields}
              appendReport={appendReport}
              removeReport={removeReport}
              standalone={props.standalone}
            />
          </Grid>
          <Grid item md={12} lg={props.standalone ? 6 : 12}>
            <ReportScriptForm
              formState={formState}
              register={register}
              getFieldState={getFieldState}
              scriptFields={scriptFields}
              appendScript={appendScript}
              removeScript={removeScript}
              standalone={props.standalone}
            />
            <Box className="mt-4">
              <Container standalone={props.standalone}>
                <Box className="text-right pt-4">
                  <Button
                    variant="outlined" size="large"
                    type="submit" className="button-outlined-highlighted"
                    endIcon={<SendIcon />}
                    disabled={loading}
                  >
                    Send Report
                  </Button>
                </Box>
              </Container>
            </Box>
          </Grid>
        </Grid>
      </form>

      <FeedbackModal
        show={loading||showModal}
        success={success}
        loading={loading}
        errorMessage={errorMessage}
        onClose={onCloseModal}
      />
    </>
  );
};

export default CertificationMetadataForm;