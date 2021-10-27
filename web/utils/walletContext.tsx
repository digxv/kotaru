import React, { createContext, useState } from "react";

export const WalletContext = createContext([]);

export const WalletProvider = (props) => {
    const [walletState, setWalletState] = useState({
        address: "",
        balance: 0
    });

    return (
        <WalletContext.Provider value={[walletState, setWalletState]}>
            {props.children}
        </WalletContext.Provider>
    )
}