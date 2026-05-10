// frontend/src/components/ui/DataTable.jsx
import React from 'react';

export default function DataTable({ 
  columns, 
  data, 
  isLoading = false,
  emptyMessage = "Không có dữ liệu"
}) {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Wrapper có overflow-x-auto để cuộn ngang trên điện thoại */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index} 
                  className={`px-4 py-3 whitespace-nowrap ${
                    col.isSticky 
                      ? 'sticky right-0 bg-gray-50 z-10 border-l border-gray-200 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]' 
                      : ''
                  } ${col.width || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex justify-center"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                  <p className="mt-2 text-sm">Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  {columns.map((col, colIndex) => (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-3 ${
                        col.isSticky 
                          ? 'sticky right-0 bg-white group-hover:bg-gray-50/50 z-10 border-l border-gray-100 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] transition-colors' 
                          : ''
                      }`}
                    >
                      {/* Gọi hàm render riêng của cột nếu có, nếu không thì in ra giá trị mặc định */}
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}