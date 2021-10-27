import React, { createContext, useState } from "react";

export const Web3Context = createContext([]);

export const Web3Provider = (props) => {
    const [web3, setWeb3] = useState();

    return (
        <Web3Context.Provider value={[web3, setWeb3]}>
            {props.children}
        </Web3Context.Provider>
    )
}