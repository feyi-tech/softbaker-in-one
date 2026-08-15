import React, { useEffect, useState, createContext, useContext, Context } from 'react'
//import "./SoftBakerProvider.scss";
import AuthView from '../Firebase/AuthView';
import useFirebase from '../Firebase';
import { User } from 'firebase/auth';
import { consoleLog, downloadSvgAsImage, rejectPromise, resolvePromise, savePromise, updateLogSettings } from '../../utils/f';
import { 
  COINS, PROMISE_ID, SDK_NAME, STORAGE_KEYS,
  IS_TEST
} from '../../utils/c';
import AccessTokenDoor from '../Firebase/AccessTokenDoor';
import { AuthResource } from '../Firebase/data.type';
import PayFlow from '../PayFlow';
import useWalletListener from '../PayFlow/hooks/useWalletListener';
import { DownloadTypeProps, DownloadTypeResult, Router, SaltBalanceConfirmation, SdkConfig, Tool } from '../PayFlow/types';
import WalletTracker from '../WalletTracker';
import useServerBalanceUpdate from '../PayFlow/hooks/useServerBalanceUpdate';
import usePriceData from '../PayFlow/hooks/usePriceData';
import axios from 'axios';
import useSdkConfig from '../PayFlow/hooks/useSdkConfig';
import DownloadType from '../DownloadType';
import { 
  saveToStoreFrameCookie, saveToStoreFrameLocalStorage, saveToStoreFrameSessionStorage,
  getFromStoreFrameCookie, getFromStoreFrameLocalStorage, getFromStoreFrameSessionStorage 
} from '../../utils/storeframer';
import PaymentRequest from '../PaymentRequest';
import { Config } from '../../theme.type';
import Swal from 'sweetalert2';
import CreditTransfer from '../CreditTransfer';
import useTools, { UseToolsResult } from '../PayFlow/hooks/useTools';

import { StaticTool, DynamicTool, DynamicTemplate, ToolsData } from "../PayFlow/hooks/useTools/types"
import { rmUpdates } from '../PayFlow/hooks/useTools/utils';

const SoftBakerContext: Context<any> = createContext({})

export { rmUpdates }

export interface SoftBakerProviderProps {
  children: any,
  config: Config,
  enableLog?: boolean,
  isDarkMode?: boolean,
  disableBlockchainPoll?: boolean
}

export type { StaticTool, DynamicTool, DynamicTemplate, ToolsData, UseToolsResult }

interface DocSaveResult {docId: string, totalFieldsUpdated: number}
export interface SoftBakerResourceProps extends AuthResource {
  signIn: (signInTitle: string | null | undefined, signUpTitle: string | null | undefined) => Promise<User>,
  signOut: () => Promise<void>,
  createDoc: (documentId: string | null, document: {[x: string]: any}, user?: User | null, staticToolCollection?: string | null, dynamicToolId?: string | null) => Promise<DocSaveResult>,
  updateDoc: (documentId: string | null, document: {[x: string]: any}, staticToolCollection?: string | null, dynamicToolId?: string | null) => Promise<DocSaveResult>,
  deposit: (amount: number, signInTitle: string | null | undefined, signUpTitle: string | null | undefined) => Promise<SaltBalanceConfirmation>,
  showWallet: (depositAmount: number) => void,
  sdkConfig?: SdkConfig | null,
  contact_link: string | null | undefined,
  group_link: string | null | undefined,
  group_links: string[] | null | undefined,
  parent_site_home: string | null | undefined,
  aff_pct: number | null | undefined,
  balanceInUsd: 0, 
  balancePendingInUsd: 0,
  unconfirmedDepositsCount: 0,
  downloadSvgAsImage: (svgString: string, format: 'png' | 'jpeg', fileName: string) => Promise<string>,
  getDownloadType: (downloadTypeProps: DownloadTypeProps) => Promise<DownloadTypeResult>,
  saveToStoreFrameCookie: (key: string, value: string) => Promise<void>,
  saveToStoreFrameLocalStorage: (key: string, value: string) => Promise<void>,
  saveToStoreFrameSessionStorage: (key: string, value: string) => Promise<void>,
  getFromStoreFrameCookie: (key: string) => Promise<any>,
  getFromStoreFrameLocalStorage: (key: string) => Promise<any>,
  getFromStoreFrameSessionStorage: (key: string) => Promise<any>
}

const SoftBakerProvider: React.FC<SoftBakerProviderProps> = ({ 
  enableLog, children, isDarkMode, disableBlockchainPoll, 
  config 
}): JSX.Element => {
  const { auth, db, user, authLoading, setUser, uploadFile, adminInfo } = useFirebase(config)
  const [ showAuth, setShowAuth ] = useState<boolean>()
  const [ signInTitle, setSignInTitle ] = useState<string | null | undefined>()
  const [ signUpTitle, setSignUpTitle ] = useState<string | null | undefined>()
  const [ showAccessTokenDoor, setShowAccessTokenDoor ] = useState<boolean>()
  const [ walletTrackerDefaultDepositAmount, setWalletTrackerDefaultDepositAmount ] = useState<number>(0)
  const [ dowloadTypeProps, setDowloadTypeProps ] = useState<DownloadTypeProps | null | undefined>()
  const [ payFlowInfo, setPayFlowInfo ] = useState<{showPayFlow: boolean, payAmount: number}>({showPayFlow: false, payAmount: 0})
  const [ showPaymentRequest, setShowPaymentRequest ] = useState<boolean>(false)
  const [ showCreditTransfer, setShowCreditTransfer ] = useState<boolean>(false)

  const sdkConfig = useSdkConfig(config)
  const { getTool } = useTools(config)

  useEffect(() => {
    updateLogSettings(enableLog)
  }, [enableLog])

  
  const priceData = usePriceData()
  const { 
    usdBalance, balanceUpdating, syncConfirmedBalance, updatePaymentAddress, transferCredit,
    bnbPaymentAddress, bnbTestnetPaymentAddress, referralEarnings
  } = useServerBalanceUpdate(config, priceData)
  const walletListenerResult = useWalletListener(usdBalance, priceData, config, disableBlockchainPoll)

  useEffect(() => {
    consoleLog(`${SDK_NAME}: sdkConfig/currentTool`, sdkConfig)
  }, [sdkConfig])

  const { 
    confirmedDepositsBalanceBnbTest,
    confirmedDepositsBalanceInCoinBnbTest,
    
    confirmedDepositsBalanceBnb,
    confirmedDepositsBalanceInCoinBnb,
    
    confirmedDepositsBalanceEth,
    confirmedDepositsBalanceInCoinEth,

    balanceInUsd, balancePendingInUsd
  } = walletListenerResult

  useEffect(() => {
    if(user?.uid) {
      syncConfirmedBalance({
        [COINS.bnb_testnet.key]: confirmedDepositsBalanceBnbTest,
        [COINS.bnb.key]: confirmedDepositsBalanceBnb,
        [COINS.ethereum_testnet.key]: confirmedDepositsBalanceEth
      })
    }
    
  }, [confirmedDepositsBalanceBnbTest, confirmedDepositsBalanceBnb, confirmedDepositsBalanceEth, usdBalance])
  
  
  const signIn = (signInTitle: string | null | undefined, signUpTitle: string | null | undefined): Promise<User> => {
    return new Promise((resolve, reject) => {
      savePromise(PROMISE_ID.signIn, resolve, reject)
      setSignInTitle(signInTitle)
      setSignUpTitle(signUpTitle)
      setShowAuth(true)
    })
  }
  const signOut = (): Promise<unknown> => {
    if(auth) return auth.signOut()
    return new Promise((resolve, reject) => {
      resolve(null)
    })
  }
  const getAccessToken = (maxAgeMilli?: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      if(!user) {
        reject(new Error("signed-out"))

      } else {
        var now = new Date()
        var lastLoginDate = new Date()
        lastLoginDate.setTime(user.metadata.lastLoginAt)
        var timeDiff = now.getTime() - lastLoginDate.getTime()

        if(!maxAgeMilli || timeDiff <= maxAgeMilli) {
          user.getIdToken()
          .then(token => {
            resolve(token)
          })
          .catch(e => {
            reject(e)
          })

        } else {
          savePromise(PROMISE_ID.getAccessToken, resolve, reject)
          setShowAccessTokenDoor(true)
        }
      }
    })
  }
  const createDoc = (docId: string | null, doc: {[x: string]: any}, user?: User | null, staticToolCollection?: string | null, dynamicToolId?: string | null): Promise<DocSaveResult> => {
    return new Promise((resolve, reject) => {
      if(!user) {
        reject(new Error("Sign In required"))

      } else {
        user.getIdToken().then((authToken) => {
          axios.post(`${IS_TEST? config?.serverBaseUrlTest : config?.serverBaseUrlLive}/create_doc`, {
            collection: staticToolCollection, 
            docId, 
            doc,
            dynamicToolId
          },
          {
            headers: {
              Authorization: authToken,
            },
          })
          .then((result) => {
              resolve(result.data)
          })
          .catch((error: any) => {
              reject(error?.response?.data || {error: error?.message})
          })
        });
      }
    })
  }
  const updateDoc = (docId: string | null, doc: {[x: string]: any}, staticToolCollection?: string | null, dynamicToolId?: string | null): Promise<DocSaveResult> => {
    return new Promise((resolve, reject) => {
      if(!user) {
        reject(new Error("Sign In required"))

      } else {
        user.getIdToken().then((authToken) => {
          axios.post(`${IS_TEST? config?.serverBaseUrlTest : config?.serverBaseUrlLive}/update_doc`, {
            collection: staticToolCollection, 
            docId, 
            doc,
            dynamicToolId
          },
          {
            headers: {
              Authorization: authToken,
            },
          })
          .then((result) => {
              resolve(result.data)
          })
          .catch((error: any) => {
              reject(error?.response?.data || {error: error?.message})
          })
        });
      }
    })
  }
  const deposit = (amount: number, signInTitle: string | null | undefined, signUpTitle: string | null | undefined): Promise<SaltBalanceConfirmation> => {
    return new Promise((resolve, reject) => {
      if(!user) {
        signIn(signInTitle, signUpTitle)
        .then(user => {
          savePromise(PROMISE_ID.deposit, resolve, reject)
          setPayFlowInfo({showPayFlow: true, payAmount: amount})
        })
        .catch(e => {
          reject(e)
        })

      } else {
        savePromise(PROMISE_ID.deposit, resolve, reject)
        setPayFlowInfo({showPayFlow: true, payAmount: amount})
      }
    })
  }

  const sell = (signInTitle: string | null | undefined, signUpTitle: string | null | undefined): void => {
    if(!user) {
      signIn(signInTitle, signUpTitle)
      .then(user => {
        setShowCreditTransfer(true)
      })
      .catch(e => {
        Swal.fire({
          icon: "error",
          title: "An error occurred",
          text: e.message
        })
      })

    } else {
      setShowCreditTransfer(true)
    }
  }

  const showWallet = (amount: number) => {
    setWalletTrackerDefaultDepositAmount(amount)
  }
  
  const getDownloadType = (downloadTypeProps: DownloadTypeProps): Promise<DownloadTypeResult> => {
    return new Promise((resolve, reject) => {
      savePromise(PROMISE_ID.downloadType, resolve, reject)
      setDowloadTypeProps(downloadTypeProps)
    })
  }

  const requestPayment = (): Promise<void> => {

    return new Promise((resolve, reject) => {
      var error = null
      if(referralEarnings < 0) {
        error = "Please wait for your referral earnings to load."

      } else if(referralEarnings == 0) {
        error = "You have no referral earnings yet. Share your referral link to start earning."

      } else if (referralEarnings < config.minRefWithdrawal) {
        error = `You're yet to reach the payment threshold of $${config.minRefWithdrawal}. Share your referral link to earn more.`
      }

      if(error) {
        reject(new Error(error))

      } else {
        savePromise(PROMISE_ID.requestPayment, resolve, reject)
        setShowPaymentRequest(true)
      }
    })
    
  }

  const resources = {
    auth, db, user, authLoading, uploadFile, adminInfo,
    signIn, signOut, createDoc, updateDoc,
    deposit, showWallet, 
    sdkConfig,
    contact_link: sdkConfig?.contact_link,
    group_link: sdkConfig?.group_link,
    group_links: sdkConfig?.group_links,
    parent_site_home: sdkConfig?.parent_site_home,
    aff_pct: sdkConfig?.aff_pct,
    balanceInUsd: walletListenerResult.balanceInUsd, 
    balancePendingInUsd: walletListenerResult.balancePendingInUsd,
    unconfirmedDepositsCount: walletListenerResult.unconfirmedDepositsBnbTest.length + 
    walletListenerResult.unconfirmedDepositsBnb.length + 
    walletListenerResult.unconfirmedDepositsEth.length,
    downloadSvgAsImage,
    getDownloadType,
    saveToStoreFrameCookie,
    saveToStoreFrameLocalStorage,
    saveToStoreFrameSessionStorage,
    getFromStoreFrameCookie,
    getFromStoreFrameLocalStorage,
    getFromStoreFrameSessionStorage
  }

  return (
    <SoftBakerContext.Provider value={resources}>
        {children}
        {
          !showAuth? null : 
          <AuthView config={config} isDarkMode={isDarkMode} show={showAuth} setUser={setUser} signInTitle={signInTitle} signUpTitle={signUpTitle} onSuccess={(user: User) => {
              setShowAuth(false)
              localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_MILLI, `${Date.now()}`)
              resolvePromise(PROMISE_ID.signIn, user)
            }} onError={(error: any) => {
                setShowAuth(false)
                rejectPromise(PROMISE_ID.signIn, error)
          }} />
        }
        {
          !showAccessTokenDoor? null : 
          <AccessTokenDoor config={config} isDarkMode={isDarkMode} show={showAccessTokenDoor} onSuccess={(token: string) => {
                setShowAccessTokenDoor(false)
                resolvePromise(PROMISE_ID.getAccessToken, token)
            }} onError={(error: any) => {
                setShowAccessTokenDoor(false)
                rejectPromise(PROMISE_ID.getAccessToken, error)
          }} />
        }
        {
          !payFlowInfo.showPayFlow? null : 
          <PayFlow config={config} contactLink={sdkConfig?.contact_link}
            isDarkMode={isDarkMode} show={payFlowInfo.showPayFlow} payAmount={payFlowInfo.payAmount} 
            walletListenerResult={walletListenerResult} 
            vendors={sdkConfig?.vendors}
            minDeposit={sdkConfig?.min_deposit || 0}
            minVendorDeposit={sdkConfig?.min_vendor_deposit || 0}
            priceData={priceData}
            onSuccess={(latestDeposit) => {
              setPayFlowInfo({showPayFlow: false, payAmount: 0})
              resolvePromise(PROMISE_ID.deposit, latestDeposit)
            }}
            onClose={() => {
              setPayFlowInfo({showPayFlow: false, payAmount: 0})
          }} />
        }
        {
          payFlowInfo.showPayFlow || !walletTrackerDefaultDepositAmount? null : 
            <WalletTracker config={config} isDarkMode={isDarkMode} walletListenerResult={walletListenerResult} affPct={sdkConfig?.aff_pct}
            referralEarnings={referralEarnings} 
            requestPayment={requestPayment}
            deposit={deposit}
            sell={sell}
            balanceUpdating={balanceUpdating} //Hide if payflow is active
            defaultDepositAmount={walletTrackerDefaultDepositAmount}
            currentPaymentAddress={IS_TEST? bnbTestnetPaymentAddress : bnbPaymentAddress}
            onClose={() => {
              setWalletTrackerDefaultDepositAmount(0)
          }} />
        }
        {
          !showCreditTransfer? null : 
          <CreditTransfer config={config} isDarkMode={isDarkMode} usdBalance={usdBalance}
          transferCredit={transferCredit}
          onClose={() => {
            setShowCreditTransfer(false)
          }} />
        }
        {
          !showPaymentRequest? null : 
          <PaymentRequest config={config} isDarkMode={isDarkMode} currentPaymentAddress={IS_TEST? bnbTestnetPaymentAddress : bnbPaymentAddress}
          updatePaymentAddress={updatePaymentAddress}
          onClose={() => {
            setShowPaymentRequest(false)
          }} />
        }
        <DownloadType config={config} isDarkMode={isDarkMode} {...(dowloadTypeProps? dowloadTypeProps : {})} 
          onGetTool={(id) => {
            return getTool(id) as any
          }}
          onSuccess={(result: DownloadTypeResult) => {
            setDowloadTypeProps(null)
            consoleLog("parsedSvg:templatesUrl.<DownloadType", result, "dowloadTypeProps: ", dowloadTypeProps)
            resolvePromise(PROMISE_ID.downloadType, result)
          }} 
          onError={(error: any) => {
            setDowloadTypeProps(null)
            consoleLog("parsedSvg:templatesUrl.<DownloadType.error", error, "dowloadTypeProps: ", dowloadTypeProps)
            setDowloadTypeProps(null)
            rejectPromise(PROMISE_ID.downloadType, error)
        }} />
    </SoftBakerContext.Provider>
  )
}

function useSoftBaker(): SoftBakerResourceProps {
  return useContext(SoftBakerContext)
}

export { 
  SoftBakerProvider, 
  useSoftBaker,
  useSdkConfig,
  useTools
}