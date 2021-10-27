import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
  Link
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube } from 'react-icons/fa';
import { MdEmail } from "react-icons/md";
import { ReactNode } from 'react';
  
const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      target="_blank"
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      fontSize="lg"
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}>
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};
  
export default function Footer() {
  return (
    <Box
      color={"white"}
      maxWidth="1000px"
      marginRight="auto"
      marginLeft="auto"
      width="100%"
    >
      <Container
        as={Stack}
        maxW={'100%'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}>
        <Text fontSize="lg"><Link href="https://docs.kotaru.io" target="_blank">Documentation</Link></Text>
        <Stack direction={'row'} spacing={6}>
          <SocialButton label={'Twitter'} href={'https://twitter.com/kotaruio'}>
            <FaTwitter />
          </SocialButton>
          <SocialButton label={'Email'} href={'mailto:usekotaru'}>
            <MdEmail />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  );
}