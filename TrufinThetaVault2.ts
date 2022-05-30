import { assert,expect } from "chai";
import { ethers, network } from "hardhat";
//import { objectEquals, parseLog, serializeMap } from "../helpers/utils";
import deployments from "../../constants/deployments.json";
import { BigNumberish, Contract, utils,BigNumber } from "ethers";
import * as time from "../helpers/time";
import { parseUnits } from "ethers/lib/utils";
import OptionsPremiumPricerInStables_ABI from "../../constants/abis/OptionsPremiumPricerInStables.json";
import ManualVolOracle_ABI from "../../constants/abis/ManualVolOracle.json";
import {
  getDeltaStep,
  deployProxy
} from "../helpers/utils";

import {
  USDC_PRICE_ORACLE,
  GAMMA_CONTROLLER,
  MARGIN_POOL,
  OTOKEN_FACTORY,
  USDC_ADDRESS,
  WETH_ADDRESS,
  GNOSIS_EASY_AUCTION,
  ManualVolOracle_BYTECODE,
  OptionsPremiumPricerInStables_BYTECODE,
  WMATIC_ADDRESS,

} from "../../constants/constants";

const { parseEther } = ethers.utils;

// import { deployProxy } from "../helpers/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const chainId = network.config.chainId;

checkIfStorageNotCorrupted(deployments.mumbai.TrufinThetaVaultETHCall);

// export async function deployProxy(
//   logicContractName: string,
//   libraryName: string,
//   adminSigner: SignerWithAddress,
//   initializeArgs: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
//   logicDeployParams = [],
// ) {
//   const VaultLifecycle = await ethers.getContractFactory(libraryName);
//         const vaultLifecycleLib = await VaultLifecycle.deploy();
//         const TrufinThetaVault = await ethers.getContractFactory(
//           logicContractName,
//           {
//             libraries: {
//               VaultLifecycle: vaultLifecycleLib.address,
//             },
//           }
//         );
//   const AdminUpgradeabilityProxy = await ethers.getContractFactory(
//     "AdminUpgradeabilityProxy",
//     adminSigner
//   );

//   const logic = await TrufinThetaVault.deploy(...logicDeployParams);

//   const initBytes = TrufinThetaVault.interface.encodeFunctionData(
//     "initialize",
//     initializeArgs
//   );

//   const proxy = await AdminUpgradeabilityProxy.deploy(
//     logic.address,
//     await adminSigner.getAddress(),
//     initBytes
//   );
//   return await ethers.getContractAt(logicContractName, proxy.address);
// }

function checkIfStorageNotCorrupted(vaultAddress: string) {
    let variables: Record<string, unknown> = {};

    describe(Vault ${vaultAddress}, () => {

        let name: string;
        let tokenName: string;
        let tokenSymbol: string;
        let isPut: boolean;
        let tokenDecimals: number;
        let asset: string;
        let minimumSupply: string;
        let managementFee: BigNumber;
        let performanceFee: BigNumber;
        let auctionDuration: number;
        let premiumDiscount: BigNumber;
        let deltaFirstOption: BigNumber;
        let deltaStep: BigNumber;
        let collateralAsset: string;

        name= Trufin ETH Theta Vault (Call);
        tokenName = "Trufin ETH Theta Vault";
        tokenSymbol = "rETH-THETA";
        asset = WETH_ADDRESS[chainId];
        collateralAsset = WETH_ADDRESS[chainId];
        deltaFirstOption = BigNumber.from("1000");
        deltaStep = getDeltaStep("WETH");
        minimumSupply = BigNumber.from("10").pow("10").toString();
        premiumDiscount = BigNumber.from("997");
        managementFee = BigNumber.from("2000000");
        performanceFee = BigNumber.from("20000000");
        auctionDuration = 21600;
        tokenDecimals = 18;
        isPut = false;


        // Addresses
      let owner: string, keeper: string, user: string, feeRecipient: string;
      // Signers
  let adminSigner: SignerWithAddress,
      userSigner: SignerWithAddress,
      ownerSigner: SignerWithAddress,
     keeperSigner: SignerWithAddress,
     feeRecipientSigner: SignerWithAddress;
      let newImplementation: string;
      let vaultProxy: Contract;
      let vaultProxy2: Contract;


      // Parameters
      let optionId: string;


  // Contracts
  let strikeSelection: Contract;
  let optionsPremiumPricer: Contract;
  let volOracle: Contract;


  before(async () => {
        [adminSigner, ownerSigner, keeperSigner, userSigner, feeRecipientSigner] =
        await ethers.getSigners();
      owner = ownerSigner.address;
      keeper = keeperSigner.address;
      user = userSigner.address;
      feeRecipient = feeRecipientSigner.address;


      const TestVolOracle = await ethers.getContractFactory(
        ManualVolOracle_ABI,
        ManualVolOracle_BYTECODE,
        keeperSigner
      );

      volOracle = await TestVolOracle.deploy(keeper);

      optionId = await volOracle.getOptionId(
        deltaStep,
        asset,
        collateralAsset,
        isPut
      );

      await volOracle.setAnnualizedVol([optionId], [106480000]);

      const OptionsPremiumPricer = await ethers.getContractFactory(
        OptionsPremiumPricerInStables_ABI,
        OptionsPremiumPricerInStables_BYTECODE,
        ownerSigner
      );


      const StrikeSelection = await ethers.getContractFactory(
        "DeltaStrikeSelection",
        ownerSigner
      );
console.log("hi");

      optionsPremiumPricer = await OptionsPremiumPricer.deploy(
        optionId,
        volOracle.address,
        asset,
        USDC_PRICE_ORACLE[chainId]
      );
      console.log("hi2");

      strikeSelection = await StrikeSelection.deploy(
        optionsPremiumPricer.address,
        deltaFirstOption,
        deltaStep
      );

      const initializeArgs = [
        WMATIC_ADDRESS[chainId],
        USDC_ADDRESS[chainId],
        OTOKEN_FACTORY[chainId],
        GAMMA_CONTROLLER[chainId],
        MARGIN_POOL[chainId],
        GNOSIS_EASY_AUCTION[chainId],
        [
          owner,
          keeper,
          feeRecipient,
          managementFee,
          performanceFee,
          tokenName,
          tokenSymbol,
          userSigner.address,
          strikeSelection.address,
          premiumDiscount,
          auctionDuration,
        ],
        [
          isPut,
          tokenDecimals,
          isPut ? USDC_ADDRESS[chainId] : asset,
          asset,
          minimumSupply,
          parseUnits("500", tokenDecimals > 18 ? tokenDecimals : 18),
        ],
      ];

        // vaultProxy = await deployProxy(
        //   "TrufinThetaVault",
        //   "VaultLifecycle",
        //   adminSigner,
        //   initializeArgs
        // );

        const VaultLifecycle = await ethers.getContractFactory("VaultLifecycle");
        const vaultLifecycleLib = await VaultLifecycle.deploy();

       vaultProxy = await deployProxy("TrufinThetaVault", adminSigner, initializeArgs, [], {
          libraries: {
            VaultLifecycle: vaultLifecycleLib.address,
          },
        });

        const TrufinThetaVault = await ethers.getContractFactory(
          "TrufinThetaVault",
          {
            libraries: {
              VaultLifecycle: vaultLifecycleLib.address,
            },
          }
        );

        vaultProxy2 = await ethers.getContractAt(
            "AdminUpgradeabilityProxy",
            vaultAddress,
            adminSigner
          );
        const newImplementationContract = await TrufinThetaVault.deploy(
        );
        newImplementation = newImplementationContract.address;
        });
      it("updates the implementation slot correctly after an upgrade", async () => {
        // const log = await (vaultProxy.connect(adminSigner).upgradeTo(newImplementation));
          console.log(vaultProxy2);
          await expect(vaultProxy2.connect(adminSigner).upgradeTo(newImplementation)).to.emit(vaultProxy2, "Upgraded").withArgs(newImplementation);
        });
});
}