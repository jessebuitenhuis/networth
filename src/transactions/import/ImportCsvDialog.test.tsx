import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { ImportCsvDialogPage } from "./ImportCsvDialog.page";

describe("ImportCsvDialog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Step 1: Upload", () => {
    it("renders Import CSV trigger button", () => {
      const page = ImportCsvDialogPage.render();
      expect(page.triggerButton).toBeInTheDocument();
    });

    it("opens dialog on click", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      expect(page.dialog).toBeInTheDocument();
    });

    it("shows file chooser button", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      expect(page.chooseFileButton).toBeInTheDocument();
    });

    it("advances to mapping step after valid file upload", async () => {
      const page = ImportCsvDialogPage.render();
      const csv = "Date,Amount,Description\n2024-01-15,100.00,Groceries";
      await page.open();
      await page.uploadFile(csv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toBeInTheDocument();
      });
    });

    it("shows error for empty CSV", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      await page.uploadFile("");

      expect(await screen.findByText(/empty/i)).toBeInTheDocument();
    });

    it("auto-detects column names from headers", async () => {
      const page = ImportCsvDialogPage.render();
      const csv = "Date,Amount,Description\n2024-01-15,100.00,Groceries";
      await page.open();
      await page.uploadFile(csv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toHaveTextContent("Date");
        expect(page.amountColumnSelect).toHaveTextContent("Amount");
        expect(page.descriptionColumnSelect).toHaveTextContent("Description");
      });
    });

    it("auto-detects Dutch column names", async () => {
      const page = ImportCsvDialogPage.render();
      const csv = "Datum,Bedrag,Omschrijving\n2024-01-15,100.00,Boodschappen";
      await page.open();
      await page.uploadFile(csv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toHaveTextContent("Datum");
        expect(page.amountColumnSelect).toHaveTextContent("Bedrag");
        expect(page.descriptionColumnSelect).toHaveTextContent("Omschrijving");
      });
    });

    it("auto-detects German column names", async () => {
      const page = ImportCsvDialogPage.render();
      const csv =
        "Buchungstag,Betrag,Verwendungszweck\n2024-01-15,100.00,Einkauf";
      await page.open();
      await page.uploadFile(csv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toHaveTextContent("Buchungstag");
        expect(page.amountColumnSelect).toHaveTextContent("Betrag");
        expect(page.descriptionColumnSelect).toHaveTextContent(
          "Verwendungszweck",
        );
      });
    });
  });

  describe("Step 2: Mapping", () => {
    const validCsv = "Date,Amount,Description\n2024-01-15,100.00,Groceries";

    it("shows CSV headers in column dropdowns", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      await page.uploadFile(validCsv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toBeInTheDocument();
      });

      await page.selectDateColumn("Date");
      expect(page.dateColumnSelect).toHaveTextContent("Date");
    });

    it("disables Next until all columns mapped", async () => {
      const page = ImportCsvDialogPage.render();
      const csv = "Col1,Col2,Col3\n2024-01-15,100.00,Groceries";
      await page.open();
      await page.uploadFile(csv);

      await waitFor(() => {
        expect(page.nextButton).toBeDisabled();
      });
    });

    it("navigates back to upload on Back click", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      await page.uploadFile(validCsv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toBeInTheDocument();
      });

      await page.clickBack();

      await waitFor(() => {
        expect(page.chooseFileButton).toBeInTheDocument();
      });
    });

    it("shows live mapping preview when all columns are mapped", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      await page.uploadFile(validCsv);

      await waitFor(() => {
        expect(screen.getByText("Mapping Preview")).toBeInTheDocument();
        // "Groceries" appears in both mapping preview and sample data
        expect(screen.getAllByText("Groceries")).toHaveLength(2);
      });
    });

    it("advances to preview on Next click", async () => {
      const page = ImportCsvDialogPage.render();
      await page.open();
      await page.uploadFile(validCsv);

      await waitFor(() => {
        expect(page.nextButton).toBeEnabled();
      });

      await page.clickNext();

      await waitFor(() => {
        expect(screen.getByText(/1 transaction/i)).toBeInTheDocument();
      });
    });
  });

  describe("Step 3: Preview", () => {
    const validCsv = "Date,Amount,Description\n2024-01-15,100.00,Groceries\n2024-01-16,-50.00,Gas";

    async function navigateToPreview(page: ImportCsvDialogPage, csv: string) {
      await page.open();
      await page.uploadFile(csv);
      await waitFor(() => {
        expect(page.nextButton).toBeEnabled();
      });
      await page.clickNext();
    }

    it("shows transaction count", async () => {
      const page = ImportCsvDialogPage.render();
      await navigateToPreview(page, validCsv);

      expect(await screen.findByText(/2 transactions/i)).toBeInTheDocument();
    });

    it("shows preview table with parsed data", async () => {
      const page = ImportCsvDialogPage.render();
      await navigateToPreview(page, validCsv);

      await waitFor(() => {
        expect(screen.getByText("Groceries")).toBeInTheDocument();
        expect(screen.getByText("Gas")).toBeInTheDocument();
      });
    });

    it("shows skipped rows warning when applicable", async () => {
      const page = ImportCsvDialogPage.render();
      const csvWithErrors = "Date,Amount,Description\n2024-01-15,100.00,Valid\ninvalid-date,100.00,Bad";
      await navigateToPreview(page, csvWithErrors);

      expect(await screen.findByText(/1 row.*skipped/i)).toBeInTheDocument();
    });

    it("disables Import when no valid transactions", async () => {
      const page = ImportCsvDialogPage.render();
      const csvAllInvalid = "Date,Amount,Description\ninvalid-date,100.00,Bad";
      await navigateToPreview(page, csvAllInvalid);

      await waitFor(() => {
        expect(page.importButton).toBeDisabled();
      });
    });

    it("imports all transactions on Import click", async () => {
      const page = ImportCsvDialogPage.render("test-account");
      await navigateToPreview(page, validCsv);

      await waitFor(() => {
        expect(page.importButton).toBeEnabled();
      });

      await page.clickImport();

      await waitFor(() => {
        const list = page.transactionsList;
        expect(list).toHaveTextContent("Groceries");
        expect(list).toHaveTextContent("Gas");
      });
    });

    it("closes dialog after import", async () => {
      const page = ImportCsvDialogPage.render();
      await navigateToPreview(page, validCsv);

      await waitFor(() => {
        expect(page.importButton).toBeEnabled();
      });

      await page.clickImport();

      await waitFor(() => {
        expect(page.queryDialog()).not.toBeInTheDocument();
      });
    });

    it("resets state when dialog reopened", async () => {
      const page = ImportCsvDialogPage.render();
      await navigateToPreview(page, validCsv);
      await page.clickImport();

      await waitFor(() => {
        expect(page.queryDialog()).not.toBeInTheDocument();
      });

      await page.open();

      await waitFor(() => {
        expect(page.chooseFileButton).toBeInTheDocument();
      });
    });
  });

  describe("Full flow", () => {
    it("completes end-to-end import of well-formed CSV", async () => {
      const page = ImportCsvDialogPage.render("my-account");
      const csv = "Date,Amount,Description\n2024-01-15,100.00,Salary\n2024-01-16,-50.00,Groceries";

      await page.open();
      await page.uploadFile(csv);

      await waitFor(() => {
        expect(page.dateColumnSelect).toBeInTheDocument();
      });

      await page.clickNext();

      await waitFor(() => {
        expect(screen.getByText(/2 transactions/i)).toBeInTheDocument();
      });

      expect(screen.getByText("Salary")).toBeInTheDocument();
      expect(screen.getByText("Groceries")).toBeInTheDocument();

      await page.clickImport();

      await waitFor(() => {
        const list = page.transactionsList;
        expect(list).toHaveTextContent("Salary");
        expect(list).toHaveTextContent("Groceries");
      });
    });
  });
});
