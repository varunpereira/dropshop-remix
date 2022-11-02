import { createGlobalState } from "react-hooks-global-state";

export var { getGlobalState, setGlobalState }: any = createGlobalState({
  auth: {},
  process: {
    env: {
      // domainURI: "http://localhost:3000",
      domainURI: "https://dropshop-remix.vercel.app",
      mongodbURI:
        "mongodb+srv://0:0@cluster0.ufs0l.mongodb.net/dropshop?retryWrites=true&w=majority",
      accessTokenSecret: "RANDOM_SECRET",
      refreshTokenSecret: "RANDOM_SECRET",
      cookieSessionSecret: "RANDOM_SECRET",
      stripeSecretKey:
        "sk_test_51KaWdCEY7SjSewVOGyL52VdtVSWhEzYTyBMjFEdqEwwBZZrfns8TaXZvlE0Aw4PCxOZIA8az6iDApzRQ3zuDXGn9009uZFXSrp",
      stripePublishableKey:
        "pk_test_51KaWdCEY7SjSewVOmmZffrk0Cr3v2KjWnhA1ZVMQNl8Q6jEBIGtmy6IlIEwp4U96hJFcl4ocpwHbQVBAKnHlj01T00bFv0fBr0",
      stripeWebHookSecret: "whsec_yDaOkjhEJYLSIB303ufNNdGivnjc2L2S",
    },
  },
});
