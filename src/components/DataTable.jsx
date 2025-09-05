import React, { useState, useMemo } from "react";
import "/src/index.css";

function getValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export default function DataTable({ data, columns, pageSize = 10 }) {
  const [filterText, setFilterText] = useState("");
  const [filterColumn, setFilterColumn] = useState(columns[0].key);
  const [sortConfig, setSortConfig] = useState([]); //for multi column sorting
  const [page, setPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(
    Object.fromEntries(columns.map(c => [c.key, true]))
  );
  const [editColumns, setEditColumns] = useState(false);

  const comparator = (a, b) => {
    if (a == null) return -1;
    if (b == null) return 1;
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return String(a).localeCompare(String(b));
  };

  //filtering
  const filteredData = useMemo(() => {
    if (!filterText) return data;
    return data.filter(row =>
      String(getValue(row, filterColumn) ?? "")
        .toLowerCase()
        .includes(filterText.toLowerCase())
    );
  }, [data, filterText, filterColumn]);

  //multi-column sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.length) return filteredData;
    return [...filteredData].sort((a, b) => {
      for (const { key, direction } of sortConfig) {
        const cmp = comparator(getValue(a, key), getValue(b, key));
        if (cmp !== 0) return direction === "desc" ? -cmp : cmp;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  //pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pageData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  //sorting handler
  const handleSort = key => {
    setPage(1);
    setSortConfig(prev => {
      const existing = prev.find(s => s.key === key);
      if (!existing) {
        return [...prev, { key, direction: "asc" }];
      } 
      else if (existing.direction === "asc") {
        return prev.map(s =>
          s.key === key ? { ...s, direction: "desc" } : s
        );
      } 
      else {
        return prev.filter(s => s.key !== key);
      }
    });
  };

  return (
    <div className="table-container">
      <div className="controls">
        <div className="filter-group">
          <label>Filter</label>
          <select
            value={filterColumn}
            onChange={e => setFilterColumn(e.target.value)}
          >
            {columns.map(c => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Search..."
          />
        </div>

        <button onClick={() => setEditColumns(p => !p)}>
          {editColumns ? "Done" : "Edit Columns"}
        </button>
      </div>

      <table>
        <thead>
            <tr>
                {columns.map(col => {
                const isVisible = visibleCols[col.key];
                if (!editColumns && !isVisible) return null; 

                return (
                    <th key={col.key}>
                    <div
                        className="header-cell"
                        onClick={() => handleSort(col.key)}
                    >
                        <span>{col.label}</span>
                        {(() => {
                        const sc = sortConfig.find(s => s.key === col.key);
                        if (!sc) return null;
                        const index =
                            sortConfig.findIndex(s => s.key === col.key) + 1;
                        return (
                            <span className="sort-indicator">
                            {sc.direction === "asc" ? "▲" : "▼"}
                            <sup>{index}</sup>
                            </span>
                        );
                        })()}
                    </div>

                    {editColumns && (
                        <div className="toggle">
                        <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() =>
                            setVisibleCols(prev => ({
                                ...prev,
                                [col.key]: !prev[col.key]
                            }))
                            }
                        />
                        </div>
                    )}
                    </th>
                );
                })}
            </tr>
        </thead>

        <tbody>
        {pageData.length ? (
            pageData.map(row => (
            <tr key={row.id}>
                {columns.map(col => {
                const isVisible = visibleCols[col.key];
                if (!editColumns && !isVisible) return null; 

                return (
                    <td
                    key={col.key}
                    style={!isVisible ? { display: "none" } : {}}
                    >
                    {getValue(row, col.key)}
                    </td>
                );
                })}
            </tr>
            ))
        ) : (
            <tr>
            <td colSpan={columns.length}>No results found.</td>
            </tr>
        )}
        </tbody>
      </table>

      {/* pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={page === i + 1 ? "active-page" : ""}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
