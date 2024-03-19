export const walletMock = {
    wallet: {
      experimental: {},
    },
    walletName: 'nami',
    walletAddress:
      "addr_test1qpdyjvzf6el9d5elwew3raprct7yg5sukh0sfeh7mftnfgqhwyp7rrtahjfhz2m6nka285av7pls90w0ydr2x3mnecpqhk8kyk",
    stakeAddress:
      "stake_test1uqthzqlp347meym39dafmw4r6wk0qlczhh8jx34rgaeuuqsgxguvh",
    activeWallets: ["lace", "nami", "yoroi"],
    errorMessage: null,
    errorRetry: false,
    loading: false,
    listeningWalletChanges: false,
    resetWalletChanges: false,
  };
  
  export const sessionMock = {
    authToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZWZhdWx0IjpbMSwic3Rha2VfdGVzdDF1cXRoenFscDM0N21leW0zOWRhZm13NHI2d2swcWxjemhoOGp4MzRyZ2FldXVxc2d4Z3V2aCJdLCJleHAiOjE3MTI3NjUyODN9.-SdV6PfGi0c_XHb7nUT3DRAJidO41yNGs0_8ujkbeZM",
    accessToken: null,
    networkId: 0,
    walletAddress:
      "addr_test1qpdyjvzf6el9d5elwew3raprct7yg5sukh0sfeh7mftnfgqhwyp7rrtahjfhz2m6nka285av7pls90w0ydr2x3mnecpqhk8kyk",
  };
  
  export const authMock = {
    isSessionFetched: true,
    hasAnActiveSubscription: true,
    features: ["l1-run", "l2-upload-report"],
  };