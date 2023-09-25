import { ComponentProps, forwardRef, useEffect, useState } from "react";

import "./Input.scss";
import { useFormContext } from "react-hook-form";
import HelperText from "components/HelperText/HelperText";
import ArrowTooltip from "components/Tooltip/Tooltip";
import Icons from "components/Icons/Icons";
import classNames from "classnames";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  disabled?: boolean;
  disablefocus?: boolean;
  name: string;
  required?: boolean;
  error?: string;
  tooltipText?: string;
  showInfoIcon?: boolean;
  triggerOnBlur?: (e: any) => any
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    disabled = false,
    label,
    type = "text",
    className = "",
    disablefocus = false,
    name,
    required = false,
    value,
    id = "",
    error,
    showInfoIcon = false,
    tooltipText = "",
    triggerOnBlur = () => {},
    ...props
  },
  ref
) {
  const {
    formState: { errors },
    getValues
  } = useFormContext();

  const [active, setActive] = useState(false);
  const [timer, setTimer] = useState<any>(null);

  useEffect(() => {
    if (getValues(name)) {
      // field has values
      setActive(true);
    } else {
      // set field active if value empty and if not on focus
      if (
        document.activeElement !== document.getElementById(id || name || "")
      ) {
        setActive(false);
      }
    }

    // eslint-disable-next-line
  }, [getValues(name)]);

  return (
    <div
      className={classNames("input-wrapper relative", className, {
        disabled: disabled,
      })}
      onBlur={(e: any) => !e.target.value && setActive(false)}
      onClick={() => setActive(true)}
      data-testid={`${name}-wrapper`}
    >
      <div
        className={classNames("input bg-gray-inputBackground", {
          active: active,
          error: errors?.[name] || error,
          "!pr-10": tooltipText // increase right padding if tooltip is present
        })}
        onClick={(_) => {
          setActive(true);
          document.getElementById(id || name || "")?.focus();
        }}
        data-testid={`${name}-container`}
      >
        <label>
          {label} {required ? <span style={{ color: "red" }}>*</span> : null}
        </label>
        <input
          type={type}
          ref={ref}
          {...props}
          name={name}
          id={id || name}
          data-testid={name}
          value={value}
          onFocusCapture={() => setActive(true)}
          disabled={disabled}
          onInput={(e: any) => {
            if (timer) {
              clearTimeout(timer)
              setTimer(null);
            }
            const newTimer = setTimeout(() => {
              triggerOnBlur(e.target.value) 
            }, 400)
            setTimer(newTimer)
          }}
        />
      </div>

      {(errors?.[name] || error) && (
        <div style={{ marginTop: "4px" }}>
          {errors?.[name] && (
            <HelperText
              type="error"
              value={errors[name]?.message as string}
              showInfoIcon={showInfoIcon}
            />
          )}
          {error && (
            <HelperText
              type="error"
              value={error as string}
              showInfoIcon={showInfoIcon}
            />
          )}
        </div>
      )}

      {tooltipText ? (
        <ArrowTooltip
          title={tooltipText}
          tooltipWrapperStyle="!right-0 !top-0 bottom-0 !translate-y-0 inline-flex items-center px-2"
        >
          <Icons type="question" color="grey" />
        </ArrowTooltip>
      ) : null}
    </div>
  );
});
