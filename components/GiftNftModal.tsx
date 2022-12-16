
import Image from 'next/image';
import { erc721ABI, 
    usePrepareContractWrite, 
    useContractWrite, 
    useAccount,
    useContractRead } from 'wagmi';
import { Dialog, Button, CircularProgress } from '@mui/material';
import styles from '../styles/GiftNftModal.module.css';
import degenSecretSantaAbi from '../contracts/degenSecretSanta.json';

export interface IGiftNftModal {
    media: string;
    name: string;
    tokenId: string;
    tokenAddress: string;
    open: boolean;
    handleClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void);
}

const contractAddress = process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS ? 
    process.env.NEXT_PUBLIC_SANTA_CONTRACT_ADDRESS as `0x${string}` :
    '0x00000'

export const GiftNftModal = ({ 
    media,
    name,
    tokenAddress,
    tokenId,
    open,
    handleClose
 }: IGiftNftModal) => {
    const { address, isConnecting, isDisconnected } = useAccount();
    const { config } = usePrepareContractWrite({
        address: tokenAddress,
        abi: erc721ABI,
        functionName: 'setApprovalForAll',
        args: [contractAddress, true]
      })
      const { data, isLoading, isSuccess, write } = useContractWrite(config)
      const { data: read, isError: errorRead, isLoading: loadingRead } = useContractRead({
        address: tokenAddress,
        abi: erc721ABI,
        functionName: 'isApprovedForAll',
        args: [address ? address : contractAddress, contractAddress]
      })

    /** SECRET SANTA MAGIC */
    const { config: secretSantaConfig } = usePrepareContractWrite({
        address: contractAddress,
        abi: degenSecretSantaAbi,
        functionName: 'gift',
        args: [tokenAddress, tokenId]
      })
      const { 
        data: secretSantaData, 
        isLoading: secretSantaIsLoading, 
        isSuccess: secretSantaIsSuccess, 
        write: secretSantaWrite } = useContractWrite(secretSantaConfig)

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-nft"
            aria-describedby="modal-nft-description"
        >
            <div className={styles.modal}>
                <h2>{name}</h2>
                <Image 
                    src={`${media}`}
                    width={200}
                    height={200}
                />
                {isSuccess && <a href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${data?.hash}`} target="_blank">View on Etherscan</a>}
                {!read && <Button onClick={() => write?.()}>{isSuccess ? 'Approved' : 'Approve Collection Transfer'}</Button>}
                {read && <div>Collection is approved</div>}
                {secretSantaIsSuccess && <a href={`${process.env.NEXT_PUBLIC_ETHERSCAN_LINK}${secretSantaData?.hash}`} target="_blank">View on Etherscan</a>}
                {read && !secretSantaIsSuccess && <Button onClick={() => secretSantaWrite?.()}>{secretSantaIsLoading ? <CircularProgress /> : 'Gift NFT'}</Button>}
                {secretSantaIsSuccess && <p>thanks mfer</p>}
            </div>
        </Dialog>
        
    )
}