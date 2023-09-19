import * as yup from "yup";

export const REPO_URL_PATTERN =
  /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(?:\/)?(?:commit\/[a-f0-9]{7,40})?$/;
export const COMMIT_HASH_PATTERN = /[a-f0-9]{7,40}$/;
export const COMMIT_EXIST_PATTERN = /\/commit\/[a-f0-9]{7,40}/;

export const auditorRunTestFormSchema = yup.object().shape({
  repoURL: yup
    .string()
    .required("This field is required")
    .test({
      name: "github-commit-url",
      test: (value, context) => {
        if (value) {
          const [, , , username, repoName] = value!.split("/");

          if (
            !username ||
            !repoName ||
            !/^[a-zA-Z0-9-]+$/.test(username) ||
            !/^[a-zA-Z0-9-]+$/.test(repoName)
          ) {
            return context.createError({
              message: "Invalid GitHub repository URL",
            });
          }

          const matches = value!.match(REPO_URL_PATTERN);
          if (!matches) {
            return context.createError({
              message: "Invalid GitHub commit URL",
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
        const { repoURL } = context.parent;
        if (!COMMIT_EXIST_PATTERN.test(repoURL) && !value) {
          return context.createError({
            message: "This field is required.",
          });
        }
        if (value && value.length < 7) {
          return context.createError({
            message: "Please enter a commit hash with length atleast 7",
          });
        }
        if (value && value.length > 40) {
          return context.createError({
            message: "Please enter a commit hash with length upto 40",
          });
        }
        if (value && !COMMIT_HASH_PATTERN.test(value)) {
          return context.createError({
            message: "Invalid commit hash",
          });
        }
        return true;
      },
    })
    .when("repoUrl", (repoUrl, schema) => {
      if (repoUrl && !COMMIT_EXIST_PATTERN.test(repoUrl))
        return schema.required("This field is required.");
      return schema.matches(
        /[0-9a-f]*/,
        "Please enter a combination of numbers and lowercase letters through a to f"
      );
    }),
  version: yup.string().required("This field is required"),
  name: yup.string().required("This field is required"),
  subject: yup
    .string()
    .required("This field is required")
    .max(64, "Please enter a valid subject with upto 64 characters")
    .matches(/^[0-9a-zA-Z_]*$/, "Please enter a valid subject (that has a-z, A-Z, 0-9 or _ characters only)."),
});