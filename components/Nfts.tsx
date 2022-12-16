import React, { useContext, useEffect, useState } from 'react';
import { useAccount, erc721ABI } from 'wagmi';
import styles from '../styles/Nfts.module.css';
import { AlchemyContext } from './AlchemyProvider';
import { NftExcludeFilters, OwnedNftsResponse } from 'alchemy-sdk';
import Image from 'next/image';
import { GiftNftModal, IGiftNftModal } from './GiftNftModal';

export const Nfts = () => {
    const alchemy = useContext(AlchemyContext);
    const { address, isConnecting, isDisconnected } = useAccount();
    const [nfts, setNfts] = useState<OwnedNftsResponse>();
    const [error, setError] = useState();
    const [selectedNft, setSelectedNft] = useState<IGiftNftModal>();

    useEffect(() => {
        if (address && !isConnecting && !isDisconnected) {
            alchemy.nft.getNftsForOwner(address, { pageSize: 200, excludeFilters: [NftExcludeFilters.SPAM, NftExcludeFilters.AIRDROPS] })
                .then(value => {
                    console.log(value);
                    setNfts(value);
                })
                .catch(errorTemp => setError(errorTemp))
        }
       
    }, [alchemy, address, isConnecting, isDisconnected])

    return (

        <div className={styles.grid}>
            {error && <div>{error}</div>}
            {nfts && nfts.ownedNfts && nfts.ownedNfts.map(nft => {
                const media = nft.media.length && nft.media[0].thumbnail ? nft.media[0].thumbnail : nft.media[0].gateway;
                return (
                <div className={styles.card} onClick={() => {
                    setSelectedNft({
                        name: nft.title,
                        media,
                        tokenId: nft.tokenId,
                        tokenAddress: nft.contract.address,
                        open: true,
                        handleClose: () => { setSelectedNft(undefined) }
                    })
                }}>
                    <h2>{nft.title}</h2>
                    <Image 
                        src={`${media}`}
                        width={200}
                        height={200}
                    />
                </div>)
            })}
          {selectedNft && <GiftNftModal {...selectedNft} />}
        </div>
    )
}