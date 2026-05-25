# Portfolio Accounting Dashboard

This Banana Accounting extension adds a portfolio dashboard for investment accounting files. It summarizes securities by currency and account, highlights the main KPIs, and lets the user inspect the average book cost history of a selected security.

## Dashboard UI

The dashboard opens from the Banana command **Portfolio Dashboard**.

### Header

The top area shows the reporting date, the base currency, and the current total market value of the portfolio.

The small counters show:

- **Securities**: active securities with a non-zero quantity.
- **Currencies**: number of currency buckets found in the current portfolio.
- **Accounts**: number of asset accounts used by the securities.

### KPI Cards

The main cards summarize the portfolio:

- **Book value**: current accounting carrying amount.
- **Unrealized G/L**: difference between current market value and book value.
- **Market prices**: number of securities without a current market price. When a price is missing, the dashboard uses the current average book cost as fallback.
- **Allocation**: number of currency buckets in the portfolio.

Positive gain/loss values are shown in green, negative values in red.

### Currency Allocation

This panel groups the portfolio by security/account currency. Each row shows:

- currency name,
- percentage weight in the total portfolio,
- market value in base currency,
- unrealized gain/loss for that currency group.

The horizontal bar is proportional to the group weight.

### Account Allocation

This panel groups the same portfolio data by Banana asset account. It is useful to check where the exposure sits in the accounting structure.

Each row shows:

- account,
- percentage weight,
- market value in base currency,
- unrealized gain/loss for that account group.

### Top Holdings

This table lists the largest securities by market value. Columns are:

- **Security**: description and item id/ISIN.
- **Currency value**: market value in the security currency.
- **Base value**: market value converted to the accounting base currency.
- **Weight**: share of the total portfolio.
- **Unrealized G/L**: unrealized gain or loss in base currency.

Click a row to open the security detail chart.

## Security Detail Chart

Clicking a top holding opens a modal chart with the evolution of the security's average book cost over time.

The chart is based on the same progressive data used by the security card report:

- opening quantity and value,
- transaction movements,
- progressive quantity balance,
- progressive average book cost.

The detail cards above the chart show:

- latest average cost,
- latest date,
- current quantity,
- number of chart points.

If the quantity reaches zero, those points are ignored because the average cost is not meaningful without a position.

## PDF Report

Use the **PDF report** button in the dashboard header to generate a Banana report preview. From the preview, use Banana's standard print/export workflow to create a PDF.

The exported report contains:

- portfolio KPI summary,
- currency allocation,
- account allocation,
- top holdings,
- average book cost chart for each top holding,
- detailed chart data table below each chart.

### Reading the PDF Charts

Each average cost chart shows:

- y-axis: average book cost in the security currency,
- x-axis: first and latest available movement dates,
- line: evolution of the progressive average book cost,
- dots: accounting movements that changed or confirmed the average cost.

Below each chart, the data table lists:

- movement date,
- average cost,
- quantity balance,
- printable bar representation,
- movement description.

The visual SVG chart is generated directly inside the extension and embedded into the Banana report. No external service or web API is required.

## Data Notes

The dashboard uses data from:

- `Items` table: item id, description, asset account, current quantity, current market price, currency and type.
- `Transactions` table and Banana journal/card APIs: movements, quantities, debit/credit values and progressive balances.

For multi-currency files, values are shown in security currency where useful and in base currency for portfolio-level comparisons.
