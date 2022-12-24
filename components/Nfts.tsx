import React, { useCallback, useContext, useEffect, useState } from "react";
import { useAccount, erc721ABI } from "wagmi";
import styles from "../styles/Nfts.module.css";
import { AlchemyContext } from "./AlchemyProvider";
import { NftExcludeFilters, OwnedNftsResponse } from "alchemy-sdk";
import Image from "next/image";
import { GiftNftModal, IGiftNftModal } from "./GiftNftModal";

interface INfts {
  triggerNfts?: boolean;
  setTriggerNfts: (trigger: boolean) => void;
}

export const Nfts = ({ triggerNfts, setTriggerNfts }: INfts) => {
  const alchemy = useContext(AlchemyContext);
  const { address, isConnecting, isDisconnected } = useAccount();
  const [nfts, setNfts] = useState<OwnedNftsResponse>();
  const [error, setError] = useState();
  const [selectedNft, setSelectedNft] = useState<IGiftNftModal>();

  const getNfts = useCallback(() => {
    if (address && !isConnecting && !isDisconnected) {
      alchemy.nft
        .getNftsForOwner(address, {
          pageSize: 200,
          excludeFilters: [NftExcludeFilters.SPAM, NftExcludeFilters.AIRDROPS],
        })
        .then((value) => {
          console.log(value);
          
          setNfts(value);
        })
        .catch((errorTemp) => setError(errorTemp));
    }
  }, [alchemy, address, !isConnecting, !isDisconnected]);

  useEffect(() => {
    if (triggerNfts) {
      getNfts();
      setTriggerNfts(false);
    }
  }, [getNfts, triggerNfts]);

  return (
    <div className={styles.grid}>
      {error && <div>{error}</div>}
      {nfts &&
        nfts.ownedNfts &&
        nfts.ownedNfts.filter((nft) => nft.tokenType === "ERC721").map((nft) => {
          const media =
            nft.media.length && nft.media[0] && nft.media[0].thumbnail
              ? nft.media[0].thumbnail
              : nft.media.length && nft.media[0] ? nft.media[0].gateway : undefined;
          return (
            media && <div
              className={styles.card}
              key={`${nft.contract.address}_${nft.tokenId}`}
              onClick={() => {
                setSelectedNft({
                  name: nft.title,
                  media,
                  tokenId: nft.tokenId,
                  tokenAddress: nft.contract.address,
                  open: true,
                  handleClose: () => {
                    setSelectedNft(undefined);
                  },
                  retriggerNftLoad: setTriggerNfts,
                });
              }}
            >
              <h2>{nft.title}</h2>
              <img
                alt="thumnail image"
                src={`${media}`}
                width={200}
                height={200}
              />
            </div>
          );
        })}
      {selectedNft && <GiftNftModal {...selectedNft} />}
    </div>
  );
};
