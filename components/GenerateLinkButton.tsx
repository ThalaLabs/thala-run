import { Button, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useClipboard, useDisclosure } from "@chakra-ui/react"
import { useContext, useState } from "react"
import { FuncGroupContext } from "./FuncGroupProvider"

export const GenerateLinkButton = () => {
    const context = useContext(FuncGroupContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { onCopy, value, setValue, hasCopied } = useClipboard("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    return <>
        <Button
            position={"fixed"}
            bottom={4}
            right={4}
            isLoading={isSubmitting}
            onClick={async () => {
                setIsSubmitting(true);
                if (!context) return;
                const response = await fetch("/api/generate-link", {
                    method: "POST",
                    body: JSON.stringify(context.funcGroup),
                });
                const id = await response.json();
                setIsSubmitting(false);
                setValue(
                    `${window.location.origin + window.location.pathname}?id=${id}`
                );
                onOpen();
            }}>Generate Link</Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Generated Link</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <HStack pb={4}>
                        <Input
                            value={value}
                            mr={2}
                            readOnly
                        />
                        <Button onClick={onCopy}>{hasCopied ? "Copied!" : "Copy"}</Button>
                    </HStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
}
// 3e86fc6e-558e-46b1-bc2d-b1cb52a02ad0