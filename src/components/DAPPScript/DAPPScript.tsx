import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@mui/material";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// import Button from "components/Button/Button";
import { Input } from "compositions/Form/components/Input";

import "./DAPPScript.scss";

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
  const { register, watch, formState: { errors } } = useFormContext();
  const allScripts = watch(fieldArrayName);
  const length = !allScripts ? 1 : allScripts.length;
  const [error, setError] = useState<any>([]);

  // Deeply nested errors to be captured on every component change
  useEffect(() => {
    if (errors?.[fieldArrayName]) {
      setError(errors?.[fieldArrayName]);
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors?.[fieldArrayName]]);

  return (
    <div className="bordered card-layout card-padding" key={value.id}>
      <div className="bordered script-item relative">
        <div className="absolute action-button" style={{ right: 0 }}>
          {length > 1 && (
            <Button
                type="button"
                variant="outlined" size="small"
                onClick={() => remove(index, { shouldFocus: true })}
                className="button-outlined text-sm"
                startIcon={<RemoveCircleOutlineIcon />}
            >Remove Script</Button>
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
            error={error?.[index]?.[field.id]?.message}
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
              error={error?.[index]?.[field.id]?.message}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DAPPScript;