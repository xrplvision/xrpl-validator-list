import { removeUndefined } from "../../v1/common";

export function parseNonFungibleTokenOfferChanges(tx: object): object {
  return new NonFungibleTokenOfferChanges(tx).call();
}

class NonFungibleTokenOfferChanges {
  public readonly tx: any;
  public readonly changes: any;

  public constructor(tx: any) {
    this.tx = tx;
    this.changes = {};
  }

  public call(): any {
    if (this.hasAffectedNodes() === false) {
      return this.changes;
    }

    for (const affectedNode of this.tx.meta.AffectedNodes) {
      this.parseAffectedNode(affectedNode);
    }

    return this.changes;
  }

  private addChange(account: string, change: any): void {
    if (!this.changes[account]) {
      this.changes[account] = [];
    }

    this.changes[account].push(removeUndefined(change));
  }

  private hasAffectedNodes(): boolean {
    if (this.tx.meta?.AffectedNodes === undefined) {
      return false;
    }

    if (this.tx.meta?.AffectedNodes?.length === 0) {
      return false;
    }

    return true;
  }

  private parseAffectedNode(affectedNode: any): void {
    if (this.isNFTokensCreateOfferNode(affectedNode)) {
      this.parseNFTokensCreateOfferNode(affectedNode);
    } else if (this.isNFTokensDeleteOfferNode(affectedNode)) {
      this.parseNFTokensDeleteOfferNode(affectedNode);
    }
  }

  private isNFTokensCreateOfferNode(affectedNode: any): boolean {
    return affectedNode.CreatedNode?.LedgerEntryType === "NFTokenOffer" && affectedNode.CreatedNode?.NewFields;
  }

  private parseNFTokensCreateOfferNode(affectedNode: any): void {
    const status: string = "created";
    const amount: string = affectedNode.CreatedNode.NewFields.Amount;
    const flags: string = affectedNode.CreatedNode.NewFields.Flags;
    const tokenID: string = affectedNode.CreatedNode.NewFields.TokenID;
    const owner: string = affectedNode.CreatedNode.NewFields.Owner;
    const index: string = affectedNode.CreatedNode.LedgerIndex;

    this.addChange(this.tx.Account, { status, amount, flags, tokenID, owner, index });
  }

  private isNFTokensDeleteOfferNode(affectedNode: any): boolean {
    return affectedNode.DeletedNode?.LedgerEntryType === "NFTokenOffer" && affectedNode.DeletedNode?.FinalFields;
  }

  private parseNFTokensDeleteOfferNode(affectedNode: any): void {
    const status: string = "deleted";
    const amount: string = affectedNode.DeletedNode.FinalFields.Amount;
    const flags: string = affectedNode.DeletedNode.FinalFields.Flags;
    const tokenID: string = affectedNode.DeletedNode.FinalFields.TokenID;
    const owner: string = affectedNode.DeletedNode.FinalFields.Owner;
    const index: string = affectedNode.DeletedNode.LedgerIndex;

    this.addChange(owner, { status, amount, flags, tokenID, owner, index });
  }
}