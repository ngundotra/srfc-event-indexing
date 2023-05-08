import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { EventIndexing, IDL } from "../target/types/event_indexing";
import { base64, bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { assert } from "chai";

function handleEvent(program: anchor.web3.PublicKey, event: anchor.Event) {
  let programName = program.toBase58();
  console.log(programName + ":", event.name);
}

function validateEvent(
  previousProgram: anchor.web3.PublicKey,
  currentProgram: anchor.web3.PublicKey,
  eventAuthority: anchor.web3.PublicKey,
  ixData: Buffer
) {
  // CHECK 0: The current program must have an Anchor IDL
  //          associated with it (implicit)

  // CHECK 1: Event tag
  let eventTag = Buffer.from(
    [0x1d, 0x9a, 0xcb, 0x51, 0x2e, 0xa5, 0x45, 0xe4].reverse()
  );
  if (!ixData.slice(0, 8).equals(eventTag)) {
    throw new Error("Invalid CPI Event: Event tag mismatch");
  }

  // CHECK 2: Previous program's ID must match current program's ID
  if (previousProgram.toString() !== currentProgram.toString()) {
    throw new Error("Invalid CPI Event: Program ID mismatch");
  }

  // CHECK 3: The first account meta must be the event authority,
  //          derived from the seed's `__event_authority` and the
  //          current program's ID
  let expectedAuthority = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    currentProgram
  )[0];
  if (expectedAuthority.toString() !== eventAuthority.toString()) {
    throw new Error("Invalid CPI Event: Event authority does not match");
  }
}

function handleTransaction(response: anchor.web3.VersionedTransactionResponse) {
  let instructions = response.transaction.message.compiledInstructions;
  let innerInstructions = response.meta.innerInstructions;

  let accounts: anchor.web3.PublicKey[] =
    response.transaction.message.staticAccountKeys
      .concat(response.meta.loadedAddresses.writable ?? [])
      .concat(response.meta.loadedAddresses.readonly ?? []);

  let eventCoder = new anchor.BorshEventCoder(IDL);

  for (const packet of innerInstructions) {
    let previousProgram = accounts[instructions[packet.index].programIdIndex];
    packet.instructions.forEach((instruction) => {
      let bytes = bs58.decode(instruction.data);

      let currentProgram = accounts[instruction.programIdIndex];
      let eventAuthority = accounts[instruction.accounts[0]];
      try {
        validateEvent(previousProgram, currentProgram, eventAuthority, bytes);

        let event = eventCoder.decode(base64.encode(bytes.slice(8)));
        handleEvent(currentProgram, event);
      } catch (err) {
        console.error(err);
      }

      previousProgram = accounts[instruction.programIdIndex];
    });
  }
}

describe("event-indexing", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.EventIndexing as Program<EventIndexing>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .transfer()
      .accounts({
        from: program.provider.publicKey!,
        to: program.provider.publicKey!,
        program: program.programId,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log("Your transaction signature", tx);
    let transactionDetails = await program.provider.connection.getTransaction(
      tx,
      { maxSupportedTransactionVersion: 0, commitment: "confirmed" }
    );
    handleTransaction(transactionDetails);
  });
});
