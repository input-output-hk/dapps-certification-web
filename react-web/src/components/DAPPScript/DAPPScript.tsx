import Button from "components/Button/Button";
import { Input } from "compositions/Form/components/Input";
import "./DAPPScript.scss";
import { useFormContext } from "react-hook-form";
import { fieldArrayName } from "pages/auditing/reportUpload/ReportUpload";

const DAPPScript = ({ remove, value, index }: any) => {
  const { register, watch } = useFormContext();
  const allScripts = watch(fieldArrayName);
  const length = !allScripts ? 1 : allScripts.length;

  return (
    <div
      className="bordered card-layout"
      style={{ paddingBottom: "20px", paddingTop: "50px" }}
      key={value.id}
    >
      <div className="bordered script-item relative">
        <div className="absolute action-button" style={{right: 0}}>
          <Button
            displayStyle="primary-outline"
            size="small"
            buttonLabel="- Remove Script"
            onClick={() => remove(index, { shouldFocus: true })}
            disabled={length === 1}
          />
        </div>

        <Input
          label="Script Hash"
          type="text"
          required={true}
          id={`scriptHash-${value.id}`}
          {...register(`${fieldArrayName}.${index}.scriptHash`)}
        />

        <Input
          label="Contract Address"
          type="text"
          required={true}
          id={`contractAddress-${value.id}`}
          {...register(`${fieldArrayName}.${index}.contractAddress`)}
        />

        <div className="inner-separator-label">SmartContract Information</div>

        <div className="smartcontract-info-section input-wrapper">
          <Input
            label="Era"
            type="text"
            id={`era-${value.id}`}
            {...register(`${fieldArrayName}.${index}.era`)}
          />

          <Input
            label="Complier"
            type="text"
            id={`compiler-${value.id}`}
            {...register(`${fieldArrayName}.${index}.compiler`)}
          />

          <Input
            label="Compiler Version"
            type="text"
            id={`compilerVersion-${value.id}`}
            {...register(`${fieldArrayName}.${index}.compilerVersion`)}
          />

          <Input
            label="Optimizer"
            type="text"
            id={`optimizer-${value.id}`}
            {...register(`${fieldArrayName}.${index}.optimizer`)}
          />

          <Input
            label="Optimizer Version"
            type="text"
            id={`optimizerVersion-${value.id}`}
            {...register(`${fieldArrayName}.${index}.optimizerVersion`)}
          />

          <Input
            label="Programming Language"
            type="text"
            id={`progLang-${value.id}`}
            {...register(`${fieldArrayName}.${index}.progLang`)}
          />

          <Input
            label="Repository URL"
            type="text"
            id={`repoUrl-${value.id}`}
            {...register(`${fieldArrayName}.${index}.repoUrl`)}
          />
        </div>
      </div>
    </div>
  );
};

export default DAPPScript;