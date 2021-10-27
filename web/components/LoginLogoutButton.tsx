import { Button } from "@chakra-ui/react";

function LoginLogoutButton({ onOpen, isLoggedIn, logout }) {
  if (isLoggedIn == true) {
    return (
      <Button colorScheme="orange" varient="outline" onClick={logout}>
        Logout
      </Button>
    );
  } else if (isLoggedIn == false) {
    return (
      <Button colorScheme="orange" variant="solid" onClick={onOpen}>
        Login / Signup
      </Button>
    );
  } else {
    return <Button colorScheme="orange" isLoading={true}></Button>;
  }
}

export default LoginLogoutButton;
