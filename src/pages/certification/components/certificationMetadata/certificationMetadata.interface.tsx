export interface IAuditReport {
    name: string;
  }
  
  export interface IScriptObject {
    smartContractInfo: {
      era?: string;
      compiler?: string;
      compilerVersion?: string;
      optimizer?: string;
      optimizerVersion?: string;
      progLang?: string;
      repository?: string;
    };
    scriptHash: string;
    contractAddress: string;
  }
  
  export interface OffChainMetadataSchema {
    certificateIssuer: {
      logo: string;
      name: string;
      social: {
        contact: string;
        discord: string;
        github: string;
        twitter: string;
        website: string;
      };
    };
    disclaimer: string;
    scripts: IScriptObject[];
    subject: string;
    summary: string;
  }