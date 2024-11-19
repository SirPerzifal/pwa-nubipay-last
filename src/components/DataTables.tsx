import React, { useState } from 'react';
import '../assets/css/components/dataTables.css';

interface DataTablesProps {
  data: {
    date_order: string;
    outlet: string;
    machine_type_custom: string;
    machine_display_name: string;
    price: number;
    balance: number;
  }[];
}

const DataTables: React.FC<DataTablesProps> = ({ data }) => {
  const currencySymbol = ' ⓟ';
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter data berdasarkan searchQuery
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  // Calculate the data for the current page
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const paginatedData = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);

  const handleEntriesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when entries per page change
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to page 1 when search query changes
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage > 1 ? prevPage - 1 : prevPage));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage < totalPages ? prevPage + 1 : prevPage));
  };

  return (
    <div className="container-tabel">
      <div className="top-bar-tabel">
        <div>
          <label htmlFor="entries">Show</label>
          <select className="select-value-tabel" id="entries" value={entriesPerPage} onChange={handleEntriesChange}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <label htmlFor="entries">entries</label>
        </div>
        <div>
          <label htmlFor="search">Search:</label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="input-search-tabel"
          />
        </div>
      </div>
      <table className="data-tabel-style">
        <thead>
          <tr>
            <th>#</th>
            <th>TANGGAL</th>
            <th>OUTLET</th>
            <th>TIPE</th>
            <th>INFO</th>
            <th>JUMLAH</th>
            <th>BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item, index) => (
              <tr key={index}>
                <td>{indexOfFirstEntry + index + 1}</td>
                <td>{item.date_order}</td>
                <td>{item.outlet}</td>
                <td>{item.machine_type_custom}</td>
                <td>{item.machine_display_name}</td>
                <td>{item.price.toLocaleString()} {currencySymbol}</td>
                <td>{item.balance.toLocaleString()} {currencySymbol}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center' }}>
                No data available in table
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination-tabel">
        <div>
          Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
        </div>
        <div className="prev-next">
          <button className="prev" onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <button className="next" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTables;
