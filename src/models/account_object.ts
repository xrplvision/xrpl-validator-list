import { LedgerEntry } from "xrpl";
import { Trustline } from "../models/trustline";
const { RippleStateFlags } = LedgerEntry;
import { removeUndefined } from "../v1/common";
import { ledgerTimeToUnixTime } from "../models/ledger";

// https://github.com/XRPLF/xrpl.js/blob/2b424276344b2aa8b8b76d621500f4d9e1436663/packages/xrpl/src/models/methods/accountObjects.ts#L61
/**
 * Account Objects can be a Check, a DepositPreauth, an Escrow, an Offer, a
 * PayChannel, a SignerList, a Ticket, or a RippleState.
 */
export type AccountObject =
  | LedgerEntry.Check
  | LedgerEntry.DepositPreauth
  | LedgerEntry.Escrow
  | LedgerEntry.Offer
  | LedgerEntry.PayChannel
  | LedgerEntry.SignerList
  | LedgerEntry.Ticket
  | LedgerEntry.RippleState;

// https://github.com/XRPLF/xrpl.js/blob/2b424276344b2aa8b8b76d621500f4d9e1436663/packages/xrpl/src/models/common/index.ts#L3
export type AccountObjectType =
  | "check"
  | "escrow"
  | "offer"
  | "payment_channel"
  | "signer_list"
  | "state"
  | "ticket"
  | "nft_offer";

/**
 * https://gist.github.com/WietseWind/5df413334385367c548a148de3d8a713
 * https://github.com/XRPL-Labs/XUMM-App/blob/2c39d04e65dd8d48001f4cb452b1fbe2e2c53f00/src/services/AccountService.ts#L198
 *
 * This function returns account_lines line results
 * based on account_objects (type = state) results,
 * » Returns only the account_lines to show based on:
 *   - Counts towards your reserve
 */
export function accountObjectsToAccountLines(account: string, accountObjects: AccountObject[]) {
  const notInDefaultState = accountObjects.filter((node: any) => {
    return (
      node.LedgerEntryType === "RippleState" &&
      // tslint:disable-next-line:no-bitwise
      node.Flags & RippleStateFlags[node.HighLimit.issuer === account ? "lsfHighReserve" : "lsfLowReserve"]
    );
  });

  const accountLinesFormatted = notInDefaultState.map((node) =>
    RippleStateToTrustLine(node as LedgerEntry.RippleState, account)
  );

  return accountLinesFormatted;
}

const RippleStateToTrustLine = (ledgerEntry: LedgerEntry.RippleState, account: string): Trustline => {
  const parties = [ledgerEntry.HighLimit, ledgerEntry.LowLimit];
  const [self, counterparty] = ledgerEntry.HighLimit.issuer === account ? parties : parties.reverse();

  const ripplingFlags = [
    // tslint:disable-next-line:no-bitwise
    (RippleStateFlags.lsfHighNoRipple & ledgerEntry.Flags) === RippleStateFlags.lsfHighNoRipple,
    // tslint:disable-next-line:no-bitwise
    (RippleStateFlags.lsfLowNoRipple & ledgerEntry.Flags) === RippleStateFlags.lsfLowNoRipple,
  ];
  // tslint:disable-next-line:variable-name
  const [no_ripple, no_ripple_peer] =
    ledgerEntry.HighLimit.issuer === account ? ripplingFlags : ripplingFlags.reverse();

  const balance =
    ledgerEntry.HighLimit.issuer === account && ledgerEntry.Balance.value.startsWith("-")
      ? ledgerEntry.Balance.value.slice(1)
      : ledgerEntry.Balance.value;

  return {
    account: counterparty.issuer,
    balance,
    currency: self.currency,
    limit: self.value,
    limit_peer: counterparty.value,
    no_ripple,
    no_ripple_peer,
  } as Trustline;
};

export function accountObjectsToNFTOffers(accountObjects: AccountObject[]) {
  const nftOfferObjects = accountObjects.filter((obj: any) => {
    return obj.LedgerEntryType === "NFTokenOffer";
  });

  const nftOffers = nftOfferObjects.map((obj: any) => {
    let expiration: number = obj.Expiration;
    if (typeof expiration === "number") {
      expiration = ledgerTimeToUnixTime(expiration);
    }

    return removeUndefined({
      nft_id: obj.NFTokenID,
      amount: obj.Amount,
      flags: obj.Flags,
      index: obj.index,
      owner: obj.Owner,
      destination: obj.Destination,
      expiration,
      ledger_index: obj.PreviousTxnLgrSeq,
      transaction_hash: obj.PreviousTxnID,
    });
  });

  return nftOffers;
}
