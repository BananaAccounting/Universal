# STRIPE IMPORT EXTENSIONS DOCUMENTATION

## Description

This extension allows to import more than one type of Stripe report, but it basically works in two ways: 

1. Import a report with all the transactions (Menu Payments->All Transactions->Export):
   This report contains multiple transaction rows for the same operation, to record correctly all
   these transactions, the user must indicate the accounts to be used in the dialogue proposed by the extension.
   transactions can be of the following types:
   * Payments - Transactions received from paying customers
   * Charges - Equal to the payments, are made not with credit cards but through an external platform connected to stripe.
   * Payouts - Funds transferred from Stripe to the bank account
   * Fees - Fees paid to Stripe, or to the Connect Platform in the form of Application Fees
   * Refunds - Funds returned to customers, if the credit card payment is disputed or withdrawn by the payer, reserved funds may also not be present, these funds are only taken from stripe in certain cases, depending on who is making the payment.
2. Import a report with only the payments amount (Menu Reports->Balance->Balance change from activity (All 63 columns)).
   This report contains only two types of movement:
   * risk_reserved_funds - Funds returned to customers, if the credit card payment is disputed or withdrawn by the payer
   * charge - Transactions received from paying customers
    We only work with the amount in **charge**, i.e. the amount that should eventually be credited to the stripe account holder.
    If the user uses this method, he must be sure that he has been re-credited with Refunds and that the amount he cashes in at the bank is therefore the full amount.
    If desired, the user can also import the transactions from the menu Payout reconciliation->Payout reconciliation (All 65 columns), the generated report contains the same information.

As an external reference we always use the **balance id** since all movements have it regardless of type. In this way, by selecting 'Do not import if the same reference, date and amount already exists', no duplicate entries are created whatever file is imported.

## Links

Useful links:
 * [Payment reports] https://support.stripe.com/questions/exporting-payment-reports.
 * [Balance report] https://stripe.com/docs/reports/balance
 * [General documentation] https://support.stripe.com/questions/reserves-frequently-asked-questions?locale=en-GB)
