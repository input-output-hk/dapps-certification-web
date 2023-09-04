import * as yup from "yup";

export const certificationMetadataSchema = yup.object().shape(
  {
    summary: yup.string().required("This field is required"),
    disclaimer: yup.string().required("This field is required"),
    subject: yup
      .string()
      .required("This field is required")
      .max(64, "Please enter upto 64 characters")
      .matches(
        /^[0-9a-zA-Z_]+$/,
        "Enter a valid subject name (a-z, A-Z, 0-9 or _ characters only)."
      ),
    name: yup.string().required("This field is required"),
    email: yup
      .string()
      .required("This field is required")
      .email("Please verify the characters entered"),
    discord: yup
      .string()
      .matches(
        /^(?:https?:\/\/)?discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[\w-]+$/,
        {
          message: "Please verify the characters entered",
          excludeEmptyString: true,
        }
      ),
    github: yup
      .string()
      .matches(/^(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/[\w-]+$/, {
        message: "Please enter a valid GitHub URL",
        excludeEmptyString: true,
      }),
    logo: yup
      .string()
      .matches(
        /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})\.(?:jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif)$/,
        {
          message: "Please verify the characters entered",
          excludeEmptyString: true,
        }
      ),
    twitter: yup.string().when("twitter", (value) => {
      if (value) {
        return yup.string().matches(/^@\w{1,15}$/, {
          message: "Please verify the characters entered",
          excludeEmptyString: true,
        });
      } else {
        return yup
          .string()
          .transform((val, originalVal) => (!val ? null : originalVal))
          .nullable()
          .optional();
      }
    }),
    website: yup
      .string()
      .required("This field is required")
      .matches(
        /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/,
        "Please verify the characters entered"
      ),
    dAppScripts: yup.array().of(
      yup.object({
        scriptHash: yup
          .string()
          .required("This field is required")
          .matches(
            /[0-9a-fA-F]{64}/,
            "Please verify the 64 characters entered"
          ),
        contractAddress: yup.string().required("This field is required"),
        era: yup.string(),
        compiler: yup.string(),
        compilerVersion: yup.string(),
        optimizer: yup.string(),
        optimizerVersion: yup.string(),
        progLang: yup.string(),
        repoUrl: yup
          .string()
          .matches(/^(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/[\w.-]+$/, {
            message: "Please verify the characters entered",
            excludeEmptyString: true,
          }),
      })
    ),
  },
  [["twitter", "twitter"]]
);