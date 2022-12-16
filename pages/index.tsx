import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { erc721ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { Nfts } from '../components/Nfts';
import styles from '../styles/Home.module.css';
import secretSantaAbi from '../contracts/degenSecretSanta.json';
import { Button } from '@mui/material';

const contractAddress = process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS ? 
    process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS as `0x${string}` :
    '0x00000'

const Home: NextPage = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { data, isError, isLoading } = useContractRead({
    address: contractAddress,
    abi: secretSantaAbi,
    functionName: 'getNumClaimable',
    args: [address ? address : contractAddress]
  })
  const { data: santasBag } = useContractRead({
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

    console.log(secretSantaData)
  return (
    <div className={styles.container}>
      <Head>
        <title>4 Degens</title>
        <meta
          name="description"
          content="Degen Secret Santa"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <h1 className={styles.title}>
          Welcome Degen
        </h1>

        <p className={styles.description}>
          {`Send me your worthless jpegs and get a random one from Santa's bag`}
        </p>

        <h2 className={styles.title}>{`Santa's Bag: ${santasBag === undefined ? '--' : santasBag}`}</h2>
        <h2 className={styles.title}>{`Claimable Amount: ${data === undefined ? '--' : data}`}</h2>

        {secretSantaIsSuccess && <a href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${secretSantaData?.hash}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>}
        {data != undefined && data > 0 && <Button disabled={!data} onClick={() => { secretSantaWrite?.() }}>surprise me</Button>}
        <Nfts />
      </main>

      <footer className={styles.footer}>
        <a href="https://twitter.com/codincowboy" target="_blank" rel="noopener noreferrer">
          Made with ❤️ by codincowboy.eth
        </a>
      </footer>
    </div>
  );
};

export default Home;
