import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {useEffect, useState} from "react";
import {
  Box
} from "@chakra-ui/react"
import Layout from '../components/Layout';

const Home: NextPage = () => {

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
          <h1 className={styles.title}>
            Welcome to <a href="https://nextjs.org">Next.js!</a>
          </h1>

          <p className={styles.description}>
            Get started by editing{' '}
            <code className={styles.code}>pages/index.js</code>
          </p>

          <div className={styles.grid}>
    
            <Box href="https://nextjs.org/learn" cursor="pointer" border="none" bgGradient="linear(to-l, #7928CA, #FF0080)" color="white" _hover={{
              color: "white"
            }} className={styles.card}>
              <h2>Sell &rarr;</h2>
              <p>Learn about Next.js in an interactive course with quizzes!</p>
            </Box>

            <Box href="https://nextjs.org/docs" cursor="pointer" _hover={{
              borderColor: "#000",
              color: "#000"
            }} className={styles.card}>
              <h2>Docs &rarr;</h2>
              <p>Find in-depth information about Next.js features and API.</p>
            </Box>

          </div>
        </main>

        {/* <footer className={styles.footer}>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by{' '}
            <span className={styles.logo}>
              <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
            </span>
          </a>
        </footer> */}
      </div>
    </Layout>
  )
}

export default Home
