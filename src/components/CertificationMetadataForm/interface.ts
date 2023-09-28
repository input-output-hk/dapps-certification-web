
export interface ReportFormScript {
  scriptHash: string;
  contractAddress: string;
  smartContractInfo: {
    era?: string;
    compiler?: string;
    compilerVersion?: string;
    optimizer?: string;
    optimizerVersion?: string;
    progLang?: string;
    repository?: string;
  };
}

export interface ReportForm {
  certificationLevel: string;
  summary: string;
  disclaimer: string;
  subject: string;
  certificateIssuer: {
    name: string;
    logo?: string;
    social: {
      contact: string;
      discord?: string;
      twitter?: string;
      github?: string;
      website: string;
    };
  };
  report: {
    value: string;
  }[];
  scripts: ReportFormScript[];
}