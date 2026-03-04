export type LinkedAccountType = "google" | "github"

export interface LinkedAccount {
  type: LinkedAccountType
  linkedAt: number
}

export class AccountLinkService {

  private getKey(wallet: string) {
    return `superteam:${wallet}:linkedAccounts`
  }

  getLinkedAccounts(wallet: string): LinkedAccount[] {
    if (typeof window === "undefined") return []
    const raw = localStorage.getItem(this.getKey(wallet))
    if (!raw) return []
    return JSON.parse(raw)
  }

  link(wallet: string, type: LinkedAccountType) {
    const accounts = this.getLinkedAccounts(wallet)

    if (accounts.some(a => a.type === type)) return

    accounts.push({
      type,
      linkedAt: Date.now(),
    })

    localStorage.setItem(
      this.getKey(wallet),
      JSON.stringify(accounts)
    )
  }
}