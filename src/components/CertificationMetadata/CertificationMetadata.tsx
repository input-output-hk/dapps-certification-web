const CertificationMetadata = () => {


  return (
    <>
      <h2>Certification Metadata</h2>
      <div id="certificationMetadataContainer">
        <Form form={form} onSubmit={formHandler}>

          <TextArea
            placeholder="Summary"
            required={true}
            minRows={4}
            maxRows={4}
            {...form.register("summary")}
          />

          <TextArea
            placeholder="Disclaimer"
            required={true}
            minRows={4}
            maxRows={4}
            {...form.register("disclaimer")}
          />

          <TextArea
            placeholder="Subject"
            required={true}
            maxRows={2}
            {...form.register("subject")}
          />

          <div className="separator-label">Auditor Information</div>
          <Input
            label="Name"
            type="text"
            id="name"
            required={true}
            {...form.register("name")}
          />

          <Input
            label="Website"
            type="text"
            id="website"
            required={true}
            {...form.register("website")}
          />

          <Input
            label="Email"
            type="text"
            id="email"
            required={true}
            {...form.register("email")}
          />

          <Input
            label="Logo"
            type="text"
            id="logo"
            {...form.register("logo")}
          />

          <Input
            label="Discord"
            type="text"
            id="discord"
            {...form.register("discord")}
          />

          <Input
            label="Twitter"
            type="text"
            id="twitter"
            {...form.register("twitter")}
          />

          <div className="separator-label">DAPP Script</div>
          <div className="relative">
            <div className="absolute action-button addScript-btn">
              <Button
                displayStyle="primary-outline"
                size="small"
                buttonLabel="+ Add Script"
                type="button"
                disabled={shouldDisableAddScriptButton()}
                onClick={() => {
                  addNewDappScript();
                }}
              />
            </div>

            {fields.map((field, index) => (
              <DAPPScript
                key={field.id}
                remove={remove}
                value={field}
                index={index}
              />
            ))}
          </div>

          <div className="button-wrapper">
            <Button
              type="button"
              disabled={submitting}
              displayStyle="secondary"
              buttonLabel={"Cancel"}
              onClick={() => {
                form.reset();
                onCancel();
              }}
            />

            <Button
              disabled={!form.formState.isValid}
              type="submit"
              buttonLabel={"Submit"}
              showLoader={submitting}
            />
          </div>
        </Form>
      </div>
      {showError ? <Toast message={showError} /> : null}
      <Modal
        open={openModal}
        title="Certification Metadata Submitted"
        onCloseModal={onCloseModal}
        modalId="successModal"
      >
        <p style={{ marginBottom: "2rem" }}>
          Successfully submitted Certification Metadata. <br />
          <br />
          Both off-chain and on-chain certificate metadata will be downloaded at once
          now.
        </p>
      </Modal>
    </>
  );
};

export default CertificationMetadata;
