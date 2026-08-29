import Web3, { EventLog, BlockHeaderOutput, ProviderMessage } from "web3";
import { SaltBalanceInfo } from "./types";
import { MIN_BLOCK_CHECK_INTERVAL_SECONDS } from "../../utils/c";


class WalletFactory {
    
    private address;
    private abi;
    private rpcList: string[] = [];
    private secondsPerBlock = 3;
    public web3?: Web3 | null;
    private subscriptions: any[] = []
    private stop: boolean = false
    private lastRpcIndex = -1;

    constructor(address: string, abi: any, rpcList: string[], secondsPerBlock: number = 3) {
        this.address = address;
        this.abi = abi;
        this.rpcList = rpcList;
        this.secondsPerBlock = secondsPerBlock;
    }

    public startSubscriptions() {
      this.stop = false
    }
    public stopSubscriptions() {
      this.stop = true/*
      if(this.web3 && this.web3.provider && this.web3.provider.removeAllListeners) {
        //this.web3.provider.removeAllListeners('block')
      }
      for(const subscription of this.subscriptions) {
          try {
            subscription.unsubscribe()
          } catch(e) {}
      }
      this.subscriptions = []*/
    }

    private getWeb3 = () => {
      if (this.web3) return this.web3; // Return the cached web3 if it exists
    
      // Increment the RPC index in a round-robin manner
      this.lastRpcIndex = (this.lastRpcIndex + 1) % this.rpcList.length;
      const rpcUrl = this.rpcList[this.lastRpcIndex]; // Get the current RPC URL
    
      // Create a new web3 instance with the selected RPC URL
      this.web3 = new Web3(rpcUrl);
      return this.web3;
    };

    private getContract = () => {
      const web3 = this.getWeb3();
      return new web3.eth.Contract(this.abi, this.address);
    }

    public getSaltBalance(salt: string, blockNumber?: number): Promise<SaltBalanceInfo> {
        return new Promise((resolve, reject) => {
          const paddedSalt = this.getWeb3().utils.rightPad(
            this.getWeb3().utils.asciiToHex(salt.toLowerCase()), 64
          );

          ;(this.getContract().methods as any)
          .getSaltBalance(paddedSalt)
          .call({}, blockNumber || 'latest')
          .then((result: any) => {
            const balanceObject = {
              salt: salt,
              paddedSalt: paddedSalt,
              wallet: result.wallet,
              isCreated: result.isCreated,
              balance: result.balance,
              blockNumber: blockNumber || "latest"
            };
            resolve(balanceObject);
          })
          .catch((error: Error) => {
            this.web3 = null
            reject(error);
          });
        });
    }

    public startBlockListener(callBack: (blockNumber: any) => void, lastBlock: number) {
      if(this.stop) return
      var interval = Math.round((this.secondsPerBlock * 1000) / 2)
      if(interval < (MIN_BLOCK_CHECK_INTERVAL_SECONDS * 1000)) interval = MIN_BLOCK_CHECK_INTERVAL_SECONDS * 1000;
      setTimeout(async () => {
        try {
          const currentBlock = Number(await this.getCurrentBlockNumber());
          try {
            if(currentBlock > lastBlock) callBack(currentBlock)
            this.startBlockListener(callBack, currentBlock)
  
          } catch(e) {
            this.web3 = null
            this.startBlockListener(callBack, currentBlock)
          }

        } catch(e) {
          this.web3 = null
          this.startBlockListener(callBack, lastBlock)
        }
        
      }, interval);
    }

    getCurrentBlockNumber() {
        return new Promise(async (resolve, reject) => {
          try {
            const blockNumber = await this.getWeb3().eth.getBlockNumber();
            resolve(blockNumber)
          } catch (error) {
            this.web3 = null
            reject(error)
          }
        })
    }
}

export default WalletFactory
