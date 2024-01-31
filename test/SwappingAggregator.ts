import { expect } from "chai";
import { ethers } from "hardhat";
import { AddressLike } from "ethers";

interface CallDataType {
  target: AddressLike;
  data: string;
  amount: number;
  message: string;
}

describe("SwappingAggregator", () => {
  const generateCallData = (
    target: AddressLike,
    amount: number,
    message: string
  ): CallDataType => {
    let abi = ["function swap(uint256,string)"];
    const iAMM = ethers.Interface.from(abi);
    return {
      target,
      data: iAMM.encodeFunctionData("swap", [amount, message]),
      amount,
      message,
    };
  };

  // contracts deployment to be used by each test

  const setupContracts = async () => {
    const SwappingAggregator = await ethers.getContractFactory(
      "SwappingAggregator"
    );
    const swappingAggregator = await SwappingAggregator.deploy();

    const AMM = await ethers.getContractFactory("AMM");
    // Deploy first AMM
    const firstAutoMarketMaker = await AMM.deploy();
    const secondAutoMarketMaker = await AMM.deploy();

    return {
      swappingAggregator,
      firstAutoMarketMaker,
      secondAutoMarketMaker,
    };
  };

  it("should execute a simple swap", async () => {
    const { swappingAggregator, firstAutoMarketMaker } = await setupContracts();

    // Craft call data for a simple swap
    const callData = generateCallData(firstAutoMarketMaker, 100, "token");

    await expect(swappingAggregator.execute([callData]))
      .to.emit(callData.target, "Swap")
      .withArgs(swappingAggregator, callData.amount, callData.message);
  });

  it("should execute a multiple swaps", async () => {
    const { swappingAggregator, firstAutoMarketMaker, secondAutoMarketMaker } =
      await setupContracts();

    const callData = [
      generateCallData(firstAutoMarketMaker, 100, "token"),
      generateCallData(secondAutoMarketMaker, 200, "token"),
      generateCallData(firstAutoMarketMaker, 100, "token"),
      generateCallData(secondAutoMarketMaker, 500, "token"),
    ];

    let swaps: Promise<void>[] = [];

    callData.forEach(({ target, data, amount, message }) => {
      swaps.push(
        expect(swappingAggregator.execute([{ target, data }]))
          .to.emit(target, "Swap")
          .withArgs(swappingAggregator, amount, message)
      );
    });

    await Promise.allSettled(swaps);
  });

  it("should revert in case of empty call data", async () => {
    const { swappingAggregator } = await setupContracts();

    await expect(swappingAggregator.execute([])).to.rejectedWith(
      "Empty Call Data"
    );
  });

  it("should revert in case of wrong call data", async () => {
    const { swappingAggregator, firstAutoMarketMaker } = await setupContracts();

    const data = new ethers.AbiCoder().encode(
      ["string", "uint256"],
      ["token", 0]
    );

    await expect(
      swappingAggregator.execute([{ target: firstAutoMarketMaker, data: data }])
    ).to.rejectedWith("Swap execution failed");
  });

  it("should revert in case of wrong target", async () => {
    const { swappingAggregator } = await setupContracts();

    await expect(
      swappingAggregator.execute([{ target: "", data: "123123123" }])
    ).to.rejectedWith();
  });

  it("should revert in case of external revert", async () => {
    const { swappingAggregator, firstAutoMarketMaker } = await setupContracts();

    const callData = [generateCallData(firstAutoMarketMaker, 0, "token")];

    await expect(swappingAggregator.execute(callData)).to.rejectedWith(
      "Swap execution failed"
    );
  });
});
