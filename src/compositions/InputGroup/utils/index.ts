import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { FieldType, Field } from "../interface";
import * as Schema from "./schemas";

import type { AnySchema, AnyObjectSchema } from "yup";
import { FieldValues, Resolver } from "react-hook-form";

const getFieldSchema = (fieldType: FieldType, required: boolean): AnySchema => {
  let schema = Schema.Text;
  switch (fieldType) {
    case FieldType.Email: schema = Schema.Email; break;
    case FieldType.Subject: schema = Schema.Subject; break;
    case FieldType.Hash: schema = Schema.Hash; break;
    case FieldType.CommitHash: schema = Schema.CommitHash; break;
    case FieldType.WalletAddress: schema = Schema.WalletAddress; break;
    case FieldType.DiscordUrl: schema = Schema.DiscordUrl; break;
    case FieldType.LinkedInUrl: schema = Schema.LinkedInUrl; break;
    case FieldType.WebsiteUrl: schema = Schema.WebsiteUrl; break;
    case FieldType.ReportUrl: schema = Schema.ReportUrl; break;
    case FieldType.LogoUrl: schema = Schema.LogoUrl; break;
    case FieldType.TwitterHandle: schema = Schema.TwitterHandle; break;
    case FieldType.GitHubUserName: schema = Schema.GitHubUserName; break;
    case FieldType.GitHubRepository: schema = Schema.GitHubRepository; break;
    case FieldType.Dropdown: schema = Schema.Dropdown; break;
  }
  return !required ? schema : schema.required('The field is required');
};

const buildSchema = (fields: Field[]): AnyObjectSchema => {
  const schema = {} as {[key: string]: AnySchema};
  for (const field of fields) {
    if (field.type == FieldType.Object) {
      schema[field.name] = buildSchema(field.fields || []);
    } else if (field.type == FieldType.Array) {
      schema[field.name] = yup.array().of(buildSchema(field.fields || []));
    } else {
      schema[field.name] = getFieldSchema(field.type, field.required !== undefined ? field.required : false);
    }
  }
  return yup.object().shape(schema);
};

export function buildFormResolver<T extends FieldValues = any>(fields: Field[]): Resolver<T> {
  return yupResolver(buildSchema(fields)) as Resolver<T>;
}