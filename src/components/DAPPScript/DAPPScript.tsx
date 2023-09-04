import Button from "components/Button/Button";
import { Input } from "compositions/Form/components/Input";
import "./DAPPScript.scss";
import { useFormContext } from "react-hook-form";

export interface IInfo {
  label: string;
  type: string;
  required: boolean;
  id: string;
}

interface DAPPScriptProps {
  remove: (index: number, options?: { shouldFocus: boolean }) => void;
  value: { id: string };
  index: number;
  fieldArrayName: string;
  config: { scriptFields: IInfo[]; smartContractInfo: IInfo[] };
}

const DAPPScript = ({
  remove,
  value,
  index,
  fieldArrayName,
  config,
}: DAPPScriptProps) => {
  const { register, watch } = useFormContext();
  const allScripts = watch(fieldArrayName);
  const length = !allScripts ? 1 : allScripts.length;

  return (
    <div className="bordered card-layout card-padding" key={value.id}>
      <div className="bordered script-item relative">
        <div className="absolute action-button" style={{ right: 0 }}>
          {length > 1 && (
            <Button
              displayStyle="primary-outline"
              size="small"
              buttonLabel="- Remove Script"
              onClick={() => remove(index, { shouldFocus: true })}
            />
          )}
        </div>

        {config.scriptFields.map((field, idx) => (
          <Input
            label={field.label}
            type={field.type}
            required={field.required}
            id={`${field.id}-${value.id}`}
            {...register(`${fieldArrayName}.${index}.${field.id}`)}
            key={`scriptFields-${value.id}-${idx}`}
          />
        ))}

        <div className="inner-separator-label">SmartContract Information</div>

        <div className="smartcontract-info-section input-wrapper">
          {config.smartContractInfo.map((field, idx) => (
            <Input
              label={field.label}
              type={field.type}
              required={field.required}
              id={`${field.id}-${value.id}`}
              {...register(`${fieldArrayName}.${index}.${field.id}`)}
              key={`smartContractInfo-${value.id}-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DAPPScript;