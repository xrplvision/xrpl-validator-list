import _ from "lodash";
import * as assert from "assert";
import { PaymentFlags } from "xrpl";
import { isPartialPayment } from "../utils";
import { removeUndefined } from "../../common";
import parseAmount from "../ledger/amount";
import parseMemos from "../ledger/memos";

import {
  FormattedPaymentSpecification,
  SourcePaymentAddress,
  DestinationPaymentAddress,
} from "../../v1/common/types/objects/payments";
import { FormattedIssuedCurrencyAmount } from "../../types";

function isNoDirectRipple(tx) {
  // tslint:disable-next-line:no-bitwise
  return (tx.Flags & PaymentFlags.tfNoDirectRipple) !== 0;
}

function isQualityLimited(tx) {
  // tslint:disable-next-line:no-bitwise
  return (tx.Flags & PaymentFlags.tfLimitQuality) !== 0;
}

function removeGenericCounterparty(amount: FormattedIssuedCurrencyAmount, address: string): FormattedIssuedCurrencyAmount {
  return amount.counterparty === address ? _.omit(amount, "counterparty") : amount;
}

// Payment specification
function parsePayment(tx: any): FormattedPaymentSpecification {
  assert.ok(tx.TransactionType === "Payment");

  const source: SourcePaymentAddress = {
    address: tx.Account,
    maxAmount: removeGenericCounterparty(parseAmount(tx.SendMax || tx.Amount), tx.Account),
    tag: tx.SourceTag,
  };

  const destination: DestinationPaymentAddress = {
    address: tx.Destination,
    tag: tx.DestinationTag,
  };

  return removeUndefined({
    source: removeUndefined(source),
    destination: removeUndefined(destination),
    memos: parseMemos(tx),
    invoiceID: tx.InvoiceID,
    paths: tx.Paths ? JSON.stringify(tx.Paths) : undefined,
    allowPartialPayment: isPartialPayment(tx) || undefined,
    noDirectRipple: isNoDirectRipple(tx) || undefined,
    limitQuality: isQualityLimited(tx) || undefined,
  });
}

export default parsePayment;