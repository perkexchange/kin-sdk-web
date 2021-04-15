import { AccountBalance, getPrices, Prices } from '@kin-sdk/client'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useNetwork } from './network-provider'

const PricesContext = createContext<{
  prices?: Prices
  refreshPrices?: () => Promise<void>
  convertPrice?: (kin: string) => AccountBalance
}>(undefined)

function roundDigits(number, digits) {
  return (Math.round(number * 100) / 100).toFixed(digits)
}

function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices>()
  const { network, client } = useNetwork()

  const refreshPrices = () => client?.getPrices().then(setPrices)

  const convertPrice = (kin: string): AccountBalance => {
    const kinInt = parseInt(kin, 10)
    return {
      kin,
      usd: roundDigits(prices?.kin?.usd * kinInt, 2).toString(),
      btc: (prices?.kin?.btc * kinInt).toString(),
    }
  }

  useEffect(() => {
    if (network && client) {
      console.log('refresh')
      refreshPrices()
    }
  }, [network, client])

  useEffect(() => {
    if (!prices) {
      getPrices().then(setPrices)
    }
  }, [prices, setPrices])

  return <PricesContext.Provider value={{ prices, refreshPrices, convertPrice }}>{children}</PricesContext.Provider>
}

const usePrices = () => useContext(PricesContext)

export { PricesProvider, usePrices }
