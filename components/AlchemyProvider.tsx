import { Network, Alchemy } from "alchemy-sdk";
import React from "react";

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "",
  network: Network.ETH_GOERLI, // Replace with your network.
};

const alchemy = new Alchemy(settings);
export const AlchemyContext = React.createContext(alchemy);

export const AlchemyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AlchemyContext.Provider value={alchemy}>
      {children}
    </AlchemyContext.Provider>
  );
};
