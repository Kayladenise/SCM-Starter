import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [accountBalance, setAccountBalance] = useState(undefined);
  const [frozen, setFrozen] = useState(undefined);
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    console.log("Contract Instance:", atmContract);
    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        console.log("Calling getBalance...");
        const contractBalance = await atm.getBalance();
        console.log("Contract Balance (wei):", contractBalance.toString());
        setBalance(ethers.utils.formatEther(contractBalance)); // Update balance in ETH
      } catch (err) {
        console.error("Error fetching contract balance:", err);
      }
    }
  };

  const getAccountBalance = async () => {
    if (atm) {
      try {
        console.log("Calling getAccountBalance...");
        const ethBalance = await atm.getAccountBalance();
        console.log("Account ETH Balance (wei):", ethBalance.toString());
        setAccountBalance(ethers.utils.formatEther(ethBalance)); // Convert to ETH
      } catch (err) {
        console.error("Error fetching account balance:", err);
      }
    }
  };

  const toggleFreeze = async () => {
    if (atm) {
      try {
        let tx = await atm.toggleFreeze();
        await tx.wait();
        getFrozenStatus();
      } catch (err) {
        console.error("Error freezing/unfreezing contract:", err);
      }
    }
  };

  const getFrozenStatus = async () => {
    if (atm) {
      try {
        const status = await atm.frozen();
        console.log("Contract frozen status:", status);
        setFrozen(status);
      } catch (err) {
        console.error("Error fetching frozen status:", err);
      }
    }
  };

  const deposit = async (amount) => {
    if (atm) {
      try {
        let tx = await atm.deposit(ethers.utils.parseEther(amount.toString()), { value: ethers.utils.parseEther(amount.toString()) });
        await tx.wait();
        getBalance();
      } catch (err) {
        console.error("Error during deposit:", err);
      }
    }
  };

  const withdraw = async (amount) => {
    if (atm) {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther(amount.toString()));
        await tx.wait();
        getBalance();
      } catch (err) {
        console.error("Error during withdrawal:", err);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      console.log("Fetching balance...");
      getBalance();
    }

    if (accountBalance === undefined) {
      console.log("Fetching account balance...");
      getAccountBalance();
    }

    return (
      <div>
        <p>Your Account: {account || "Connecting..."}</p>
        <p>Your Balance in Contract: {balance !== undefined ? `${Number(balance).toFixed(4)} ETH` : "Loading..."}</p>
        
        <button onClick={() => deposit(1)}>Deposit 1 ETH</button>
        <button onClick={() => withdraw(1)}>Withdraw 1 ETH</button>
        <br />
        <br />
        <input type="number" id="depositNum" min="1" step="1" />
        <button onClick={(e) => deposit(Number(document.getElementById("depositNum").value))}>Deposit</button>
        <br />
        <br />
        <input type="number" id="withdrawNum" min="1" step="1" />
        <button onClick={(e) => withdraw(Number(document.getElementById("withdrawNum").value))}>Withdraw</button>
        <br />
        <br />
        <p>Contract is currently: {frozen !== undefined ? (frozen ? "Frozen" : "Active") : "Loading..."}</p>
        <button onClick={toggleFreeze}>{frozen ? "Unfreeze Contract" : "Freeze Contract"}</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Smart Contract Management - ETH + AVAX</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background: linear-gradient(135deg, #2575fc, #6a11cb); /* Blue and violet gradient */
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 20px;
        }

        header h1 {
          font-size: 2.5rem;
          margin-bottom: 30px;
        }

        button {
          background-color: #2575fc; 
          color: white;
          border: none;
          padding: 18px 35px; 
          font-size: 1.5rem; 
          border-radius: 8px; 
          cursor: pointer;
          margin: 10px;
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        button:hover {
          background-color: #6a11cb; 
          transform: scale(1.1); 
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); 
        }

        input[type="number"] {
          padding: 12px;
          margin: 10px;
          border-radius: 8px;
          font-size: 1.2rem; /* Larger font size */
          border: 2px solid #ddd;
          transition: border 0.3s ease;
        }

        input[type="number"]:focus {
          border-color: #2575fc; 
        }
      `}</style>
    </main>
  );
}
