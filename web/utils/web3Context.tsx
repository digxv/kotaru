import React, { createContext, useState } from "react";

export const Web3Context = createContext([]);
export const ContractContext = createContext(null);

export const Web3Provider = (props) => {
    const [web3, setWeb3] = useState();

    return (
        <Web3Context.Provider value={[web3, setWeb3]}>
            {props.children}
        </Web3Context.Provider>
    )
}

export const ContractProvider = (props) => {
    const [contract, setContract] = useState();

    return (
        <ContractContext.Provider value={[contract, setContract]}>
            {props.children}
        </ContractContext.Provider>
    )
}