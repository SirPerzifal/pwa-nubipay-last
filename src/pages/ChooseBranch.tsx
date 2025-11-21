import React, { useState, useEffect } from "react";

import { fetchAllBranchesDatas } from "../utils/ExternalAPI";
import { BranchDataModel } from "../Models/Branch.model";
import "../assets/css/ChooseBrand.css";

const ChooseBranch: React.FC = () => {
  const [branches, setBranches] = useState<BranchDataModel[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBranches = async (): Promise<void> => {
      setLoading(true);
      try {
        const data = await fetchAllBranchesDatas();
        setBranches(data.branches);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          console.error("Failed to fetch branches:", err.message);
          setError(`Failed to load branches: ${err.message}`);
        } else {
          console.error("Failed to fetch branches with unknown error");
          setError("Failed to load branches. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadBranches();
  }, []);

  const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = Number(event.target.value);
    setSelectedBranch(branchId);

    // Simpan ke local storage
    if (branchId) {
      sessionStorage.setItem("BRANCH_ID", branchId.toString());
      console.log(sessionStorage.getItem("BRANCH_ID"));
    } else {
      sessionStorage.removeItem("BRANCH_ID");
    }
  };

  if (loading) {
    return <div>Loading branches...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="wrapper">
      <div className="branch-selector">
        <h2>Branches</h2>
        {branches.length === 0 ? (
          <p>No branches found</p>
        ) : (
          <div>
            <label htmlFor="branch-select">Choose a branch: </label>
            <select
              id="branch-select"
              onChange={handleBranchChange}
              value={selectedBranch || ""}
              className="underline-select"
            >
              <option value="">-- Select a branch --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} (ID: {branch.id})
                </option>
              ))}
            </select>

            {selectedBranch && (
              <p>
                You selected:{" "}
                {branches.find((b) => b.id === selectedBranch)?.name}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChooseBranch;
