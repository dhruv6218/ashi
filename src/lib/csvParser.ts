import Papa from 'papaparse';

const normalizeHeader = (header: string) => header.toLowerCase().trim().replace(/\s+/g, '_');

export const processAccountsCsv = async (file: File, workspaceId: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          if (rows.length === 0) throw new Error("CSV is empty");

          const headers = Object.keys(rows[0]);
          if (!headers.includes('account_name')) throw new Error("Missing required column: account_name");

          // Simulate processing time
          setTimeout(() => resolve(rows.length), 1000);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
};

export const processSignalsCsv = async (file: File, workspaceId: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          if (rows.length === 0) throw new Error("CSV is empty");

          const headers = Object.keys(rows[0]);
          if (!headers.includes('signal_text')) throw new Error("Missing required column: signal_text");

          // Simulate processing time
          setTimeout(() => resolve(rows.length), 1000);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err)
    });
  });
};
