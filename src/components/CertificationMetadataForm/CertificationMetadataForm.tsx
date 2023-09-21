import { useCallback, useEffect } from "react";
import Button from "components/Button/Button";
import { Form } from "compositions/Form/Form";
import { Input } from "compositions/Form/components/Input";
import DAPPScript, { IInfo } from "components/DAPPScript/DAPPScript";
import TextArea from "components/TextArea/TextArea";
import { Option } from "components/Dropdown/Dropdown";
import { useFieldArray } from "react-hook-form";
import Dropdown from "components/Dropdown/Dropdown";

export const fieldArrayName: string = "dAppScripts";

interface IFieldInfo {
  label: string;
  type: string;
  required: boolean;
  id: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  options?: Option[];
  tooltipText?: string;
}

interface FieldConfig {
  config: IFieldInfo;
  componentType: string;
  form: any;
}

export interface ICertificationMetadataForm {
  commonField: FieldConfig[];
  auditorInfo: FieldConfig[];
  auditorReport: FieldConfig[];
  addScripts: { scriptFields: IInfo[]; smartContractInfo: IInfo[] };
}

const Component = (props: FieldConfig) => {
  const { id, ...rest } = props.config;

  switch (props.componentType) {
    case "text":
      return (
        <Input
          id={props.config.id}
          {...props.form.register(props.config.id)}
          {...rest}
        />
      );
    case "textarea":
      return <TextArea {...props.form.register(props.config.id)} {...rest} />;
    case "dropdown":
      return (
        <Dropdown
          onOptionSelect={(option) =>
            props.form.setValue(props.config.id, option.value, {
              shouldValidate: true, // trigger on change validation manually
            })
          }
          {...props.form.register(props.config.id)}
          {...rest}
        />
      );
    default:
      return null;
  }
};

const CertificationMetadataForm: React.FC<{
  config: ICertificationMetadataForm;
  submitting: boolean;
  initData: any;
  form: any;
  onSubmit: (data: any) => any;
  onFormReset: () => void;
}> = ({ config, submitting, initData, form, onSubmit, onFormReset }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: fieldArrayName,
  });

  const addNewDappScript = () => {
    append(
      {
        scriptHash: "",
        contractAddress: "",
      },
      { shouldFocus: true }
    );
  };

  useEffect(() => {
    // to be called only once initially
    addNewDappScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeFormState = () => {
    form.clearErrors(); // clear form errors
    form.reset(initData);
  };

  useEffect(() => {
    initializeFormState();
    // initializeFormState() is to not to be triggered on every re-render of the dep-array below but whenever the form or userDetails is updated alone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, initData]);

  const shouldDisableAddScriptButton = useCallback(() => {
    return (
      !!form?.formState.errors?.[fieldArrayName] || // disable button if errors associated with dynamic form exists
      form
        .getValues(fieldArrayName)
        ?.some(
          (field: { scriptHash: any; contractAddress: any }) =>
            !field?.scriptHash || !field?.contractAddress
        )
    ); // prevent addition of new script boxes if the required field is empty
  }, [form]);

  return (
    <Form form={form} onSubmit={onSubmit}>
      {config.commonField.map((field, idx) => (
        <Component
          form={form}
          componentType={field.componentType}
          config={field.config}
          key={`commonField-${idx}`}
        />
      ))}

      {config.auditorInfo.length ? (
        <div className="separator-label">Auditor Information</div>
      ) : null}
      {config.auditorInfo.map((field, idx) => (
        <Component
          form={form}
          componentType={field.componentType}
          config={field.config}
          key={`auditorInfo-${idx}`}
        />
      ))}

      {config.auditorReport.length ? (
        <div className="separator-label">Audit Report</div>
      ) : null}
      {config.auditorReport.map((field, idx) => (
        <Component
          form={form}
          componentType={field.componentType}
          config={field.config}
          key={`auditorReport-${idx}`}
        />
      ))}

      <div className="separator-label">DApp Script</div>
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
            fieldArrayName={fieldArrayName}
            config={config.addScripts}
          />
        ))}
      </div>

      <div className="button-wrapper">
        <Button
          type="button"
          disabled={submitting}
          displayStyle="secondary"
          buttonLabel={"Cancel"}
          onClick={onFormReset}
        />

        <Button
          disabled={!form.formState.isValid}
          type="submit"
          buttonLabel={"Submit"}
          showLoader={submitting}
        />
      </div>
    </Form>
  );
};

export default CertificationMetadataForm;