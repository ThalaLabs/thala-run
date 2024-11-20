import { useWallet } from "@aptos-labs/wallet-adapter-react";
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
import { MSafeWalletName } from "@msafe/aptos-wallet-adapter";

interface ConnectWalletProps extends ButtonProps { }

export function ConnectWallet({ ...props }: ConnectWalletProps) {
  const { connect, wallets } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen} {...props}>
        Connect Wallet
      </Button>
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
                  onClick={() => wallet.readyState === "Installed" ? connect(wallet.name) : window.open(
                    wallet.name === MSafeWalletName ? "https://aptos.m-safe.io/store/0?url=https://run.thala.dev" : wallet.url)}
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
