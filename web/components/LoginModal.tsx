import {
  Button,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { magic } from "../utils/magic";
import Web3 from "web3";

const LoginModal = ({ isOpen, onClose, setIsLoggedIn }) => {

  let useMagic: any = magic;
  let useWeb3: any = Web3;

  const [email, setEmail] = useState("");

  const login = async () => {
    await useMagic.auth.loginWithMagicLink({ email, showUI: true });
    setIsLoggedIn(true);
    onClose();

    const web3 = new Web3(useMagic.rpcProvider);
    const address = (await web3.eth.getAccounts())[0]
    console.log(address);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent p={4}>
        <ModalHeader>Login / Signup</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Login Using Magic Link
          <Input
            type="email"
            margin={2}
            placeholder="john@doe.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            varient="solid"
            colorScheme="red"
            margin={2}
            onClick={login}
          >
            Login
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
