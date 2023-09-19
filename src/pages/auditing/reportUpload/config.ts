export const REPORT_UPLOAD_FIELDS = {
    commonField: [
      {
        config: {
          options: [
            {
              label: "L0 Audit",
              value: 0,
            },
            {
              label: "L2 Certification",
              value: 2,
            },
          ],
          placeholder: "Certification Level",
          required: true,
          id: "certificationLevel",
        },
        componentType: "dropdown",
      },
      {
        config: {
          placeholder: "Summary",
          required: true,
          minRows: 4,
          maxRows: 4,
          id: "summary",
        },
        componentType: "textarea",
      },
      {
        config: {
          placeholder: "Disclaimer",
          required: true,
          minRows: 4,
          maxRows: 4,
          id: "disclaimer",
        },
        componentType: "textarea",
      },
      {
        config: {
          placeholder: "Subject",
          required: true,
          maxRows: 2,
          id: "subject",
        },
        componentType: "textarea",
      },
    ],
    auditorInfo: [
      {
        config: {
          label: "Name",
          type: "text",
          id: "name",
          required: true,
        },
        componentType: "text",
      },
      {
        config: {
          label: "Email",
          type: "text",
          id: "email",
          required: true,
        },
        componentType: "text",
      },
      {
        config: {
          label: "Website",
          type: "text",
          id: "website",
          required: true,
        },
        componentType: "text",
      },
      {
        config: {
          label: "Logo",
          type: "text",
          id: "logo",
        },
        componentType: "text",
      },
      {
        config: {
          label: "Github",
          type: "text",
          id: "github",
        },
        componentType: "text",
      },
      {
        config: {
          label: "Discord",
          type: "text",
          id: "discord",
        },
        componentType: "text",
      },
      {
        config: {
          label: "Twitter",
          type: "text",
          id: "twitter",
        },
        componentType: "text",
      },
    ],
    auditorReport: [
      {
        config: {
          placeholder: "Report URLs",
          required: true,
          maxRows: 2,
          id: "reportURL",
          tooltipText:
            "Enter comma(,) separatated JSON/PDF URLs or IPFS link corresponding to the report",
        },
        componentType: "textarea",
      },
    ],
    addScripts: {
      scriptFields: [
        {
          label: "Script Hash",
          type: "text",
          required: true,
          id: "scriptHash",
        },
        {
          label: "Contract Address",
          type: "text",
          required: false,
          id: "contractAddress",
        },
      ],
      smartContractInfo: [
        {
          label: "Era",
          type: "text",
          required: false,
          id: "era",
        },
        {
          label: "Complier",
          type: "text",
          required: false,
          id: "compiler",
        },
        {
          label: "Compiler Version",
          type: "text",
          required: false,
          id: "compilerVersion",
        },
        {
          label: "Optimizer",
          type: "text",
          required: false,
          id: "optimizer",
        },
        {
          label: "Optimizer Version",
          type: "text",
          required: false,
          id: "optimizerVersion",
        },
        {
          label: "Programming Language",
          type: "text",
          required: false,
          id: "progLang",
        },
        {
          label: "Repository URL",
          type: "text",
          required: false,
          id: "repoUrl",
        },
      ],
    },
  };