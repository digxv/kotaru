import { ReactElement } from 'react';
import { Box, SimpleGrid, Icon, Text, Stack, Flex } from '@chakra-ui/react';
import { FcAssistant, FcDonate, FcInTransit, FcDatabase, FcShare } from 'react-icons/fc';

interface FeatureProps {
  title: string;
  text: string;
  icon: ReactElement;
}

const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'gray.100'}
        mb={1}>
        {icon}
      </Flex>
      <Text color={"#fff"} fontWeight={600}>{title}</Text>
      <Text color={'gray.500'}>{text}</Text>
    </Stack>
  );
};

export default function Features() {
  return (
    <Box p={4}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
        <Feature
          icon={<Icon as={FcDonate} w={10} h={10} />}
          title={'Crypto Payments'}
          text={
            'Products listed on Kotaru.xyz are bought using Eth, enabling people from any region & ages to use the marketplace.'
          }
        />
        <Feature
          icon={<Icon as={FcDatabase} w={10} h={10} />}
          title={'Decentralized & End-to-end Encrypted'}
          text={
            'Kotaru.xyz encrypts & stores products on IPFS - making them immutable, censorship resistant & avoiding unauthorized access.'
          }
        />
        <Feature
          icon={<Icon as={FcShare} w={10} h={10} />}
          title={'Peer-to-Peer'}
          text={
            `There is no platform fee. Creators make 100% of their sales. Both the payments and content distribution is P2P.`
          }
        />
      </SimpleGrid>
    </Box>
  );
}