import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";

interface ConnectWalletProps extends ButtonProps { }

export function ConnectWallet({ ...props }: ConnectWalletProps) {
  const { connected, connect, disconnect, account, wallets } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
 
  const handleConnect = (walletName: string) => {
    try {
      connect(walletName as WalletName); 
      console.log('Connected to wallet:', account);
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
    }
  };
 
  const handleDisconnect = () => {
    try {
      disconnect();
      console.log('Disconnected from wallet');
    } catch (error) {
      console.error('Failed to disconnect from wallet:', error);
    }
  };

  return (
    <>
      {connected ? <Button onClick={handleDisconnect} {...props}>
        Disconnect
      </Button> : <Button onClick={onOpen} {...props}>
        Connect Wallet
      </Button>}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              {wallets?.map((wallet) => (
                <Button
                  key={wallet.name}
                  onClick={() => {
                    handleConnect(wallet.name);
                  }}
                  disabled={wallet.readyState !== "Installed"}
                >
                  {wallet.name}
                </Button>
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
