import Image from "next/image";
import {
  useAccount,
} from "wagmi";
import { Dialog } from "@mui/material";
import styles from "../styles/GiftNftModal.module.css";
import localFont from "@next/font/local";
import clsx from "clsx";
import { useCallback, useContext, useEffect, useState } from "react";
import { Nft } from 'alchemy-sdk';
import { AlchemyContext } from "./AlchemyProvider";

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

export interface Surprise {
    tokenAddress: string, 
    tokenId: string, 
    from: string, 
    to: string, 
    numGiftedReceiver: number
  }

export const SurpriseNftModal = ({
  tokenAddress,
  tokenId,
  from,
  to,
  numGiftedReceiver,
  open,
  handleClose
}: Surprise & { 
    open: boolean;
    handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
 }) => {
  const alchemy = useContext(AlchemyContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [nft, setNft] = useState<Nft>();
  const [error, setError] = useState();
  
  const getNft = useCallback(() => {
    if (address && !isConnecting && !isDisconnected) {
      alchemy.nft
        .getNftMetadata(tokenAddress, tokenId)
        .then((value) => {
          console.log(value);
          setNft(value);
        })
        .catch((errorTemp) => setError(errorTemp));
    }
  }, [alchemy, address, !isConnecting, !isDisconnected]);

  useEffect(() => {
    if (getNft) {
        getNft();
    }
  }, [getNft]);

  let media;
  if (nft) {
    media =
        nft.media.length && nft.media[0].thumbnail
        ? nft.media[0].thumbnail
        : nft.media[0].gateway;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-nft"
      aria-describedby="modal-nft-description"
    >
      <div className={clsx(styles.modal, sartoshiFont.className)}>
        {nft && (
            <>
                <h1 className={styles.title}>Santa has arrived!</h1>
                <h2 className={styles.subTitle}>{nft.title}</h2>
                <img alt="nft thumbnail" src={`${media}`} width={200} height={200} />
            </>
        )
            
        }
      </div>
    </Dialog>
  );
};
