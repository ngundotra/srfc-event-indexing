# CPI Events

This spec is currently alpha and subject to change.

## Summary

A standard protocol to enable off-chain indexing of program state, without requiring program state layout on-chain. This protocol describes a method that allows program's to store information in CPI data to be safely read and interpreted by off-chain data providers.

## Motivation

A standard protocol for indexing program state is necessary to support a flourishing and competitive ecosystem of projects on Solana. As it stands today, the Solana ecosystem's innovation is bottlenecked by the lack of shared interpretability between programs. 

Developers that want to make their program's information readily available to blockchain developers are stuck between storing data in transaction logs, which are commonly truncated, or in on-chain accounts, often with no clear way of finding such account addresses. 

By putting together a specification for checks & required on-chain code necessary to store data in Cross Program Invocation instruction data, we hope to see more indie development of programs, and greater diversity of data subscribers.

## Why CPIs?

Cross-Program Invocations (CPIs) have a more explicit pricing curve, and are more commonly stored by RPC providers than full transaction logs. This makes CPIs a more attractive location for storing metadata related to program execution.

## Specification: CPI Events

Before indexing information in a CPI, a valid CPI event must pass four checks:

1. The currently executing instruction's data must begin with the following 8 bytes: [0xe4, 0x45, 0xa5, 0x2e, 0x51, 0xcb, 0x9a, 0x1d].

2. The previously executed instruction's program ID must match the current instruction's program ID.

3. The first account meta that is passed to the currently executing instruction must be a PDA with seeds [b"__event_authority"] and derived from its program ID

4. The currently executing instruction's program must have an Anchor IDL that contains an "event" that can be deserialized from the currently executing instruction's data.

For programs to be able to store information in CPIs, they must implement the following on-chain checks:

1. If the current instruction begins with the following 8 bytes: [0xe4, 0x45, 0xa5, 0x2e, 0x51, 0xcb, 0x9a, 0x1d], then it must be interpreted as a CPI event.

2. The current instruction is a CPI event, the first account meta must be a PDA with seeds [b"__event_authority"] and derived from its program ID, and it must be a `signer`, otherwise the program execution should fail.


**Implementation**: <!-- link to implementation/documentation/PoC -->

For off-chain indexing implementation, please inspect `tests/event-indexing.ts`. 

For on-chain implementation, please inspect `programs/event-indexing/src/lib.rs`.