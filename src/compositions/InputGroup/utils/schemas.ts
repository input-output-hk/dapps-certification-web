import * as yup from "yup";

export const Text = yup.string();

export const Email = yup.string()
  .email('The field value must be a valid email address');

export const Subject = yup.string()
  .max(64, 'The field value must be up to 64 characters')
  .matches(/^[A-Za-z0-9_]{0,64}$/, {
    message: 'The field value can only contains alphabetical and numeric characters',
    excludeEmptyString: true
  });

export const Hash = yup.string()
  .length(64, 'The field value must be a valid hash with 64 characters')
  .matches(/[0-9a-fA-F]{1,64}/, {
    message: 'The field value must be a valid hash with 64 characters',
    excludeEmptyString: true
  });

export const CommitHash = yup.string()
  .min(7, 'The field value must have atleast 7 characters of the commit hash')
  .max(40, 'The field value has more than 40 characters. Please enter a valid commit hash')
  .matches(/^[a-f0-9]{7,40}$/, {
    message: 'The field value must be a valid commit hash',
    excludeEmptyString: true
  });

export const ContractAddress = yup.string()
  .matches(/^(addr_test1|addr1)[a-zA-Z0-9]{53,}$/, {
    message: 'The field value must be a valid contract address',
    excludeEmptyString: true
  });

export const DiscordUrl = yup.string()
  .matches(/^(?:https?:\/\/)?discord(?:\.gg|app\.com\/invite|\.com\/invite)\/[\w-]+$/, {
    message: 'The field value must be a valid Discord URL',
    excludeEmptyString: true 
  });

export const LinkedInUrl = yup.string()
  .matches(/^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile|company)\/([a-zA-Z0-9_-]+)$/i, {
    message: 'The field value must be a valid LinkedIn URL',
    excludeEmptyString: true 
  });

export const WebsiteUrl = yup.string()
  .matches(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,255}\.[a-z]{2,6}(\b([-a-zA-Z0-9@:%_\+.~#()?&\/\/=]*))?$/, {
    message: 'The field value must be a valid URL',
    excludeEmptyString: true 
  });

export const ReportUrl = yup.string()
  .matches(/^((^(?!,)|(?!^),\s?)((ipfs:\/\/(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([\/?#][-a-zA-Z0-9@:%_+.~#?&\/=]*)*)|((https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})(\.(?:json|pdf))?)))+$/, {
    message: 'The field value must be a website link to JSON/PDF file and/or the ipfs:// link to the report',
    excludeEmptyString: true 
  });

export const LogoUrl = yup.string()
  .matches(/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,255}\.[a-z]{2,6}(\b([-a-zA-Z0-9@:%_\+.~#()?&\/\/=]*))?\.(?:jpg|jpeg|png|gif|bmp|svg|webp|tiff|tif)$/, {
    message: 'The field value must be a valid URL to a jpg/jpeg/png/gif/bmp/svg/webp/tiff/tif file',
    excludeEmptyString: true 
  });

export const TwitterHandle = yup.string()
  .matches(/^\w{1,15}$/, {
    message: 'The field value must be a valid Twitter handle',
    excludeEmptyString: true 
  });

export const GitHubUserName = yup.string()
  .matches(/^(?=.{1,39}$)[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/, {
    message: 'The field value must be a valid GitHub username',
    excludeEmptyString: true 
  });

export const GitHubRepository = yup.string()
  .matches(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(?:\/)?$/, {
    message: 'URL entered should be in the format - https://github.com/<username>/<repository> (with an optional trailing backslash).',
    excludeEmptyString: true 
  });

export const Dropdown = yup.string();

export const NumberOfTests = yup.number()
  .min(0, "The field value must be a valid number count between 0 and 1000")
  .max(1000, "The field value must be a valid number count between 0 and 1000");