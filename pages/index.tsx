import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import {
  erc721ABI,
  useContractEvent,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { Nfts } from "../components/Nfts";
import styles from "../styles/Home.module.css";
import secretSantaAbi from "../contracts/degenSecretSanta.json";
import { Button, CircularProgress } from "@mui/material";
import localFont from "@next/font/local";
import Image from "next/image";
import clsx from "clsx";
import { useEffect, useState } from "react";

const contractAddress = process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS
  ? (process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS as `0x${string}`)
  : "0x00000";

const sartoshiFont = localFont({ src: "./SartoshiScript-Regular.otf" });

const Home: NextPage = () => {
  const [triggerNftsLoad, setTriggerNftLoad] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { address, isConnecting, isDisconnected } = useAccount();
  const {
    data,
    isError,
    isLoading,
    refetch: refetchClaimable,
  } = useContractRead({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: "getNumClaimable",
    args: [address ? address : contractAddress],
  });
  const { data: santasBag, refetch: refetchBags } = useContractRead({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: "getNumGiftsAvailable",
  });

  useContractEvent({
    address: contractAddress,
    abi: secretSantaAbi,
    eventName: "Gifted",
    listener(tokenAddress, tokenId, from, numGifted) {
      refetchClaimable();
      refetchBags();

      if (from === address) {
        setTriggerNftLoad(true);
      }
    },
  });

  useContractEvent({
    address: contractAddress,
    abi: secretSantaAbi,
    eventName: "Surprised",
    listener(tokenAddress, tokenId, from, to, numGiftedReceiver) {
      refetchClaimable();
      refetchBags();

      if (to === address) {
        setTriggerNftLoad(true);
        setIsSubmitted(false);
      }
    },
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Degen Secret Santa</title>
        <meta name="description" content="Degen Secret Santa" />
      </Head>

      <main className={clsx(styles.main, sartoshiFont.className)}>
        <ConnectButton />

        <h1 className={styles.title}>Welcome Degen @~</h1>

        <p className={styles.description}>
          {`Santa: Send me your worthless jpeg and get a random one from my bag`}
        </p>

        <h2 className={styles.subTitle}>{`Santa's Bag: ${
          santasBag === undefined ? "--" : santasBag
        }`}</h2>
        <h2 className={styles.subTitle}>{`Claimable Amount: ${
          data === undefined ? "--" : data
        }`}</h2>
        {data === 0 && <p>gotta gift an nft to claim one ya degen</p>}
        {data != undefined && data > 0 && (<SurpriseMeButton
          numClaimable={data as number}
          isSubmitted={isSubmitted}
          setIsSubmitted={setIsSubmitted}
        />)}

        {
          <Button
            onClick={() => {
              setTriggerNftLoad(true);
              refetchBags();
              refetchClaimable();
            }}
            className={clsx(styles.button, sartoshiFont.className)}
          >
            {"Refetch Nfts"}
          </Button>
        }
        <p>may take up to 15 minutes for NFTs to refresh</p>
        <Nfts
          triggerNfts={triggerNftsLoad}
          setTriggerNfts={setTriggerNftLoad}
        />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://twitter.com/codincowboy"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Made with ❤️ by codincowboy.eth</span>
        </a>
        <div className={styles.dinoAnimation}>
          <Image
            alt="vibe dino"
            src={`/images/transparentVibeDino.png`}
            width={50}
            height={50}
          />
        </div>
      </footer>
    </div>
  );
};

export default Home;

interface ISurpriseButton {
  numClaimable: number | undefined;
  isSubmitted: boolean;
  setIsSubmitted: (sub: boolean) => void;
}

const SurpriseMeButton = ({
  numClaimable,
  isSubmitted,
  setIsSubmitted,
}: ISurpriseButton) => {
  /** SECRET SANTA MAGIC */
  const {
    config: secretSantaConfig,
    isError,
    error,
  } = usePrepareContractWrite({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: "surprise",
  });
  const {
    data: secretSantaData,
    isLoading: secretSantaIsLoading,
    isSuccess: secretSantaIsSuccess,
    isError: secretSantaIsError,
    error: secretSantaError,
    write: secretSantaWrite,
  } = useContractWrite(secretSantaConfig);

  useEffect(() => {
    if (secretSantaIsError || isError) {
      setIsSubmitted(false);
    }
  }, [secretSantaIsError, isError]);

  return (
    <>
      {secretSantaIsSuccess && (
        <a
          href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${secretSantaData?.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          View on Etherscan
        </a>
      )}
      {numClaimable != undefined && numClaimable > 0 && (
        <Button
          disabled={!numClaimable || isSubmitted}
          onClick={() => {
            secretSantaWrite?.();
            setIsSubmitted(true);
          }}
          className={styles.glowOnHover}
        >
          {isSubmitted ? <CircularProgress /> : "Surprise Me"}
        </Button>
      )}
      {isSubmitted && (
        <h2 className={styles.subTitle}>...getting your present mfer</h2>
      )}
      {secretSantaIsError && (
        <p>
          {secretSantaError?.message ??
            "Error occured check etherscan for more info."}
        </p>
      )}
      {isError && (
        <p>
          {error?.message ?? "Error occured check etherscan for more info."}
        </p>
      )}
    </>
  );
};
