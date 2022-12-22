import Image from "next/image";
import {
  erc721ABI,
  usePrepareContractWrite,
  useContractWrite,
  useAccount,
  useContractRead,
} from "wagmi";
import { Dialog, CircularProgress } from "@mui/material";
import styles from "../styles/GiftNftModal.module.css";
import degenSecretSantaAbi from "../contracts/degenSecretSanta.json";
import localFont from "@next/font/local";
import clsx from "clsx";
import { useEffect, useState } from "react";

const sartoshiFont = localFont({ src: "../pages/SartoshiScript-Regular.otf" });

export interface IGiftNftModal {
  media: string;
  name: string;
  tokenId: string;
  tokenAddress: string;
  open: boolean;
  handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  retriggerNftLoad: (trigger: boolean) => void;
}

const contractAddress = process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS
  ? (process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS as `0x${string}`)
  : "0x00000";

export const GiftNftModal = ({
  media,
  name,
  tokenAddress,
  tokenId,
  open,
  handleClose,
  retriggerNftLoad,
}: IGiftNftModal) => {
  const [checkForApproval, setCheckForApproval] = useState(false);

  const { address, isConnecting, isDisconnected } = useAccount();
  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc721ABI,
    functionName: "setApprovalForAll",
    args: [contractAddress, true],
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);
  const {
    data: read,
    isError: errorRead,
    isLoading: loadingRead,
    refetch,
  } = useContractRead({
    address: tokenAddress,
    abi: erc721ABI,
    functionName: "isApprovedForAll",
    args: [address ? address : contractAddress, contractAddress],
  });

  useEffect(() => {
    let interval: NodeJS.Timer | undefined;

    if (checkForApproval) {
      interval = setInterval(() => {
        refetch();
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [checkForApproval]);

  useEffect(() => {
    if (read || errorRead) {
      setCheckForApproval(false);
    }
  }, [read, errorRead]);
  console.log(errorRead)
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-nft"
      aria-describedby="modal-nft-description"
    >
      <div className={clsx(styles.modal, sartoshiFont.className)}>
        <h2>{name}</h2>
        <Image alt="nft thumbnail" src={`${media}`} width={200} height={200} />
        {isSuccess && (
          <a
            href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${data?.hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        )}
        {!read && !isSuccess && !checkForApproval && (
          <button
            onClick={() => {
              write?.();
              setCheckForApproval(true);
            }}
            className={clsx(styles.button, sartoshiFont.className)}
          >
            {isSuccess ? "Approved" : "Approve Collection"}
          </button>
        )}
        {!read && isSuccess && checkForApproval && <p>...approving</p>}
        {read && <div>Collection is approved</div>}
        {read && !checkForApproval && !errorRead && !loadingRead && (
          <GiftNftButton tokenAddress={tokenAddress} tokenId={tokenId} />
        )}
        {errorRead && <div>Error getting collection approval</div>}
      </div>
    </Dialog>
  );
};

const GiftNftButton = ({
  tokenAddress,
  tokenId,
}: {
  tokenAddress: string;
  tokenId: string;
}) => {
  /** SECRET SANTA MAGIC */
  const { config: secretSantaConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: degenSecretSantaAbi,
    functionName: "gift",
    args: [tokenAddress, tokenId],
  });
  const {
    data: secretSantaData,
    isLoading: secretSantaIsLoading,
    isSuccess: secretSantaIsSuccess,
    write: secretSantaWrite,
  } = useContractWrite(secretSantaConfig);

  return (
    <>
      {secretSantaIsSuccess && (
        <a
          href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${secretSantaData?.hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Etherscan
        </a>
      )}
      {!secretSantaIsSuccess && (
        <button
          onClick={() => secretSantaWrite?.()}
          className={clsx(styles.button, sartoshiFont.className)}
        >
          {secretSantaIsLoading ? <CircularProgress /> : "Gift NFT"}
        </button>
      )}
      {secretSantaIsSuccess && <p>thanks mfer</p>}
    </>
  );
};
