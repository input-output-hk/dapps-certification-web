import * as yup from "yup";

export const REPO_URL_PATTERN =
  /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(?:\/)?$/;
export const COMMIT_HASH_PATTERN = /^[a-f0-9]{7,40}$/;

export const auditorRunTestFormSchema = yup.object().shape({
  repoURL: yup
    .string()
    .required("This field is required")
    .test({
      name: "github-commit-url",
      test: (value, context) => {
        if (value) {
          const matches = value!.match(REPO_URL_PATTERN);
          if (!matches) {
            return context.createError({
              message: "Invalid GitHub repository URL",
            });
          }

          return true;
        } else {
          return true;
        }
      },
    }),
  commit: yup
    .string()
    .test({
      name: "commit-hash",
      test: (value, context) => {
        if (!value) {
          return context.createError({
            message: "This field is required.",
          });
        }
        if (value && value.length < 7) {
          return context.createError({
            message: "Please enter atleast 7 characters of the commit hash",
          });
        }
        if (value && value.length > 40) {
          return context.createError({
            message: "Entered value has more than 40 characters. Please enter a valid commit hash",
          });
        }
        if (value && !COMMIT_HASH_PATTERN.test(value)) {
          return context.createError({
            message: "Invalid commit hash",
          });
        }
        return true;
      },
    }),
  version: yup.string(),
  name: yup.string().required("This field is required"),
  subject: yup
    .string()
    .max(64, "Please enter a valid subject with upto 64 characters")
    .matches(/^[0-9a-zA-Z_]*$/, "Please enter a valid subject (that has a-z, A-Z, 0-9 or _ characters only)."),
});