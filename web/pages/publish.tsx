import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useState} from "react";
import {
  Box,
  Input,
  Textarea,
  Button
} from "@chakra-ui/react"
import Layout from '../components/Layout';

const Publish: NextPage = () => {

  useEffect(() => {
    
  }, [])

  return (
    <Layout>
      <div className={styles.container}>
        <Head>
          <title>Kotaru.xyz</title>
          <meta name="description" content="Kotaru.xyz" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
            <Box maxW="800px" marginRight="auto" marginLeft="auto">
                <Input placeholder="Name" />
                <Textarea placeholder="Description" />
                <Input type="number" placeholder="Price in ETH" />
                <Input type="file" />
                <Button>Publish</Button>
            </Box>
        </main>
      </div>
    </Layout>
  )
}

export default Publish
