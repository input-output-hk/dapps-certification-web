import * as yup from "yup";

export const FILE_SIZE = 5;
export const SUPPORTED_FORMATS = [".pdf"];
export const allowedTypes = ["application/pdf"];

export const reportUploadSchema = yup.object().shape({
  certificationLevel: yup.string().required("This field is required"),
  summary: yup
    .string()
    .required("This field is required"),
  disclaimer: yup
    .string()
    .required("This field is required"),
  subject: yup
    .string()
    .required("This field is required")
    .max(64, "Please enter a valid subject with upto 64 characters")
    .matches(/^[A-Za-z0-9_]+$/, "Please enter a valid subject (that has a-z, A-Z, 0-9 or _ characters only)."),
  name: yup.string().required("This field is required")
    .max(64, "Please enter a valid name with upto 64 characters"),
  email: yup
    .string()
    .required("This field is required")
    .email("Please enter a valid email address"),
  discord: yup
    .string()
    .matches(
      /^(?:https?:\/\/)?discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[\w-]+$/, {
        message: "Please enter a valid discord URL",
        excludeEmptyString: true 
      }
    ),
  logo: yup
    .string()
    .matches(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,255}\.[a-z]{2,6}(\b([-a-zA-Z0-9@:%_\+.~#()?&\/\/=]*))?\.(?:jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif)$/, {
        message: "Please enter a valid URL to a jpg/jpeg/png/gif/bmp/svg/webp/tiff/tif file",
        excludeEmptyString: true 
      }
    ),
  twitter: yup
    .string().when("twitter", (value) => {
      if (value) {
        return yup.string().matches(/^\w{1,15}$/, {
          message: "Please enter a valid twitter handle",
          excludeEmptyString: true 
        })
      } else {
        return yup.string().transform((val, originalVal) => !val ? null : originalVal).nullable().optional()
      }
    }),
  website: yup
    .string()
    .required("This field is required")
    .matches(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,255}\.[a-z]{2,6}(\b([-a-zA-Z0-9@:%_\+.~#()?&\/\/=]*))?$/,
      "Please enter a valid URL."
    ),
  github: yup
    .string()
    .matches(/^(?=.{1,39}$)[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/, {
      message: "Please enter a valid GitHub username",
      excludeEmptyString: true,
    }),
  reportURL: yup.string().required("This field is required")
    .matches(/^((^(?!,)|(?!^),\s?)((ipfs:\/\/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([\/?#][-a-zA-Z0-9@:%_+.~#?&\/=]*)*)|((https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})(\.(?:json|pdf))?)))+$/, "Please enter website links to JSON/PDF file and/or the ipfs:// link to the report"),
  dAppScripts: yup.array().of(
    yup.object({
      scriptHash: yup
        .string()
        .required("This field is required")
        .max(64, "Please enter a valid script hash with 64 characters.")
        .matches(/[0-9a-fA-F]{64}/, "Please enter a valid script hash with 64 characters"),
      contractAddress: yup
        .string()
        .matches(/^(addr_test1|addr1)[a-zA-Z0-9]{53,}$/, {
          message: "Please enter a valid script address",
          excludeEmptyString: true
        }),
      era: yup.string(),
      compiler: yup.string(),
      compilerVersion: yup.string(),
      optimizer: yup.string(),
      optimizerVersion: yup.string(),
      progLang: yup.string(),
      repoUrl: yup.string()
        .matches(
          /^(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/[\w.-]+$/, {
            message: "Please enter a valid GitHub repository URL",
            excludeEmptyString: true 
          }
        )
    })
  ),
}, [["twitter", "twitter"]]);
