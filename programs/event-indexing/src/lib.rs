use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod event_indexing {
    use anchor_lang::solana_program::system_program;

    use super::*;

    pub fn transfer(ctx: Context<TransferAccounts>) -> Result<()> {
        emit_cpi!(
            ctx.accounts.program.to_account_info(),
            ctx.accounts.event_authority.to_account_info(),
            *ctx.bumps.get("event_authority").unwrap(),
            Transfer {
                from: ctx.accounts.from.key(),
                to: ctx.accounts.to.key(),
                amount: 0,
                asset_id: system_program::ID
            }
        );
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferAccounts<'info> {
    /// CHECK:
    #[account(mut)]
    pub from: Signer<'info>,
    /// CHECK:
    #[account(mut)]
    pub to: AccountInfo<'info>,
    /// CHECK:
    #[account(seeds=[b"__event_authority"], bump)]
    pub event_authority: AccountInfo<'info>,
    pub program: Program<'info, crate::program::EventIndexing>,
}

#[event]
pub struct Transfer {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub asset_id: Pubkey,
}
