import React, { useEffect, useState } from 'react';
import { SheetData } from '../../types';

interface ExcelViewerProps {
  sheets?: SheetData[];
  isLoading: boolean;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({ sheets, isLoading }) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  useEffect(() => {
    setActiveSheetIndex(0);
  }, [sheets?.length]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">Loading workbook...</div>
    );
  }

  if (!sheets || sheets.length === 0) {
    return <div className="h-full flex items-center justify-center text-slate-400">No sheet data available.</div>;
  }

  const activeSheet = sheets[activeSheetIndex];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex border-b border-slate-200 bg-white">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.name}
            onClick={() => setActiveSheetIndex(index)}
            className={`px-6 py-3 text-sm font-medium border-r border-slate-200 ${
              index === activeSheetIndex ? 'bg-white text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {activeSheet.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-slate-50 text-slate-700 font-semibold' : 'text-slate-600'}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 border-b border-slate-100 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;
