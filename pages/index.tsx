import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { erc721ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { Nfts } from '../components/Nfts';
import styles from '../styles/Home.module.css';
import secretSantaAbi from '../contracts/degenSecretSanta.json';
import { Button, CircularProgress } from '@mui/material';
import localFont from '@next/font/local';
import Image from 'next/image';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

const contractAddress = process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS ? 
    process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS as `0x${string}` :
    '0x00000'

const sartoshiFont = localFont({ src: './SartoshiScript-Regular.otf' });

const Home: NextPage = () => {
  const [triggerNftsLoad, setTriggerNftLoad] = useState(true);

  const { address, isConnecting, isDisconnected } = useAccount();
  const { data, isError, isLoading, refetch: refetchClaimable } = useContractRead({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: 'getNumClaimable',
    args: [address ? address : contractAddress]
  })
  const { data: santasBag, refetch: refetchBags } = useContractRead({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: 'getNumGiftsAvailable'
  })

  /** SECRET SANTA MAGIC */
  const { config: secretSantaConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: 'surprise'
  })
  const { 
    data: secretSantaData, 
    isLoading: secretSantaIsLoading, 
    isSuccess: secretSantaIsSuccess, 
    write: secretSantaWrite } = useContractWrite(secretSantaConfig)

  useEffect(() => {
    if (secretSantaIsSuccess && !secretSantaIsLoading) {
      setTriggerNftLoad(true);
      refetchBags();
      refetchClaimable();
    }
  }, [secretSantaIsLoading, secretSantaIsSuccess])

  return (
    <div className={styles.container}>
      <Head>
        <title>@~ Degens</title>
        <meta
          name="description"
          content="Degen Secret Santa"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={clsx(styles.main, sartoshiFont.className)}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome Degen @~
        </h1>

        <p className={styles.description}>
          {`Santa: Send me your worthless jpegs and get a random one from my bag`}
        </p>

        <h2 className={styles.subTitle}>{`Santa's Bag: ${santasBag === undefined ? '--' : santasBag}`}</h2>
        <h2 className={styles.subTitle}>{`Claimable Amount: ${data === undefined ? '--' : data}`}</h2>
        {data === 0 && <p>gotta gift an nft to claim one ya degen</p>}

        {secretSantaIsSuccess && <a href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${secretSantaData?.hash}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>}
        {data != undefined && data > 0 && <Button disabled={!data} onClick={() => { secretSantaWrite?.() }} className={clsx(styles.button, sartoshiFont.className)}>{secretSantaIsLoading ? <CircularProgress /> :  'surprise me'}</Button>}
        {<Button onClick={() => { setTriggerNftLoad(true) }} className={clsx(styles.button, sartoshiFont.className)}>{'refetch nfts'}</Button>}
        <p>may take up to 15 minutes for NFTs to refresh</p>
        <Nfts triggerNfts={triggerNftsLoad} setTriggerNfts={setTriggerNftLoad} />
      </main>

      <footer className={styles.footer}>
        <a href="https://twitter.com/codincowboy" target="_blank" rel="noopener noreferrer">
          <span>Made with ❤️ by codincowboy.eth</span>
          <Image 
              alt="vibe dino"
              src={`/images/transparentVibeDino.png`}
              width={50}
              height={50}
          />
        </a>
      </footer>
    </div>
  );
};

export default Home;
